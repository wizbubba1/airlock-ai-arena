import { buildBalanceSummary } from './balance';
import { buildAuditBundle } from './bundle';
import { runLadderPreview } from './ladder';
import { runMatch } from './match';
import { buildSeedIndex } from './seed-index';
import { buildSeasonManifest } from './season';
import { buildShowPack } from './show-pack';
import { buildStage0Evaluation } from './stage0-evaluation';
import { buildTranscriptQualityReport } from './transcript-quality';
import type { BalanceSummary } from './balance';
import type { AuditBundle } from './bundle';
import type { LadderSummary } from './ladder';
import type { SeedIndex } from './seed-index';
import type { SeasonManifest } from './season';
import type { ShowPack } from './show-pack';
import type { Stage0Evaluation } from './stage0-evaluation';
import type { TranscriptQualityReport } from './transcript-quality';

export interface AuditVerificationResult {
  ok: boolean;
  seed: string;
  errors: string[];
  expected: AuditBundle;
}

export interface BalanceVerificationResult {
  ok: boolean;
  matchCount: number;
  seedPrefix: string;
  errors: string[];
  expected: BalanceSummary;
}

export interface LadderVerificationResult {
  ok: boolean;
  matchCount: number;
  seedPrefix: string;
  errors: string[];
  expected: LadderSummary;
}

export interface SeedIndexVerificationResult {
  ok: boolean;
  seeds: string[];
  errors: string[];
  expected: SeedIndex;
}

export interface SeasonManifestVerificationResult {
  ok: boolean;
  seasonId: string;
  errors: string[];
  expected: SeasonManifest;
}

export interface ShowPackVerificationResult {
  ok: boolean;
  seeds: string[];
  errors: string[];
  expected: ShowPack;
}

export interface TranscriptQualityVerificationResult {
  ok: boolean;
  seed: string;
  errors: string[];
  expected: TranscriptQualityReport;
}

export interface Stage0EvaluationVerificationResult {
  ok: boolean;
  seed: string;
  errors: string[];
  expected: Stage0Evaluation;
}

export function verifyAuditBundle(bundle: AuditBundle): AuditVerificationResult {
  const expected = buildAuditBundle(runMatch(bundle.seed), bundle.seed);
  const errors: string[] = [];

  compare('schema', bundle.schema, expected.schema, errors);
  compare('commitments', bundle.commitments, expected.commitments, errors);
  compare('result', bundle.result, expected.result, errors);
  compare('publicTranscript', bundle.publicTranscript, expected.publicTranscript, errors);
  compare('market', bundle.market, expected.market, errors);
  compare('publicSnapshots', bundle.publicSnapshots, expected.publicSnapshots, errors);
  compare('entropy', bundle.entropy, expected.entropy, errors);
  compare('tickCommitments', bundle.tickCommitments, expected.tickCommitments, errors);

  return {
    ok: errors.length === 0,
    seed: bundle.seed,
    errors,
    expected,
  };
}

export function verifyBalanceSummary(summary: BalanceSummary): BalanceVerificationResult {
  const expected = buildBalanceSummary(summary.matchCount, summary.seedPrefix);
  const errors: string[] = [];

  compare('schema', summary.schema, expected.schema, errors);
  compare('wins', summary.wins, expected.wins, errors);
  compare('averages', summary.averages, expected.averages, errors);
  compare('saboteurPairs', summary.saboteurPairs, expected.saboteurPairs, errors);
  compare('terminalReasons', summary.terminalReasons, expected.terminalReasons, errors);

  return {
    ok: errors.length === 0,
    matchCount: summary.matchCount,
    seedPrefix: summary.seedPrefix,
    errors,
    expected,
  };
}

export function verifyLadderSummary(summary: LadderSummary): LadderVerificationResult {
  const expected = runLadderPreview(summary.matchCount, summary.seedPrefix);
  const errors: string[] = [];

  compare('schema', summary.schema, expected.schema, errors);
  compare('standings', summary.standings, expected.standings, errors);
  compare('matches', summary.matches, expected.matches, errors);

  return {
    ok: errors.length === 0,
    matchCount: summary.matchCount,
    seedPrefix: summary.seedPrefix,
    errors,
    expected,
  };
}

