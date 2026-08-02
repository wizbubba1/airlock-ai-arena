# AIRLOCK Stage 0 Spec

Version: `stage0.v0.1`

Stage 0 is a no-money prototype for proving the core AIRLOCK loop: seeded AI-agent social deduction, public transcript replay, free pick'em, and audit artifacts.

## Product Scope

Stage 0 includes:

- eight scripted house agents;
- two Saboteurs and six Technicians;
- deterministic match simulation from a public seed;
- transcript replay with map, roster, pick'em board, and audit panel;
- JSON audit bundle export;
- deterministic audit bundle verification;
- Markdown match report export;
- transcript quality report export;
- pick'em receipt export and verification;
- canonical seed index report export;
- Stage 0 show pack export;
- artifact catalog export;
- terminal audit, report, balance, and authored-agent validation commands.
- Stage 1 author submission packet export and verification.
- deterministic Stage 1 preview ladder reports.
- versioned Stage 1 preview season manifests.

Stage 0 excludes:

- real-money markets;
- author entry fees;
- user account storage;
- hosted LLM inference;
- drand integration;
- on-chain settlement.

## Ruleset Manifest

The canonical ruleset lives in `src/engine/ruleset.ts`.

| Field | Value |
|---|---:|
| Players | 8 |
| Saboteurs | 2 |
| Technicians | 6 |
| Tasks per Technician | 8 |
| Scheduled meeting interval | 8 ticks |
| Max ticks | 56 |
| Kill cooldown | 3 ticks |
| Task completion chance | 0.32 |
| Meeting speech rounds | 2 |

Any future ruleset mutation should create a new ruleset ID rather than silently changing `stage0.v0.1`.

## Determinism

Matches are deterministic from:

- match seed;
- ruleset manifest;
- room graph;
- house-agent profiles and policy knobs;
- Stage 0 entropy labels.

Stage 0 entropy is deterministic and local. It is not a replacement for drand, but it creates the same ledger shape a future drand-backed system needs: setup entropy plus one entropy entry per action tick.

## Audit Artifacts

`npm run audit -- <seed>` writes a JSON bundle containing:

- ruleset manifest;
- role reveal;
- public transcript;
- market snapshots;
- public replay snapshots;
- entropy ledger;
- per-tick public commitments;
- SHA-256 commitments for roles, personas, transcript, market, snapshots, and entropy.

`npm run artifact-catalog` writes a JSON and Markdown index of all generated artifacts, including schemas, generation commands, verifier commands, and intended review use.

`npm run analytics-schema -- <program-id>` writes JSON and Markdown Stage 0 analytics schema artifacts. The artifact defines privacy-safe events and derived metrics for D7 return, pick'em participation, transcript completion, and stage-gate review.

`npm run b2b-feed-packet -- <seed> <program-id>` writes JSON and Markdown licensed-operator or media partner packets. The artifact bundles certified feed evidence, market readiness gates, stage-gate policy, and the no direct consumer betting posture.

`npm run verify-audit -- <audit-bundle.json>` reruns the match for the bundle seed and compares every public artifact against the deterministic replay. A mismatch fails with the bundle sections that drifted.

`npm run challenge -- <seed>` writes a single challenge packet containing the audit bundle plus deterministic replay verification evidence. This is the Stage 0 stand-in for the optimistic challenge workflow in the patched product spec.

`npm run event-feed -- <seed>` writes JSON and Markdown certified public feed artifacts for media or licensed-market partner review. The feed contains public transcript events, public market commitments, and terminal-only role disclosure.

`npm run fallback-drill -- <seed>` writes JSON and Markdown timeout drill artifacts for action, speech, vote, and affected micro-pool fallback behavior.

`npm run inference-receipts -- <seed>` writes JSON and Markdown speech-generation receipt artifacts for prompt hashes, output hashes, token counts, logprob commitments, and receipt hashes. This is the Stage 0 stand-in for P1 attested inference receipts.

`npm run balance-patch-schedule -- <season-id>` writes JSON and Markdown precommitted balance-patch schedules for Stage 1 preview seasons. The artifact keeps mid-season mutations reviewable without giving the operator discretionary patch power.

`npm run collusion-controls -- <season-id>` writes JSON and Markdown anti-collusion control artifacts for Stage 1 preview seasons. The artifact covers superlinear entry bonds, speech-sanitizer controls, throw-detection metrics, and season escrow actions.

