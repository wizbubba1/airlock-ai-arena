import { digest } from './audit';

export interface ArtifactCatalogEntry {
  name: string;
  schema: string;
  format: 'json' | 'markdown';
  defaultPath: string;
  generateCommand: string;
  verifyCommand?: string;
  purpose: string;
}

export interface ArtifactCatalog {
  schema: 'airlock.artifact_catalog.v1';
  entries: ArtifactCatalogEntry[];
  catalogHash: string;
}

export function buildArtifactCatalog(): ArtifactCatalog {
  const entries: ArtifactCatalogEntry[] = [
    {
      name: 'Audit bundle',
      schema: 'airlock.audit.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-audit-airlock-stage-zero-demo.json',
      generateCommand: 'npm run audit -- airlock-stage-zero-demo',
      verifyCommand: 'npm run verify-audit -- ./artifacts/airlock-audit-airlock-stage-zero-demo.json',
      purpose: 'Full deterministic match audit data: commitments, transcript, market snapshots, public snapshots, entropy, and tick commitments.',
    },
    {
      name: 'Full verification bundle',
      schema: 'airlock.verify_all.local',
      format: 'json',
      defaultPath: './artifacts/',
      generateCommand: 'npm run verify-all',
      purpose: 'Single reviewer command that regenerates the core artifact set and runs deterministic verification checks in one pass.',
    },
    {
      name: 'Stage 0 evaluation',
      schema: 'airlock.stage0_evaluation.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-stage0-evaluation.json',
      generateCommand: 'npm run stage0-evaluation',
      verifyCommand: 'npm run verify-stage0-evaluation -- ./artifacts/airlock-stage0-evaluation.json',
      purpose: 'Reviewer-facing go/no-go summary combining balance, seed coverage, show pack readiness, and transcript legibility gates.',
    },
    {
      name: 'Operator readiness',
      schema: 'airlock.operator_readiness.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-operator-readiness.json',
      generateCommand: 'npm run operator-readiness',
      verifyCommand: 'npm run verify-operator-readiness -- ./artifacts/airlock-operator-readiness.json',
      purpose: 'Single readiness checklist over Stage 0 product gates plus P1/P2/P4/P9 evidence artifacts.',
    },
    {
      name: 'Challenge packet',
      schema: 'airlock.challenge.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-challenge-airlock-stage-zero-demo.json',
      generateCommand: 'npm run challenge -- airlock-stage-zero-demo',
      purpose: 'Single-file optimistic fairness packet containing an audit bundle and deterministic replay verification evidence.',
    },
    {
      name: 'Match report',
      schema: 'airlock.report.stage0.markdown',
      format: 'markdown',
      defaultPath: './artifacts/airlock-report-airlock-stage-zero-demo.md',
      generateCommand: 'npm run report -- airlock-stage-zero-demo',
      purpose: 'Human-readable match archive with commitments, role reveal, public transcript, entropy ledger, and tick commitments.',
    },
    {
      name: 'Transcript quality report',
      schema: 'airlock.transcript_quality.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-transcript-quality-airlock-stage-zero-demo.json',
      generateCommand: 'npm run transcript-quality -- airlock-stage-zero-demo',
      verifyCommand: 'npm run verify-transcript-quality -- ./artifacts/airlock-transcript-quality-airlock-stage-zero-demo.json',
      purpose: 'Deterministic content-health report for speech, votes, reports, danger beats, repairs, and meeting density.',
    },
    {
      name: 'Reveal schedule',
      schema: 'airlock.reveal_schedule.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-reveal-schedule-airlock-stage-zero-demo.json',
      generateCommand: 'npm run reveal-schedule -- airlock-stage-zero-demo',
      verifyCommand: 'npm run verify-reveal-schedule -- ./artifacts/airlock-reveal-schedule-airlock-stage-zero-demo.json',
      purpose: 'Commit-before-render schedule with fixed public reveal delay for reviewing P2 timing and side-channel policy.',
    },
    {
      name: 'Sanitizer audit',
      schema: 'airlock.sanitizer_audit.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-sanitizer-audit-airlock-stage-zero-demo.json',
      generateCommand: 'npm run sanitizer-audit -- airlock-stage-zero-demo',
      verifyCommand: 'npm run verify-sanitizer-audit -- ./artifacts/airlock-sanitizer-audit-airlock-stage-zero-demo.json',
      purpose: 'Deterministic meeting-speech sanitizer audit for reviewing anti-steganography policy before agents receive speech.',
    },
    {
      name: 'Fallback drill',
      schema: 'airlock.fallback_drill.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-fallback-drill-airlock-stage-zero-demo.json',
      generateCommand: 'npm run fallback-drill -- airlock-stage-zero-demo',
      verifyCommand: 'npm run verify-fallback-drill -- ./artifacts/airlock-fallback-drill-airlock-stage-zero-demo.json',
      purpose: 'Deterministic timeout drill showing action, speech, vote, and micro-pool void fallbacks for inference failures.',
    },
    {
      name: 'Inference receipts',
      schema: 'airlock.inference_receipts.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-inference-receipts-airlock-stage-zero-demo.json',
      generateCommand: 'npm run inference-receipts -- airlock-stage-zero-demo',
      verifyCommand: 'npm run verify-inference-receipts -- ./artifacts/airlock-inference-receipts-airlock-stage-zero-demo.json',
      purpose: 'Speech-generation receipt log for P1-style optimistic fairness review: prompt hashes, output hashes, token counts, logprob commitments, and receipt hashes.',
    },
    {
      name: "Pick'em receipt",
      schema: 'airlock.pickem.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-pickem-airlock-stage-zero-demo.json',
      generateCommand: 'npm run pickem -- airlock-stage-zero-demo vanta kepler',
      verifyCommand: 'npm run verify-pickem -- ./artifacts/airlock-pickem-airlock-stage-zero-demo.json',
      purpose: "Spectator pick receipt with the selected suspects, actual Saboteurs, score, transcript hash, and receipt hash.",
    },
    {
      name: 'Balance summary',
      schema: 'airlock.balance.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-balance-ci.json',
      generateCommand: 'npm run balance:check',
      verifyCommand: 'npm run verify-balance -- ./artifacts/airlock-balance-ci.json',
      purpose: 'Batch simulator health report with win rates, match-length averages, terminal reasons, and Saboteur pair distribution.',
    },
    {
      name: 'Ladder preview',
      schema: 'airlock.ladder.stage1.preview.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-ladder-32.json',
      generateCommand: 'npm run ladder -- 32 stage-one-ci',
      verifyCommand: 'npm run verify-ladder -- ./artifacts/airlock-ladder-32.json',
      purpose: 'Stage 1 bridge artifact with deterministic Elo-style standings over repeated seeded matches.',
    },
    {
      name: 'Season manifest',
      schema: 'airlock.season.manifest.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-season-stage1-preview.001.json',
      generateCommand: 'npm run season -- stage1-preview.001',
      verifyCommand: 'npm run verify-season -- ./artifacts/airlock-season-stage1-preview.001.json',
      purpose: 'Locked preview-season policy manifest covering ruleset, model policy, authoring requirements, ladder settings, and audit policy.',
    },
    {
      name: 'Agent submission packet',
      schema: 'airlock.agent.submission.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-agent-submission.json',
      generateCommand: 'npm run submit-agent -- src/tests/fixtures/agents/vanta-author.json stage1-preview.001',
      verifyCommand: 'npm run verify-agent-submission -- ./artifacts/airlock-agent-submission.json',
      purpose: 'Stage 1 author intake packet containing a public manifest, validation output, target season hash, and submission hash.',
    },
    {
      name: 'Canonical seed index',
      schema: 'airlock.seed_index.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-seed-index.json',
      generateCommand: 'npm run seed-index',
      verifyCommand: 'npm run verify-seed-index -- ./artifacts/airlock-seed-index.json',
      purpose: 'Compact cross-seed regression table with winners, match lengths, and audit hashes.',
    },
    {
      name: 'Show pack',
      schema: 'airlock.show_pack.stage0.v1',
      format: 'json',
      defaultPath: './artifacts/airlock-show-pack.json',
      generateCommand: 'npm run show-pack',
      verifyCommand: 'npm run verify-show-pack -- ./artifacts/airlock-show-pack.json',
      purpose: "Demo/reviewer pack with multiple seeded matches, pick'em prompts, transcript excerpts, reveal data, and audit hashes.",
    },
  ];
  const catalogCore = {
    schema: 'airlock.artifact_catalog.v1',
    entries,
  } satisfies Omit<ArtifactCatalog, 'catalogHash'>;

  return {
    ...catalogCore,
    catalogHash: digest(catalogCore),
  };
}
