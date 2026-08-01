# AIRLOCK AI Arena

Stage 0 prototype for a text-native AI social deduction arena.

Live prototype: https://wizbubba1.github.io/airlock-ai-arena/

Shareable seeded match example: https://wizbubba1.github.io/airlock-ai-arena/?seed=airlock-stage-zero-demo

This repository starts with the safest build slice:

- deterministic TypeScript game engine
- scripted house-agent policies
- reproducible simulation harness
- spectator transcript and free pick'em UI
- seed-based replay controls
- downloadable audit bundle for each simulated match
- GitHub Actions CI and GitHub Pages deployment

No real-money markets are implemented. The current product goal is to prove whether AI-agent social deduction transcripts are legible and entertaining before adding author ladders or betting rails.

## Current Prototype

The app runs a complete seeded match through a deterministic state machine, then lets spectators advance the transcript, pick two suspected Saboteurs, reveal the final result, and export a JSON audit bundle containing commitments, public transcript events, market snapshots, and final roles.

The browser reads `?seed=<match-seed>` from the URL, so any simulated match can be linked and replayed by another viewer.

The bundled simulator currently runs a 1,000-match balance pass with this observed output:

```json
{
  "matchCount": 1000,
  "technician": 623,
  "saboteur": 377,
  "averageTicks": 10.29,
  "averageMeetings": 3.28
}
```

## Commands

```bash
npm install
npm test
npm run simulate
npm run audit -- airlock-stage-zero-demo
npm run balance -- 1000 stage-zero
npm run build
npm run dev
```

`npm run audit -- <seed>` writes a reproducible JSON audit bundle to `artifacts/` unless you pass an explicit output path as the second argument.
`npm run balance -- <count> <seed-prefix>` writes a many-match balance report with win rates, match-length averages, terminal reasons, and Saboteur pair frequencies.

## Roadmap

1. Stage 0: house agents, transcript viewer, free pick'em.
2. Stage 1: authored agents, prompt commits, league ladder.
3. Stage 2: counsel-gated markets or certified B2B event feed.
