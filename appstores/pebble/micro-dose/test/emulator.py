"""Luke Steuber. Drive the installed PBW through native buttons and QMP touch.

Run with pebble-tool's Python after `pebble build`. Each run owns a fresh profile.
No AppMessage test backdoor is compiled into the game.
"""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import tempfile
import time
from types import SimpleNamespace
from uuid import UUID

SDK_VERSION = '4.33.1'
SDK = Path.home() / 'Library/Application Support/Pebble SDK/SDKs' / SDK_VERSION
os.environ['PEBBLE_QEMU_PATH'] = str(SDK / 'toolchain/bin/qemu-pebble')
os.environ['PATH'] = str(SDK / 'toolchain/bin') + os.pathsep + os.environ['PATH']
import png
from pebble_tool.commands.screenshot import ScreenshotCommand
from pebble_tool.commands.emucontrol import send_data_to_qemu
import pebble_tool.sdk.emulator as emulator
from libpebble2.services.install import AppInstaller
from libpebble2.protocol.apps import AppRunState, AppRunStateStart, AppRunStateStop
from libpebble2.protocol.logs import AppLogMessage, AppLogShippingControl
from libpebble2.communication.transports.qemu.protocol import QemuButton

ROOT = Path(__file__).resolve().parent.parent
PBW = ROOT / 'build' / (ROOT.name + '.pbw')
APP = UUID(json.loads((ROOT / 'package.json').read_text())['pebble']['uuid'])


