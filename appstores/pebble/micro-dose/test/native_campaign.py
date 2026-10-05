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
    out = ROOT / 'build/campaign-evidence'
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
                for assets in reversed(logs):
                    if 'MD assets ' in assets:
                        state.update({k:int(v) for k,v in re.findall(r'(\w+)=(-?\d+)', assets)})
                        break
                return state
        raise AssertionError('No native state received')
    def count():
        return sum('MD screen=' in line for line in logs)
    def response(previous):
        deadline = time.monotonic() + 4
        while count() == previous and time.monotonic() < deadline:
            time.sleep(.02)
        if count() == previous:
            pixels = cmd._grab_processed_image(argparse.Namespace(no_correction=True, scale=1, no_open=True, v=0), show_progress=False)
            png.from_array(pixels, mode='RGBA;8').save(str(out / f'{platform}-input-failure.png'))
            raise AssertionError('Native input did not respond; failure frame saved')
        time.sleep(.2)
    def button(name, hold=.2):
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
    selected = [1,0]
    promoted = {0}
    def choose(index):
        expect(screen=0)
        while current()['choice'] != index:
            touch([(width*3//4,height-(45 if platform=='gabbro' else 25)+11)])
    def open_plan():
        touch([(width//2,175)])
    def promotion():
        rank = current()['rank']
        if rank not in promoted:
            promoted.add(rank); grab(f'promotion-{rank+1}')
            print(f'CAREER rank {rank+1}',flush=True)
    def dismiss():
        expect(screen=5,over=0); promotion(); touch([(width//2,height//2)]); expect(screen=0)
    def restart():
        before=current()
        watch.send_packet(AppRunState(data=AppRunStateStop(uuid=APP)));time.sleep(.5)
        watch.send_packet(AppRunState(data=AppRunStateStart(uuid=APP)));time.sleep(.8)
        # Screen, focused plan and pause-menu highlight are transient UI state.
        expect(**{k:v for k,v in before.items() if k not in ('screen','choice','menu')})
        selected[:] = [1,0]
    def invest(kind):
        state=current(); rank=state['rank']; owned=state['fronts' if kind else 'territories']
        targets=([1,2,3,4,6,6],[0,0,1,2,3,3])[kind]
        if owned.bit_count() >= targets[rank]: return
        costs=([0,3000,5000,8000,6500,4500],[8000,12000,15000,20000])[kind]
        requirements=([0,0,1,3,2,2],[2,4,3,4])[kind]
        options=[i for i in range(len(costs)) if not owned&(1<<i) and requirements[i]<=rank]
        if not options: return
        item=min(options,key=lambda i:costs[i]);price=costs[item]
        if state['cash'] < price+1000: return
        choose(4+kind);open_plan();expect(screen=4)
        while selected[kind]!=item:
            button('Down')
            selected[kind]=(selected[kind]+1)%4 if kind else 1+selected[kind]%5
        touch([(width//2,height-(66 if platform=='gabbro' else 46)+18)]);expect(screen=6)
        touch([(width//2,178+18)])
        expect(cash=state['cash']-price,**{'fronts' if kind else 'territories':owned|(1<<item)})
        dismiss()
    try:
        time.sleep(4);button('Back')
        AppInstaller(watch,str(PBW)).install()
        watch.send_packet(AppRunState(data=AppRunStateStart(uuid=APP)));time.sleep(1)
        expect(screen=2);button('Select');expect(rank=0,day=1)
        choose(1);open_plan()
        for _ in range(3):button('Up') # Default 30 units becomes 15.
        button('Select')
        resumed=False
        for night in range(400):
            if current()['rank']==5:break
            day=current()['day'];choose(8 if current()['heat']>45 else 6)
            open_plan();expect(day=day+1,over=0);dismiss()
            invest(0);invest(1)
            if current()['rank']>=3 and not resumed:
                restart();resumed=True;grab('career-resume')
        expect(rank=5,over=0);assert promoted==set(range(6)) and resumed
        choose(7);button('Select');expect(screen=7);grab('empire-career')
        button('Select');restart();expect(rank=5)
        day=current()['day'];choose(8 if current()['heat']>45 else 6)
        open_plan();expect(day=day+1,rank=5,over=0);grab('after-empire');dismiss()
        assert hashlib.sha256(PBW.read_bytes()).hexdigest()==installed_sha
        assert not any('fault' in line.lower() or 'crash' in line.lower() for line in logs)
        report={'platform':platform,'pbwSHA256':installed_sha,'passed':True,'sdk':SDK_VERSION,
                'checks':['touch navigation and plan controls across a complete campaign','all six career levels','earned property purchases','heat recovery',
                          'career and property resume','Empire goal','play continues after Empire'],
                'frames':frames,'logs':logs}
        (out/f'{platform}-report.json').write_text(json.dumps(report,indent=2))
        print('PASS CAMPAIGN',platform,flush=True)
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
