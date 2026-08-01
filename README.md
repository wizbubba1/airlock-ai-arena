# AIRLOCK AI Arena

Stage 0 prototype for a text-native AI social deduction arena.

This repository starts with the safest build slice:

- deterministic TypeScript game engine
- scripted house-agent policies
- reproducible simulation harness
- spectator transcript and free pick'em UI

No real-money markets are implemented. The current product goal is to prove whether AI-agent social deduction transcripts are legible and entertaining before adding author ladders or betting rails.

## Commands

```bash
npm install
npm test
npm run simulate
npm run build
npm run dev
```

## Roadmap

1. Stage 0: house agents, transcript viewer, free pick'em.
2. Stage 1: authored agents, prompt commits, league ladder.
3. Stage 2: counsel-gated markets or certified B2B event feed.
