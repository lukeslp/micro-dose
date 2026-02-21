# Micro Dose Syndicate

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://dr.eamer.dev/games/micro-dose/)

Modern neon UI meets the cult-classic 90s "drug dealer" sim. Run a clandestine micro-dose lab, read street intel, tune your purity, and grow an empire without letting the Task Force or bankruptcy crush your timeline.

## Overview

- **Theme** – neon-soaked, UX-forward take on the calculator-era classic
- **Loop** – scan intel → choose price/purity/cook count/distribution → run the night → parse the Street Wire
- **Goal** – stack cash while balancing cred growth and rising heat

## Core Systems

- **Cred**: social proof of your synthwork. Clean cuts and sell-outs raise it, greed drops it, and higher cred multiplies demand.
- **Heat**: vice attention. High-risk distribution, premium purity, or special events spike it. If it reaches 100, the Task Force busts you.
- **Purity slider**: stretch product down to 60% or go 100% luxury. Changes demand, per-unit cost, and heat gains.
- **Distribution lanes**: solo corners, bike runners, club residencies, or ghost lockers—each alters upfront costs, reach, and heat.
- **Intel grid**: nightly vibe, flow, and special events (underground raves, vice sweeps, influencer drops) that reshape demand or heat.

## How to Play

1. Serve the folder with `python3 -m http.server 4173` (or any static host) and open `http://localhost:4173/index.html`.
2. Review the intel grid for vibe/flow plus any active event.
3. Set your bag price, how many to cook, desired purity, and distribution lane.
4. Hit **Run Night** and watch the charts/logs update.
5. Track cash, cred, heat, and nightly breakdowns in the **Crew Intel** panel.
6. Pivot between growth and stealth before cash hits zero or heat hits 100.

## Failure States

- **Crew Broke**: cash balance dips below zero.
- **Task Force Bust**: heat reaches 100, triggering a raid.

## Controls

- **Price per bag** – recommended $60–$160; whales pay more but raise heat.
- **Bags to cook** – total product prepped for the night (unsold bags become leftovers).
- **Cut quality** – range input from 60–100% purity.
- **Distribution lane** – radio options for each strategy with reach/heat summaries.
- **Run Night / Restart Game** – simulate or reset the timeline.

## Tech Notes

- Vanilla HTML, CSS, and JavaScript—no build tooling.
- HTML5 Canvas chart for the cash timeline.
- Responsive CSS grid plus glass/neon styling.
- Works offline once the page and assets are cached.

## Structure

```
micro-dose/
├── index.html    # Markup + layout
├── styles.css    # Neon/glass visual theme
├── game.js       # State machine + sim logic
└── README.md     # This file
```

## Quick Tips

- Ghost lockers and club residencies spike reach but pump heat—sprinkle low-profile nights between big pushes.
- Purity above 90% wins cred but costs more and draws attention.
- Solo runs with low inventory bleed off heat if you're in danger of a bust.
- Watch the cash chart slope; sustained dips mean you should drop price or batches immediately.

Have fun rewriting playground legend history.