export function verifySeedIndex(index: SeedIndex): SeedIndexVerificationResult {
  const seeds = index.seeds.map((entry) => entry.seed);
  const expected = buildSeedIndex(seeds);
  const errors: string[] = [];

  compare('schema', index.schema, expected.schema, errors);
  compare('ruleset', index.ruleset, expected.ruleset, errors);
  compare('seeds', index.seeds, expected.seeds, errors);

  return {
    ok: errors.length === 0,
    seeds,
    errors,
    expected,
  };
}

export function verifySeasonManifest(manifest: SeasonManifest): SeasonManifestVerificationResult {
  const expected = buildSeasonManifest(manifest.seasonId);
  const errors: string[] = [];

  compare('schema', manifest.schema, expected.schema, errors);
  compare('status', manifest.status, expected.status, errors);
  compare('ruleset', manifest.ruleset, expected.ruleset, errors);
  compare('modelPolicy', manifest.modelPolicy, expected.modelPolicy, errors);
  compare('authoring', manifest.authoring, expected.authoring, errors);
  compare('ladder', manifest.ladder, expected.ladder, errors);
  compare('auditPolicy', manifest.auditPolicy, expected.auditPolicy, errors);
  compare('manifestHash', manifest.manifestHash, expected.manifestHash, errors);

  return {
    ok: errors.length === 0,
    seasonId: manifest.seasonId,
    errors,
    expected,
  };
}

export function verifyShowPack(pack: ShowPack): ShowPackVerificationResult {
  const seeds = pack.matches.map((match) => match.seed);
  const expected = buildShowPack(seeds);
  const errors: string[] = [];

  compare('schema', pack.schema, expected.schema, errors);
  compare('ruleset', pack.ruleset, expected.ruleset, errors);
  compare('matches', pack.matches, expected.matches, errors);
  compare('packHash', pack.packHash, expected.packHash, errors);

  return {
    ok: errors.length === 0,
    seeds,
    errors,
    expected,
  };
}

export function verifyTranscriptQualityReport(report: TranscriptQualityReport): TranscriptQualityVerificationResult {
  const expected = buildTranscriptQualityReport(report.seed);
  const errors: string[] = [];

  compare('schema', report.schema, expected.schema, errors);
  compare('events', report.events, expected.events, errors);
  compare('density', report.density, expected.density, errors);
  compare('meetings', report.meetings, expected.meetings, errors);
  compare('ticks', report.ticks, expected.ticks, errors);
  compare('winner', report.winner, expected.winner, errors);
  compare('transcriptHash', report.transcriptHash, expected.transcriptHash, errors);
  compare('qualityHash', report.qualityHash, expected.qualityHash, errors);

  if (report.events.total <= 0) errors.push('transcript has no events.');
  if (report.events.speech <= 0) errors.push('transcript has no speech events.');

  return {
    ok: errors.length === 0,
    seed: report.seed,
    errors,
    expected,
  };
}

export function verifyStage0Evaluation(evaluation: Stage0Evaluation): Stage0EvaluationVerificationResult {
  const expected = buildStage0Evaluation(evaluation.seed, evaluation.balance.matchCount, evaluation.balance.seedPrefix);
  const errors: string[] = [];

  compare('schema', evaluation.schema, expected.schema, errors);
  compare('balance', evaluation.balance, expected.balance, errors);
  compare('balanceGuard', evaluation.balanceGuard, expected.balanceGuard, errors);
  compare('seedIndex', evaluation.seedIndex, expected.seedIndex, errors);
  compare('showPack', evaluation.showPack, expected.showPack, errors);
  compare('transcriptQuality', evaluation.transcriptQuality, expected.transcriptQuality, errors);
  compare('gates', evaluation.gates, expected.gates, errors);
  compare('recommendation', evaluation.recommendation, expected.recommendation, errors);
  compare('evaluationHash', evaluation.evaluationHash, expected.evaluationHash, errors);

  return {
    ok: errors.length === 0,
    seed: evaluation.seed,
    errors,
    expected,
  };
}

function compare(label: string, actual: unknown, expected: unknown, errors: string[]) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`${label} does not match deterministic replay.`);
  }
}
