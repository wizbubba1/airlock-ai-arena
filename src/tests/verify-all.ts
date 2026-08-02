import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildArtifactCatalog,
  buildArtifactCatalogReport,
  buildAuditBundle,
  buildBalanceSummary,
  buildChallengePacket,
  buildLadderReport,
  buildSeedIndex,
  buildSeedIndexReport,
  buildSeasonManifest,
  buildShowPack,
  buildShowPackReport,
  buildStage0Evaluation,
  buildStage0EvaluationMarkdown,
  buildTranscriptQualityMarkdown,
  buildTranscriptQualityReport,
  evaluateBalance,
  runLadderPreview,
  runMatch,
  verifyAuditBundle,
  verifyBalanceSummary,
  verifyLadderSummary,
  verifySeasonManifest,
  verifySeedIndex,
  verifyShowPack,
  verifyStage0Evaluation,
  verifyTranscriptQualityReport,
} from '../engine';
import { buildAgentSubmissionPacket, verifyAgentSubmissionPacket } from '../authoring/submission';
import sampleManifest from './fixtures/agents/vanta-author.json';
import type { AuthoredAgentManifest } from '../authoring/manifest';

const artifactDir = resolve('./artifacts');
mkdirSync(artifactDir, { recursive: true });

const seed = 'airlock-stage-zero-demo';
const seasonId = 'stage1-preview.001';
const manifest = sampleManifest as AuthoredAgentManifest;

const match = runMatch(seed);
const audit = buildAuditBundle(match, seed);
const challenge = buildChallengePacket(seed);
const balance = buildBalanceSummary(100, 'stage-zero-ci');
const ladder = runLadderPreview(32, 'stage-one-ci');
const season = buildSeasonManifest(seasonId);
const seedIndex = buildSeedIndex();
const showPack = buildShowPack();
const transcriptQuality = buildTranscriptQualityReport(seed);
const stage0Evaluation = buildStage0Evaluation(seed, 100, 'stage-zero-ci');
const agentSubmission = buildAgentSubmissionPacket(manifest, seasonId);
const catalog = buildArtifactCatalog();

const outputs = [
  writeJson('airlock-audit-airlock-stage-zero-demo.json', audit),
  writeJson('airlock-challenge-airlock-stage-zero-demo.json', challenge),
  writeJson('airlock-balance-ci.json', balance),
  writeJson('airlock-ladder-32.json', ladder),
  writeMarkdown('airlock-ladder-32.md', buildLadderReport(ladder)),
  writeJson('airlock-season-stage1-preview.001.json', season),
  writeJson('airlock-seed-index.json', seedIndex),
  writeMarkdown('airlock-seed-index.md', buildSeedIndexReport(seedIndex)),
  writeJson('airlock-show-pack.json', showPack),
  writeMarkdown('airlock-show-pack.md', buildShowPackReport(showPack)),
  writeJson('airlock-transcript-quality-airlock-stage-zero-demo.json', transcriptQuality),
  writeMarkdown('airlock-transcript-quality-airlock-stage-zero-demo.md', buildTranscriptQualityMarkdown(transcriptQuality)),
  writeJson('airlock-stage0-evaluation.json', stage0Evaluation),
  writeMarkdown('airlock-stage0-evaluation.md', buildStage0EvaluationMarkdown(stage0Evaluation)),
  writeJson('airlock-agent-submission.json', agentSubmission),
  writeJson('airlock-artifact-catalog.json', catalog),
  writeMarkdown('airlock-artifact-catalog.md', buildArtifactCatalogReport(catalog)),
];

const checks = [
  { name: 'audit', ...verifyAuditBundle(audit) },
  { name: 'challenge', ok: challenge.verification.ok, errors: challenge.verification.errors },
  { name: 'balance-guard', ...evaluateBalance(balance) },
  { name: 'balance', ...verifyBalanceSummary(balance) },
  { name: 'ladder', ...verifyLadderSummary(ladder) },
  { name: 'season', ...verifySeasonManifest(season) },
  { name: 'seed-index', ...verifySeedIndex(seedIndex) },
  { name: 'show-pack', ...verifyShowPack(showPack) },
  { name: 'transcript-quality', ...verifyTranscriptQualityReport(transcriptQuality) },
  { name: 'stage0-evaluation', ...verifyStage0Evaluation(stage0Evaluation) },
  { name: 'agent-submission', ...verifyAgentSubmissionPacket(agentSubmission) },
];

const ok = checks.every((check) => check.ok);

console.log(
  JSON.stringify(
    {
      ok,
      artifactDir,
      outputs,
      checks: checks.map((check) => ({
        name: check.name,
        ok: check.ok,
        errors: check.errors,
      })),
    },
    null,
    2,
  ),
);

if (!ok) {
  process.exitCode = 1;
}

function writeJson(filename: string, value: unknown): string {
  const path = resolve(artifactDir, filename);
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  return path;
}

function writeMarkdown(filename: string, value: string): string {
  const path = resolve(artifactDir, filename);
  writeFileSync(path, value);
  return path;
}
