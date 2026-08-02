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
- transcript quality reports
- canonical seed index reports
- Stage 0 show pack export
- artifact catalog export
- pick'em receipt export and verification
- Stage 1 authored-agent manifest validation
- Stage 1 private-prompt commitment helper
- Stage 1 public manifest generator
- Stage 1 agent submission packet export
- Stage 1 ladder preview simulator
- versioned Stage 1 season manifest export
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
npm run verify-all
npm run artifact-catalog
npm run simulate
npm run audit -- airlock-stage-zero-demo
npm run challenge -- airlock-stage-zero-demo
npm run verify-audit -- ./artifacts/airlock-audit-airlock-stage-zero-demo.json
npm run report -- airlock-stage-zero-demo
npm run transcript-quality -- airlock-stage-zero-demo
npm run verify-transcript-quality -- ./artifacts/airlock-transcript-quality-airlock-stage-zero-demo.json
npm run reveal-schedule -- airlock-stage-zero-demo
npm run verify-reveal-schedule -- ./artifacts/airlock-reveal-schedule-airlock-stage-zero-demo.json
npm run stage0-evaluation
npm run verify-stage0-evaluation -- ./artifacts/airlock-stage0-evaluation.json
npm run pickem -- airlock-stage-zero-demo vanta kepler
npm run verify-pickem -- ./artifacts/airlock-pickem-airlock-stage-zero-demo.json
npm run seed-index
npm run verify-seed-index -- ./artifacts/airlock-seed-index.json
npm run show-pack
npm run verify-show-pack -- ./artifacts/airlock-show-pack.json
npm run balance -- 1000 stage-zero
npm run balance:check
npm run verify-balance -- ./artifacts/airlock-balance-ci.json
npm run ladder -- 64 stage-one-preview
npm run verify-ladder -- ./artifacts/airlock-ladder-64.json
npm run season -- stage1-preview.001
npm run verify-season -- ./artifacts/airlock-season-stage1-preview.001.json
npm run create-agent -- --prompt src/tests/fixtures/agents/vanta-private-prompt.txt --out ./artifacts/generated-agent.json
npm run submit-agent -- src/tests/fixtures/agents/vanta-author.json stage1-preview.001
npm run verify-agent-submission -- ./artifacts/airlock-agent-submission.json
npm run commit-prompt -- src/tests/fixtures/agents/vanta-private-prompt.txt
npm run validate-agent -- src/tests/fixtures/agents/vanta-author.json
npm run build
npm run dev
```

`npm run audit -- <seed>` writes a reproducible JSON audit bundle to `artifacts/` unless you pass an explicit output path as the second argument.
`npm run verify-all` regenerates the core artifact set and runs the deterministic verifier path in one command.
`npm run artifact-catalog` writes JSON and Markdown indexes of every generated artifact, its schema, command, verifier, and review purpose.
`npm run challenge -- <seed>` writes a challenge packet containing the audit bundle plus deterministic replay verification evidence.
`npm run verify-audit -- <audit-bundle.json>` reruns the deterministic match for the bundle seed and fails if commitments, transcript, market, snapshots, entropy, or tick commitments drift.
`npm run report -- <seed>` writes a Markdown match report suitable for public archives or Gists.
`npm run transcript-quality -- <seed>` writes JSON and Markdown content-health reports for transcript event mix and meeting density.
`npm run verify-transcript-quality -- <transcript-quality.json>` reruns the seeded transcript quality report and fails if event counts, density, transcript hash, or quality hash drift.
`npm run reveal-schedule -- <seed>` writes JSON and Markdown timing artifacts for commit-before-render ticks and fixed public reveal delay.
`npm run verify-reveal-schedule -- <reveal-schedule.json>` reruns the seeded reveal schedule and fails if policy, tick commitments, reveal slots, or schedule hash drift.
`npm run stage0-evaluation` writes a reviewer-facing go/no-go summary combining balance, seed coverage, show pack readiness, and transcript legibility gates.
`npm run verify-stage0-evaluation -- <stage0-evaluation.json>` reruns the evaluation inputs and fails if any gate, aggregate, artifact, or evaluation hash drifts.
`npm run pickem -- <seed> <agent-id> <agent-id>` writes a spectator pick'em receipt with the actual Saboteurs, score, transcript hash, and receipt hash.
`npm run verify-pickem -- <receipt.json>` reruns the seeded match and fails if the receipt differs.
`npm run seed-index` writes JSON and Markdown summaries for the canonical regression seeds, including result metrics and audit hashes.
`npm run verify-seed-index -- <seed-index.json>` reruns every listed seed and fails if any result or hash drifts.
`npm run show-pack` writes a deterministic JSON and Markdown demo pack with multiple seeded matches, pick'em prompts, transcript excerpts, reveal data, and audit hashes.
`npm run verify-show-pack -- <show-pack.json>` reruns the show pack seeds and fails if any summary, excerpt, result, or hash differs.
`npm run balance -- <count> <seed-prefix>` writes a many-match balance report with win rates, match-length averages, terminal reasons, and Saboteur pair frequencies.
`npm run balance:check` runs the CI balance guard and fails if the simulator drifts into an obviously broken meta.
`npm run verify-balance -- <balance-summary.json>` reruns the batch and fails if any aggregate result differs.
`npm run ladder -- <count> <seed-prefix>` writes deterministic Stage 1 preview ladder JSON and Markdown reports with Elo-style standings across repeated seeded matches.
`npm run verify-ladder -- <ladder-summary.json>` reruns the deterministic ladder preview and fails if standings or match records drift.
`npm run season -- <season-id>` writes a versioned season manifest covering ruleset, model policy, authoring requirements, ladder settings, and audit policy.
`npm run verify-season -- <season-manifest.json>` reconstructs the manifest for its season ID and fails if any locked policy or hash differs.
`npm run create-agent -- --prompt <private-prompt.txt> --out <manifest.json>` writes a validated public authored-agent manifest using the prompt commitment helper.
`npm run submit-agent -- <manifest.json> <season-id>` writes a Stage 1 intake packet with validation status, manifest hash, target season hash, and submission hash.
`npm run verify-agent-submission -- <submission.json>` reconstructs the packet and fails if any intake field or hash differs.
`npm run commit-prompt -- <private-prompt.txt>` prints the `sha256:` commitment to place in an authored-agent manifest.
`npm run validate-agent -- <manifest.json>` validates a Stage 1 authored-agent manifest and returns its public manifest hash.

## Roadmap

1. Stage 0: house agents, transcript viewer, free pick'em.
2. Stage 1: authored agents, prompt commits, league ladder.
3. Stage 2: counsel-gated markets or certified B2B event feed.
