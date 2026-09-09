# Micro Dose Syndicate for Pebble

By Luke Steuber. Native testing build 0.3.0.

A fictional calculator-era economy adapted for Pebble. The dashboard has a city silhouette, a large cash plaque, labeled credibility/heat meters and an outlined setting card with an accent tab. Menus use an accent tab and outline to identify selection. The current development version adds a career campaign and a deliberate way to reduce heat. Read the night's intel, set price, quantity, quality and distribution, then run the night. Grow cash and credibility while keeping heat below 100. Negative cash ends the run; heat at 100 brings a bust.

- Up/Down browse Price, Cook, Quality, Lane, District, Front, Run night, Career, and Lay low.
- Select opens a setting. Up/Down adjust it; Select returns to the dashboard. Back also leaves the editor with its current values.
- On the dashboard, tap the displayed setting to edit; the bottom left/right areas browse settings.
- In an editor, tap left/right to decrease/increase. Tap Select to keep to finish.
- Districts and fronts show their price and require a separate purchase confirmation. Owned items cannot be charged twice.
- Run night produces a report; dismiss it before another night can run.
- Back pauses; New empire requires confirmation.

This first watch adaptation includes the original core demand, quality, credibility and heat formulas, six districts and four passive-income fronts. District ownership gives a compact reach bonus. It omits the browser's crew roster, asset upgrades, rival simulation, challenges and prestige systems. Those are not hidden unlocks in this build. Unsold stock is not carried into the next night. This uses the original Syndicate theme, not Street Eats.

The Career card shows your level, the next unfinished objective and the next unlock. Promotions are permanent within the campaign; spending cash does not remove them. Net earnings count night profits and losses, including front income, but exclude property purchase costs. A profitable night is a completed trading night with positive net income. A quiet profitable night ends below 50 heat.

| Level | Rank | Requirements | New access |
| --- | --- | --- | --- |
| 1 | Runner | Starting rank | Solo corners, East Side |
| 2 | Dealer | 3 profitable nights, $1,500 net earned | Bike runners, Docks |
| 3 | Operator | $5,000 net earned, 2 districts | Clubs, Industrial, Suburbs, laundromat |
| 4 | District Boss | $12,000 net earned, 3 districts, 1 front | Heights, dispensary |
| 5 | Syndicate Chief | $30,000 net earned, 4 districts, 2 fronts, a quiet profitable night | Ghost lockers, crypto mixer, restaurant |
| 6 | Empire | $60,000 net earned, all 6 districts, 3 fronts, heat below 60 | Campaign victory; optional continued play |

The three-profitable-night requirement remains part of every promotion. No promotion grants cash, so reopening a report cannot duplicate a reward. Promotion reports show the new rank over the expansion postcard. Reaching Empire is the campaign win; bankruptcy and heat 100 remain failure conditions during continued play.

Lay low advances one night, costs $150 in expenses, reduces heat by 18 and credibility by 1, and still collects front income. It preserves the next trading plan. A lay-low night does not count toward profitable-trading-night objectives. Its report identifies the action instead of claiming inventory was offered for sale.

The new save stores finances, career and ownership together in alternating checksummed records. Interrupted writes preserve the previous valid campaign. A failed save pauses play and offers retry. Older saves retain their exact financial state, owned properties and access to all four previously available lanes. Their career counters start at zero; unknown historical earnings are never inferred from cash. The old single-record save remains as a recovery source. New empire still resets the whole campaign after confirmation.

These career changes are not yet in the archived 0.3.0 package. A simple forecast-aware campaign simulation reached Empire in 200/200 seeds, averaging 76 nights. This proves reachability for that strategy, not human difficulty or session length.

Source: this repository's `game.js`, starting at `7a13b01`. No real substance-production instructions or network services are involved.

## Illustrated reports

Each completed night shows a 144 by 64 pixel city postcard: quiet rooftops, a bright shop and bicycle, rain and shutters, a patrol car and barricade, a club queue, an empty loading dock, or a boarded shop after bankruptcy. Successful purchases show scaffolding and a key. Failed purchases retain their actual message and a quiet scene.

The report uses the completed night, not tomorrow's forecast. Bust and bankruptcy take priority, then high/rising heat, losses, shortages, nightlife and strong profits. Cosmetic variation never advances the economy random generator. Drawings provide shape cues alongside color. Art is bundled offline and released from memory when leaving a report.

City backdrop: FabinhoSC's CC0 Skyline Background. See `src/art/CREDITS.md` for provenance. Foreground drawings by Luke Steuber.

## Build and test

Requires Pebble SDK 4.33.1 and pebble-tool. From this directory:

```sh
pebble build
sh test/core.sh
```

Run `test/emulator.py emery` and `test/emulator.py gabbro` with pebble-tool's Python environment. The tests install the exact PBW into isolated profiles, drive native buttons and touch, exercise saved-state recovery, and capture screenshots and logs. `tools/package.py` refuses to stage a PBW without matching passing reports.

## Compatibility and validation boundary

Targets: Pebble Time 2 (`emery`, 200 by 228) and Pebble Round 2 (`gabbro`, 260 by 260). Native C; no phone code, network access, or account required. Touch subscription is enabled only on firmware 4.33.2 or newer. Buttons provide all game actions.

Native emulator validation uses firmware 4.33.2. Older firmware and physical watches are unverified. The firmware check alone does not prove compatibility with an older app loader. Physical touch accuracy, readability and battery behavior need device testing. Luke's separate Hexsweeper launch failure is unresolved; these packages are testing builds, not a claim that the watch connection or launch issue has been fixed.

Packaged artifacts live under `release/0.3.0/`, including PBW, standalone native source, screenshots, reports and SHA-256 sums. Version 0.2.0 has an Unlisted store draft. This 0.3.0 candidate is staged locally.
