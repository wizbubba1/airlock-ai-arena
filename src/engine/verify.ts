import { buildBalanceSummary } from './balance';
import { buildAuditBundle } from './bundle';
import { runLadderPreview } from './ladder';
import { runMatch } from './match';
import { buildSeedIndex } from './seed-index';
import { buildSeasonManifest } from './season';
import { buildShowPack } from './show-pack';
import type { BalanceSummary } from './balance';
import type { AuditBundle } from './bundle';
import type { LadderSummary } from './ladder';
import type { SeedIndex } from './seed-index';
import type { SeasonManifest } from './season';
import type { ShowPack } from './show-pack';

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

function compare(label: string, actual: unknown, expected: unknown, errors: string[]) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`${label} does not match deterministic replay.`);
  }
}