`npm run prompt-reveal-policy -- <season-id>` writes JSON and Markdown prompt reveal policy artifacts for Stage 1 preview seasons. The artifact captures pre-season commitments, auditor-only prompt access, challenge mediation, and two-season lagged public reveal.

`npm run stage-gate-policy -- <program-id>` writes JSON and Markdown roadmap gate artifacts. The artifact keeps Show -> Ladder -> Market sequencing explicit with kill criteria, hold-stage decisions, and B2B-feed pivot conditions.

`npm run market-readiness -- <seed>` writes JSON and Markdown Stage 2 market gate artifacts. Real-money markets remain blocked unless counsel, jurisdiction policy, licensed-operator, responsible-play, and certified-feed evidence are present.

`npm run report -- <seed>` writes a human-readable Markdown report over the same match.

`npm run transcript-quality -- <seed>` writes JSON and Markdown reports for content-health metrics: speech, votes, reports, danger beats, repairs, market events, and meeting density.

`npm run reveal-schedule -- <seed>` writes JSON and Markdown timing artifacts for the commit-before-render tick schedule and fixed public reveal delay.

`npm run sanitizer-audit -- <seed>` writes JSON and Markdown speech-sanitizer artifacts for reviewing the anti-steganography policy.

`npm run stage0-evaluation` writes JSON and Markdown reports that combine balance, canonical seed coverage, show pack readiness, and transcript legibility into a reviewer-facing go/no-go summary.

`npm run operator-readiness` writes JSON and Markdown reports that aggregate the Stage 0 evaluation with inference receipts, reveal timing, sanitizer, and fallback evidence into one reviewer checklist.

`npm run pickem -- <seed> <agent-id> <agent-id>` writes a spectator receipt for two Saboteur picks. `npm run verify-pickem -- <receipt.json>` reruns the seed and verifies the score, actual Saboteurs, transcript hash, and receipt hash.

`npm run seed-index` writes JSON and Markdown reports across the canonical regression seeds. The index gives reviewers a compact table of winners, match lengths, transcript hashes, market hashes, public snapshot hashes, and entropy hashes.

`npm run verify-seed-index -- <seed-index.json>` reruns every listed seed and fails if any result metric or audit hash differs from deterministic replay.

`npm run show-pack` writes a deterministic JSON and Markdown demo pack across several seeded matches. Each match includes a spectator pick prompt, public transcript excerpts, final reveal, terminal market suspects, and audit hashes.

`npm run verify-show-pack -- <show-pack.json>` reruns the show pack seeds and fails if the pack summary, transcript excerpts, reveal data, or hash has drifted.

## Stage 1 Bridge

Authored agents must validate against `airlock.agent.manifest.v1`.

Current manifest requirements:

- public identity fields: ID, name, callsign, persona, color, declared playstyle;
- private prompt commitment as `sha256:<64 hex chars>`;
- policy knobs bounded from `0` to `1`;
- prompt cap of 4,000 characters for the commitment helper.

Use:

```bash
npm run commit-prompt -- src/tests/fixtures/agents/vanta-private-prompt.txt
npm run create-agent -- --prompt src/tests/fixtures/agents/vanta-private-prompt.txt --out ./artifacts/generated-agent.json
npm run submit-agent -- src/tests/fixtures/agents/vanta-author.json stage1-preview.001
npm run verify-agent-submission -- ./artifacts/airlock-agent-submission.json
npm run validate-agent -- src/tests/fixtures/agents/vanta-author.json
npm run ladder -- 64 stage-one-preview
npm run verify-ladder -- ./artifacts/airlock-ladder-64.json
npm run season -- stage1-preview.001
npm run verify-season -- ./artifacts/airlock-season-stage1-preview.001.json
```

`npm run ladder -- <count> <seed-prefix>` runs repeated seeded matches and produces an Elo-style preview table for the house agents. It is a bridge toward authored-agent seasons, not a production league service.
`npm run verify-ladder -- <ladder-summary.json>` reruns the deterministic preview and fails if the standings or match records drift.
`npm run create-agent -- --prompt <private-prompt.txt> --out <manifest.json>` writes a validated public manifest with a prompt commitment.
`npm run submit-agent -- <manifest.json> <season-id>` writes a deterministic author intake packet with manifest validation output, target season hash, and submission hash.
`npm run verify-agent-submission -- <submission.json>` reconstructs the packet and fails if any intake field or hash differs.
`npm run season -- <season-id>` writes a versioned season manifest covering the locked ruleset, model policy, authoring requirements, ladder settings, and audit policy.
`npm run verify-season -- <season-manifest.json>` reconstructs the manifest for its season ID and fails if any locked policy or manifest hash differs.

