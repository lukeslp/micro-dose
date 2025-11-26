# Repository Guidelines

## Project Structure & Module Organization
All gameplay lives in three top-level files: `index.html` binds the DOM, `styles.css` defines the responsive layout, and `game.js` contains every mechanic (state machine, random events, marketing tiers). Art assets (`social-card.png`, `icon.svg`) sit beside the source so preview links resolve without extra config. Keep any new data files or helper scripts in the repo root unless you introduce a clearly named subfolder (for example, `assets/audio/` or `scripts/qa/`).

## Build, Test, and Development Commands
This project is framework-free; static hosting is enough. Use `python3 -m http.server 4173` from the repo root for a quick local server, or run `npx serve .` if you already have Node installed. Open `http://localhost:4173/index.html` (or the port chosen by `serve`) to exercise UI changes. No bundling is required; edit-and-refresh is the normal loop.

## Coding Style & Naming Conventions
Match the existing vanilla JS style: 4-space indentation, `const`/`let` for declarations, descriptive camelCase identifiers (`gameState`, `renderMarketingOptions`). Keep UI class names in kebab-case (`.marketing-option`). Favor template literals over string concatenation, and avoid introducing build-time tooling unless absolutely necessary. When adding sections in HTML, prefer semantic containers (`section`, `article`) and keep CSS organized by feature blocks with clear comment headers.

## Testing Guidelines
There is no automated test harness, so rely on scenario-based manual tests. Smoke-test every change across at least three daily setups: (1) low traffic + high price, (2) festival event + marketing boost, (3) depletion scenario (units below demand). If you introduce deterministic helpers, write lightweight inline assertions (e.g., temporary `console.assert`) and remove them before committing. Document any repeatable QA scripts under `scripts/` so other contributors can reuse them.

## Commit & Pull Request Guidelines
The current log only shows very short summaries (e.g., `test`). Move toward `<type>: <imperative summary>` (`feat: add marketing upgrades UI`) so reviewers can scan history quickly. Each PR should include: a one-paragraph description, bullet list of player-visible changes, manual test notes (scenarios + results), and screenshots or GIFs when UI shifts. Reference related issues in the PR body (`Closes #12`). Keep branches rebased on `master` and squash before merging unless multiple commits add review clarity.

## Security & Configuration Tips
No secrets should live in this repo—use `.env.local` (gitignored) if you later integrate APIs. Browser storage features (localStorage, IndexedDB) must guard against undefined data and support manual reset (button or devtool instructions). When adding external libraries, pin exact versions in a lockfile or vendor the script locally to keep offline play intact.
