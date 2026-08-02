# AIRLOCK AI Arena

Stage 0 prototype for a text-native AI social deduction arena.

Live prototype: https://wizbubba1.github.io/airlock-ai-arena/

Shareable seeded match example: https://wizbubba1.github.io/airlock-ai-arena/?seed=airlock-stage-zero-demo

Spec: [docs/stage-0-spec.md](docs/stage-0-spec.md)

This repository starts with the safest build slice:

- deterministic TypeScript game engine
- scripted house-agent policies
- reproducible simulation harness
- spectator transcript and free pick'em UI
- seed-based replay controls
- downloadable audit bundle for each simulated match
- independent audit bundle verifier
- challenge packet export for optimistic fairness review
- terminal-generated Markdown match reports
- Stage 1 authored-agent manifest validation
- Stage 1 private-prompt commitment helper
- Stage 1 ladder preview simulator
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
npm run challenge -- airlock-stage-zero-demo
npm run verify-audit -- ./artifacts/airlock-audit-airlock-stage-zero-demo.json
npm run report -- airlock-stage-zero-demo
npm run balance -- 1000 stage-zero
npm run balance:check
npm run ladder -- 64 stage-one-preview
npm run verify-ladder -- ./artifacts/airlock-ladder-64.json
npm run commit-prompt -- src/tests/fixtures/agents/vanta-private-prompt.txt
npm run validate-agent -- src/tests/fixtures/agents/vanta-author.json
npm run build
npm run dev
```

`npm run audit -- <seed>` writes a reproducible JSON audit bundle to `artifacts/` unless you pass an explicit output path as the second argument.
`npm run challenge -- <seed>` writes a challenge packet containing the audit bundle plus deterministic replay verification evidence.
`npm run verify-audit -- <audit-bundle.json>` reruns the deterministic match for the bundle seed and fails if commitments, transcript, market, snapshots, entropy, or tick commitments drift.
`npm run report -- <seed>` writes a Markdown match report suitable for public archives or Gists.
`npm run balance -- <count> <seed-prefix>` writes a many-match balance report with win rates, match-length averages, terminal reasons, and Saboteur pair frequencies.
`npm run balance:check` runs the CI balance guard and fails if the simulator drifts into an obviously broken meta.
`npm run ladder -- <count> <seed-prefix>` writes deterministic Stage 1 preview ladder JSON and Markdown reports with Elo-style standings across repeated seeded matches.
`npm run verify-ladder -- <ladder-summary.json>` reruns the deterministic ladder preview and fails if standings or match records drift.
`npm run commit-prompt -- <private-prompt.txt>` prints the `sha256:` commitment to place in an authored-agent manifest.
`npm run validate-agent -- <manifest.json>` validates a Stage 1 authored-agent manifest and returns its public manifest hash.

## Roadmap

1. Stage 0: house agents, transcript viewer, free pick'em.
2. Stage 1: authored agents, prompt commits, league ladder.
3. Stage 2: counsel-gated markets or certified B2B event feed.