## Validation

Local verification commands:

```bash
npm test
npm run verify-all
npm run analytics-schema -- airlock-roadmap.001
npm run verify-analytics-schema -- ./artifacts/airlock-analytics-schema-airlock-roadmap.001.json
npm run artifact-catalog
npm run audit -- airlock-stage-zero-demo
npm run b2b-feed-packet -- airlock-stage-zero-demo airlock-roadmap.001
npm run verify-b2b-feed-packet -- ./artifacts/airlock-b2b-feed-packet-airlock-stage-zero-demo.json
npm run challenge -- airlock-stage-zero-demo
npm run fallback-drill -- airlock-stage-zero-demo
npm run verify-fallback-drill -- ./artifacts/airlock-fallback-drill-airlock-stage-zero-demo.json
npm run balance-patch-schedule -- stage1-preview.001
npm run verify-balance-patch-schedule -- ./artifacts/airlock-balance-patch-schedule-stage1-preview.001.json
npm run collusion-controls -- stage1-preview.001
npm run verify-collusion-controls -- ./artifacts/airlock-collusion-controls-stage1-preview.001.json
npm run prompt-reveal-policy -- stage1-preview.001
npm run verify-prompt-reveal-policy -- ./artifacts/airlock-prompt-reveal-policy-stage1-preview.001.json
npm run stage-gate-policy -- airlock-roadmap.001
npm run verify-stage-gate-policy -- ./artifacts/airlock-stage-gate-policy-airlock-roadmap.001.json
npm run market-readiness -- airlock-stage-zero-demo
npm run verify-market-readiness -- ./artifacts/airlock-market-readiness-airlock-stage-zero-demo.json
npm run verify-audit -- ./artifacts/airlock-audit-airlock-stage-zero-demo.json
npm run report -- airlock-stage-zero-demo
npm run transcript-quality -- airlock-stage-zero-demo
npm run verify-transcript-quality -- ./artifacts/airlock-transcript-quality-airlock-stage-zero-demo.json
npm run reveal-schedule -- airlock-stage-zero-demo
npm run verify-reveal-schedule -- ./artifacts/airlock-reveal-schedule-airlock-stage-zero-demo.json
npm run sanitizer-audit -- airlock-stage-zero-demo
npm run verify-sanitizer-audit -- ./artifacts/airlock-sanitizer-audit-airlock-stage-zero-demo.json
npm run stage0-evaluation
npm run verify-stage0-evaluation -- ./artifacts/airlock-stage0-evaluation.json
npm run pickem -- airlock-stage-zero-demo vanta kepler
npm run verify-pickem -- ./artifacts/airlock-pickem-airlock-stage-zero-demo.json
npm run seed-index
npm run verify-seed-index -- ./artifacts/airlock-seed-index.json
npm run show-pack
npm run verify-show-pack -- ./artifacts/airlock-show-pack.json
npm run balance -- 100 stage-zero-ci
npm run verify-balance -- ./artifacts/airlock-balance-ci.json
npm run ladder -- 32 stage-one-ci
npm run verify-ladder -- ./artifacts/airlock-ladder-32.json
npm run season -- stage1-preview.001
npm run verify-season -- ./artifacts/airlock-season-stage1-preview.001.json
npm run commit-prompt -- src/tests/fixtures/agents/vanta-private-prompt.txt
npm run create-agent -- --prompt src/tests/fixtures/agents/vanta-private-prompt.txt --out ./artifacts/generated-agent.json
npm run submit-agent -- src/tests/fixtures/agents/vanta-author.json stage1-preview.001
npm run verify-agent-submission -- ./artifacts/airlock-agent-submission.json
npm run validate-agent -- src/tests/fixtures/agents/vanta-author.json
npm run build
```

`npm run verify-all` is the shortest reviewer path: it regenerates the core artifacts under `artifacts/` and verifies the deterministic replay checks in one pass.

GitHub Actions runs the same smoke path on `main`.
