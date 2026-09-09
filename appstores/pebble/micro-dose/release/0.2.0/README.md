# Micro Dose Syndicate for Pebble

By Luke Steuber. Native testing build 0.2.0.

A fictional calculator-era economy adapted for Pebble. Version 0.2 gives the dashboard a city silhouette, a large cash plaque, labeled credibility/heat meters and an outlined setting card with an accent tab. Menus use an accent tab and outline to identify selection. Existing saves and economy rules are unchanged. Read the night's intel, set price, quantity, quality and distribution, then run the night. Grow cash and credibility while keeping heat below 100. Negative cash ends the run; heat at 100 brings a bust.

- Up/Down browse Price, Cook, Quality, Lane, District, Front, and Run night.
- Select opens a setting. Up/Down adjust it; Select returns to the dashboard. Back also leaves the editor with its current values.
- On the dashboard, tap the displayed setting to edit; the bottom left/right areas browse settings.
- In an editor, tap left/right to decrease/increase. Tap Select to keep to finish.
- Districts and fronts show their price and require a separate purchase confirmation. Owned items cannot be charged twice.
- Run night produces a report; dismiss it before another night can run.
- Back pauses; New empire requires confirmation.

This first watch adaptation includes the original core demand, quality, credibility and heat formulas, six districts and four passive-income fronts. District ownership gives a compact reach bonus. It omits the browser's crew roster, asset upgrades, rival simulation, challenges and prestige systems. Those are not hidden unlocks in this build. Unsold stock is not carried into the next night. This uses the original Syndicate theme, not Street Eats.

Source: this repository's `game.js`, starting at `7a13b01`. No real substance-production instructions or network services are involved.

## Build and test

Requires Pebble SDK 4.33.1 and pebble-tool. From this directory:

```sh
pebble build
mkdir -p build
clang -std=c11 -Wall -Wextra -fsanitize=address,undefined test/core.c src/c/game.c -lm -o build/core-test
build/core-test
```

Run `test/emulator.py emery` and `test/emulator.py gabbro` with pebble-tool's Python environment. The tests install the exact PBW into isolated profiles, drive native buttons and touch, exercise saved-state recovery, and capture screenshots and logs. `tools/package.py` refuses to stage a PBW without matching passing reports.

## Compatibility and validation boundary

Targets: Pebble Time 2 (`emery`, 200 by 228) and Pebble Round 2 (`gabbro`, 260 by 260). Native C; no phone code, network access, or account required. Touch subscription is enabled only on firmware 4.33.2 or newer. Buttons provide all game actions.

Native emulator validation uses firmware 4.33.2. Older firmware and physical watches are unverified. The firmware check alone does not prove compatibility with an older app loader. Physical touch accuracy, readability and battery behavior need device testing. Luke's separate Hexsweeper launch failure is unresolved; these packages are testing builds, not a claim that the watch connection or launch issue has been fixed.

Packaged artifacts live under `release/0.2.0/`, including PBW, standalone native source, screenshots, reports and SHA-256 sums. Nothing has been published to a store.
