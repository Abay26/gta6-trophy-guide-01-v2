# Vice Ledger — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Abay26/gta6-trophy-guide-01-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Abay26/gta6-trophy-guide-01-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The complete offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden on PlayStation — with a guide in its own words for every trophy, a roadmap to the platinum, the one possibly missable trophy flagged with its Chapter 1 warning, and a checklist that saves in the browser.

## What it is

A static web app under `app/` — no build step, no network requests at runtime. Open `app/index.html` in desktop Chrome with the network off and it works.

- **Checklist of all 55 trophies** with the official name, description and grade exactly as PlayStation publishes them, plus a guide, steps and cited sources for each one. Tick a trophy off and it stays ticked (localStorage). Progress shows as a bar, per-grade counts and a "next up" suggestion.
- **Roadmap to the platinum** in five phases — story → strangers → activities & combat → collectibles & the grind → platinum — built from the official descriptions, with per-phase progress and trophy chips.
- **Missables & watch-outs**: only **one** trophy is flagged as possibly missable — Positive Mental Attitude, whose first meditation in Chapter 1 is reported gone after that chapter (GTABase, PowerPyx and KeenGamer agree) — plus the five stranger chains flagged as time-sensitive, since their windows are tied to story progress. Everything else is safe in free roam after the story.
- **Collectibles view**: the sets the 100% checklist tracks, as launch guides count them — 480 cards in 18 sets, 18 meditation spots, 277 vehicles, 397 stunts, 80 challenges, 42 drone trials at 14 locations and more.
- **Filters** by kind (story, activities, combat & heists, collectibles, exploration) and by grade, plus search, a hide-earned toggle and a **spoiler-safe mode** that hides story trophy names and descriptions until they are earned.
- **Export / import**: download progress as JSON and import it back; reset clears it.
- **Deep links**: `?view=roadmap`, `?view=missables`, `?view=collectibles`, `?kind=collectible`, `?spoiler=on`, `?trophy=28`, `?checked=2,3,15`.

## Why it beats the v1 guide

The v1 entry ("Leonida Legend", #1,475) flagged 12 trophies as missable. The launch guides published since — GTABase, PowerPyx, KeenGamer — agree only **one** trophy is possibly missable, and that the stranger chains are time-sensitive rather than missable. This v2 corrects that, grounds its numbers in the launch guides (14 drone locations, 42 range challenges, 480 cards, 35 checklist requirements) and gives every trophy steps, a difficulty and time estimate, and a "when" line, so the guide is checkable at a glance.

## Sources

Every guide cites its sources beside the trophy. The facts come from the official trophy descriptions as published by PlayStation, via [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi), plus launch guides: [GTABase's trophy guide](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series), [GTABase's 100% completion guide](https://www.gtabase.com/articles/gta-6/gta-6-100-completion-guide-interactive-checklist), [PowerPyx's 100% checklist](https://www.powerpyx.com/gta-6-100-completion-checklist-guide/), [PowerPyx's drone race locations](https://www.powerpyx.com/gta-6-all-top-fun-drone-race-time-trial-locations/), [PowerPyx's card sets](https://www.powerpyx.com/gta-6-all-collectible-card-sets-locations/) and [KeenGamer's trophy guide](https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/). Where a method is inferred from the official description rather than a published guide, the guide says so plainly. All guide text is written for this entry in its own words — nothing is copied from another guide. No Rockstar logo, artwork or game screenshot is used anywhere.

## How it runs

```sh
node serve.ts
# open http://localhost:8080
```

`main.ts` (Node 22, standard library only) hands the entry in: it copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Running it twice produces byte-identical output. No network is used.

## Files

- `app/index.html` — the shell: masthead with progress, toolbar, tabs, list + detail layout
- `app/style.css` — the Vice Ledger look: deep Leonida night, neon sunset accents
- `app/app.js` — boot, views, filters, progress, roadmap, missables, collectibles, shot scenes
- `app/tracker.js` — progress store (localStorage), export / import
- `app/detail.js` — the detail panel: guide, steps, sources, flags
- `app/data/trophies.json` — the 55 official trophies with guides, steps and sources
- `main.ts` — copies `app/` + `screenshots/` to `/output`, writes `dossier.json`
- `screenshots/` — 4 renders of the app: checklist with a guide open, roadmap, missables, detail with spoiler-safe on

<sub>Entered on [make.fun](https://make.fun/?ref=qw56w9dq&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
