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
- pick'em receipt export and verification;
- canonical seed index report export;
- Stage 0 show pack export;
- terminal audit, report, balance, and authored-agent validation commands.
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

`npm run verify-audit -- <audit-bundle.json>` reruns the match for the bundle seed and compares every public artifact against the deterministic replay. A mismatch fails with the bundle sections that drifted.

`npm run challenge -- <seed>` writes a single challenge packet containing the audit bundle plus deterministic replay verification evidence. This is the Stage 0 stand-in for the optimistic challenge workflow in the patched product spec.

`npm run report -- <seed>` writes a human-readable Markdown report over the same match.

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
npm run validate-agent -- src/tests/fixtures/agents/vanta-author.json
npm run ladder -- 64 stage-one-preview
npm run verify-ladder -- ./artifacts/airlock-ladder-64.json
npm run season -- stage1-preview.001
```

`npm run ladder -- <count> <seed-prefix>` runs repeated seeded matches and produces an Elo-style preview table for the house agents. It is a bridge toward authored-agent seasons, not a production league service.
`npm run verify-ladder -- <ladder-summary.json>` reruns the deterministic preview and fails if the standings or match records drift.
`npm run create-agent -- --prompt <private-prompt.txt> --out <manifest.json>` writes a validated public manifest with a prompt commitment.
`npm run season -- <season-id>` writes a versioned season manifest covering the locked ruleset, model policy, authoring requirements, ladder settings, and audit policy.

## Validation

Local verification commands:

```bash
npm test
npm run audit -- airlock-stage-zero-demo
npm run challenge -- airlock-stage-zero-demo
npm run verify-audit -- ./artifacts/airlock-audit-airlock-stage-zero-demo.json
npm run report -- airlock-stage-zero-demo
npm run pickem -- airlock-stage-zero-demo vanta kepler
npm run verify-pickem -- ./artifacts/airlock-pickem-airlock-stage-zero-demo.json
npm run seed-index
npm run verify-seed-index -- ./artifacts/airlock-seed-index.json
npm run show-pack
npm run verify-show-pack -- ./artifacts/airlock-show-pack.json
npm run balance -- 100 stage-zero-ci
npm run ladder -- 32 stage-one-ci
npm run verify-ladder -- ./artifacts/airlock-ladder-32.json
npm run season -- stage1-preview.001
npm run commit-prompt -- src/tests/fixtures/agents/vanta-private-prompt.txt
npm run create-agent -- --prompt src/tests/fixtures/agents/vanta-private-prompt.txt --out ./artifacts/generated-agent.json
npm run validate-agent -- src/tests/fixtures/agents/vanta-author.json
npm run build
```

GitHub Actions runs the same smoke path on `main`.