def run(platform):
    installed_sha = hashlib.sha256(PBW.read_bytes()).hexdigest()
    out = ROOT / 'build/evidence'
    out.mkdir(exist_ok=True)
    state = Path(tempfile.mkdtemp(prefix='emu-', dir=ROOT / 'build'))
    # macOS Unix sockets have short paths; a loopback QMP port avoids that limit.
    with socket.socket() as reservation:
        reservation.bind(('127.0.0.1', 0))
        qmp_port = reservation.getsockname()[1]
    def persist(target, version=None):
        p = state / target
        p.mkdir(exist_ok=True)
        return str(p)
    emulator.get_sdk_persist_dir = persist
    emulator.get_emulator_info_path = lambda: str(state / 'emulators.json')
    emulator.get_default_account = lambda: SimpleNamespace(is_logged_in=False)
    bridge = (out / f'{platform}-bridge.log').open('w')
    emulator.ManagedEmulatorTransport._get_output = lambda self: bridge
    cmd = ScreenshotCommand()
    cmd._set_debugging(0)
    def shutdown():
        info = emulator.get_emulator_info(platform, SDK_VERSION)
        if info:
            for key in ('qemu', 'pypkjs', 'websockify'):
                pid = info.get(key, {}).get('pid')
                if pid:
                    ps = subprocess.run(['ps', '-p', str(pid), '-o', 'command='], capture_output=True, text=True)
                    if ps.returncode == 0 and str(state / platform) not in ps.stdout:
                        raise RuntimeError(f'PID {pid} belongs to a different profile')
        cmd._shutdown_platform_emulator(platform, SDK_VERSION)
    original_popen = subprocess.Popen
    def popen(argv, *args, **kwargs):
        if isinstance(argv, list) and Path(argv[0]).name == 'qemu-pebble':
            argv = argv + ['-qmp', f'tcp:127.0.0.1:{qmp_port},server=on,wait=off']
        return original_popen(argv, *args, **kwargs)
    try:
        subprocess.Popen = popen
        watch = cmd._connect_emulator(platform, SDK_VERSION)
        cmd.pebble = watch
    except BaseException:
        shutdown()
        bridge.close()
        raise
    finally:
        subprocess.Popen = original_popen
    qmp_socket = socket.create_connection(('127.0.0.1', qmp_port), timeout=5)
    qmp = qmp_socket.makefile('rwb')
    assert 'QMP' in json.loads(qmp.readline())
    def execute(command, arguments=None):
        qmp.write((json.dumps({'execute': command, 'arguments': arguments or {}}) + '\n').encode())
        qmp.flush()
        while True:
            response = json.loads(qmp.readline())
            if 'error' in response:
                raise RuntimeError(response)
            if 'return' in response:
                return response['return']
    execute('qmp_capabilities')
    logs, frames = [], []
    def log(packet):
        line = str(packet.message)
        logs.append(line)
        if 'MD ' in line:
            print(line, flush=True)
    handle = watch.register_endpoint(AppLogMessage, log)
    watch.send_packet(AppLogShippingControl(enable=True))
    def current():
        for line in reversed(logs):
            if 'MD screen=' in line:
                state = {k: int(v) for k, v in re.findall(r'(\w+)=(-?\d+)', line)}
                for career in reversed(logs):
                    if 'MD career ' in career:
                        state.update({k: int(v) for k, v in re.findall(r'(\w+)=(-?\d+)', career)})
                        break
                return state
        raise AssertionError('No native state received')
    def count():
        return sum('MD screen=' in line for line in logs)
    def response(previous):
        deadline = time.monotonic() + 4
        while count() == previous and time.monotonic() < deadline:
            time.sleep(.02)
        assert count() > previous, 'Native input did not respond'
        time.sleep(.1)
    def button(name, hold=.07):
        previous = count()
        send_data_to_qemu(watch.transport, QemuButton(state=getattr(QemuButton.Button, name)))
        time.sleep(hold)
        send_data_to_qemu(watch.transport, QemuButton(state=0))
        if previous:
            response(previous)
        else:
            time.sleep(.2)
    def expect(**values):
        actual = current()
        assert all(actual[k] == v for k, v in values.items()), (values, actual)
    def grab(name):
        time.sleep(.15)
        pixels = cmd._grab_processed_image(argparse.Namespace(no_correction=True, scale=1, no_open=True, v=0), show_progress=False)
        file = out / f'{platform}-{name}.png'
        png.from_array(pixels, mode='RGBA;8').save(str(file))
        frames.append(str(file.relative_to(ROOT)))
        return pixels
    width, height = (200, 228) if platform == 'emery' else (260, 260)
    x, y = width // 2, 105 if platform == 'emery' else 126
    def pointer(px, py, down):
        events = [{'type': 'abs', 'data': {'axis': axis, 'value': round(value * 32767 / (size - 1))}}
                  for axis, value, size in [('x', px, width), ('y', py, height)]]
        events.append({'type': 'btn', 'data': {'button': 'left', 'down': down}})
        execute('input-send-event', {'events': events})
    def touch(points, interval=.05):
        previous = count()
        for px, py in points:
            pointer(px, py, True)
            time.sleep(interval)
        pointer(*points[-1], False)
        response(previous)
    try:
        time.sleep(4)
        button('Back')
        AppInstaller(watch, str(PBW)).install()
        watch.send_packet(AppRunState(data=AppRunStateStart(uuid=APP)))
        time.sleep(1)
        expect(screen=2)
        grab('help')
        button('Select')
        expect(screen=0)
        grab('map')
        button('Select');expect(screen=4)
        touch([(width*3//4,100)])
        grab('edit')
        touch([(width//2, height - (66 if platform == 'gabbro' else 46) + 18)])
        expect(screen=0)
        for _ in range(3): button('Up')
        expect(choice=6)
        button('Select');expect(screen=5,day=2)
        grab('report')
        button('Select');expect(screen=0)
        before=current()
        watch.send_packet(AppRunState(data=AppRunStateStop(uuid=APP)))
        time.sleep(.5)
        watch.send_packet(AppRunState(data=AppRunStateStart(uuid=APP)))
        time.sleep(.8)
        expect(screen=0,day=before['day'],cash=before['cash'])
        for _ in range(4): button('Down')
        button('Select');expect(screen=4)
        button('Select');expect(screen=6)
        grab('purchase')
        button('Select');expect(screen=0,cash=before['cash'])
        button('Back');expect(screen=1);grab('pause')
        touch([(width//2, 58 + 2 * 38 + 18)])
        expect(screen=3);grab('confirm')
        touch([(width//2, 132 + 18)]);expect(screen=0)
        # A denied purchase must show its actual message, never expansion art.
        button('Select');expect(screen=4)
        button('Select');expect(screen=6)
        button('Down');button('Select');expect(screen=5)
        assert any('report_scene=0' in x and 'purchase=1' in x for x in logs)
        grab('purchase-denied')
        touch([(width//2, height//2)]);expect(screen=0)
        # Zero production gives repeatable losses without changing the binary.
        for _ in range(3): button('Up')
        expect(choice=1)
        button('Select')
        for _ in range(6): button('Up')
        button('Select')
        for _ in range(5): button('Down')
        expect(choice=6)
        for n in range(32):
            day = current()['day']
            button('Select');expect(screen=5)
            assert any(f'report_day={day} ' in x for x in logs)
            grab('loss-' + str(n))
            over = current()['over']
            touch([(width//2,height//2)]);expect(screen=0)
            if over:
                grab('terminal')
                break
        assert over, 'Expected bankruptcy from repeated zero-production nights'
        # Start a fresh campaign and earn a promotion through normal night actions.
        button('Back');button('Down');button('Down');button('Select')
        button('Down');button('Select');expect(screen=0,rank=0,day=1)
        button('Down');expect(choice=1)
        button('Select')
        for _ in range(3): button('Up') # 15 units, no test-only economic overrides.
        button('Select')
        for _ in range(5): button('Down')
        for night in range(12):
            button('Select');expect(screen=5,over=0)
            if current()['rank']:
                grab('promotion')
                button('Select')
                break
            button('Select')
        assert current()['rank'] == 1
        button('Down');expect(choice=7)
        button('Select');expect(screen=7);grab('career')
        button('Select');expect(screen=0)
        button('Down');expect(choice=8)
        grab('lay-low-plan')
        before=current()
        button('Select');expect(screen=5,day=before['day']+1,cash=before['cash']-150,
                                heat=max(0,before['heat']-18),rank=1)
        grab('lay-low')
        button('Select')
        before=current()
        watch.send_packet(AppRunState(data=AppRunStateStop(uuid=APP)))
        time.sleep(.5)
        watch.send_packet(AppRunState(data=AppRunStateStart(uuid=APP)))
        time.sleep(.8)
        expect(screen=0,rank=1,earned=before['earned'],cash=before['cash'])
        assert not any('fault' in x.lower() or 'crash' in x.lower() for x in logs)
        report={'platform':platform,'sdk':SDK_VERSION,'pbwSHA256':installed_sha,'passed':True,'checks':['launch','help','edit plan','run night and report','save and relaunch','touch edit and enlarged keep row','enlarged menu and confirmation touch rows','cancel purchase','cancel reset','denied purchase report','completed-night numbering','repeated illustrated reports','touch report dismissal','terminal report','earned promotion','career objectives','lay low cost and heat','rank and earnings resume'],'frames':frames,'logs':logs}
        (out/f'{platform}-report.json').write_text(json.dumps(report,indent=2))
        print('PASS',platform)
    finally:
        (out/f'{platform}-app.log').write_text('\n'.join(logs))
        watch.unregister_endpoint(handle)
        cmd._close_pebble_connection(watch)
        cmd.pebble=None
        qmp.close(); qmp_socket.close(); shutdown(); bridge.close()

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('platform',choices=['emery','gabbro'])
    run(parser.parse_args().platform)
