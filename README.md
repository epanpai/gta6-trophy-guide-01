# Vice Legend — GTA VI Trophy Guide & Tracker

[![Make GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/epanpai/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/epanpai/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

Entry for the [Make GTA 6 Trophy Guide](https://make.fun/bounty/gta6-trophy-guide-01) bounty on make.fun, by [@epanpai](https://github.com/epanpai).

## What it is

**Vice Legend** is an offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze (28 hidden). Open `app/index.html` from any static server (or run `node serve.ts` and visit http://localhost:8080) and:

1. **Track** — tick trophies off as you earn them; progress is saved in the browser (localStorage), with a progress bar, grade breakdown and percentage to the platinum.
2. **Find** — search by name, mission or keyword; filter by kind (Story, Missable, Collectibles, Activities) and by grade; show only trophies not yet earned.
3. **Follow the roadmap** — five stages to the platinum, built from the official descriptions: story chapters 1–5 and the final mission, the one missable step, collectibles, the activities grind, and the 100% Completion cleanup.
4. **Don't miss anything** — the one missable trophy, Positive Mental Attitude, is flagged with the Chapter 1 warning (meditate at the home spot before the chapter ends; there is no mission replay).
5. **Read a cited guide for every trophy** — each guide is written in our own words and names its sources (Exophase, GTA Zone, Output Lag, Press Start, and PowerPyx/GTABase via GTA Zone). Five trophies whose triggers are still unconfirmed say so honestly instead of inventing steps.
6. **Stay spoiler-safe** — a toggle hides the names and descriptions of hidden story trophies until they are earned.
7. **Export / import / reset** — download your progress as JSON, import it back, or start over.

Everything runs offline from the files in `app/`: no library, no font, no image and no request leaves the app. The look is our own dark "Vice" theme (neon magenta and sunset orange, system fonts) — no Rockstar logo, artwork or game screenshot anywhere.

## Files

- `app/index.html` — the guide page
- `app/style.css` — dark Vice theme
- `app/app.js` — tracker wiring: filters, spoiler mode, roadmap, detail dialog, export/import/reset
- `app/data/trophies.json` — all 55 trophies: official name, description and grade, our own guide with sources, kind, missable flag and reason, hidden flag, tracked count, roadmap stage
- `screenshots/` — 4 screenshots: the checklist, a trophy guide with sources, the roadmap, and spoiler-safe mode
- `main.ts` — the submission program: copies `app/` + `screenshots/` to `/output` and writes `dossier.json`
- `serve.ts` — tiny static server for local testing

## Sources

Trophy names, descriptions and grades as PlayStation publishes them, mirrored by [Exophase](https://exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [Press Start](https://press-start.com.au/news/2026/11/18/gta-6-trophy-list/); counts, chapter placements and the missable warning from [GTA Zone](https://gta-zone.com/news/gta-6-trophies-achievements/) (PowerPyx and GTABase) and [Output Lag](https://outputlag.com/guides/gta-6-trophy-list/). Each trophy's guide in the app cites its own sources beside it.

## License

MIT — see `LICENSE`. Unofficial fan guide, not affiliated with Rockstar Games, Sony or PlayStation.
