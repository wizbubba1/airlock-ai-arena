import { buildBalancePatchSchedule } from './balance-patch-schedule';
import { buildBalanceSummary } from './balance';
import { buildAuditBundle } from './bundle';
import { buildCertifiedEventFeed } from './event-feed';
import { buildCollusionControls } from './collusion-controls';
import { buildFallbackDrill } from './fallback-drill';
import { buildInferenceReceipts } from './inference-receipts';
import { runLadderPreview } from './ladder';
import { buildMarketReadiness } from './market-readiness';
import { buildOperatorReadiness } from './readiness';
import { runMatch } from './match';
import { buildRevealSchedule } from './reveal-schedule';
import { buildSanitizerAudit } from './sanitizer-audit';
import { buildSeedIndex } from './seed-index';
import { buildSeasonManifest } from './season';
import { buildShowPack } from './show-pack';
import { buildStage0Evaluation } from './stage0-evaluation';
import { buildTranscriptQualityReport } from './transcript-quality';
import type { BalancePatchSchedule } from './balance-patch-schedule';
import type { BalanceSummary } from './balance';
import type { AuditBundle } from './bundle';
import type { CertifiedEventFeed } from './event-feed';
import type { CollusionControls } from './collusion-controls';
import type { FallbackDrill } from './fallback-drill';
import type { InferenceReceipts } from './inference-receipts';
import type { LadderSummary } from './ladder';
import type { MarketReadiness } from './market-readiness';
import type { OperatorReadiness } from './readiness';
import type { RevealSchedule } from './reveal-schedule';
import type { SanitizerAudit } from './sanitizer-audit';
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

export interface BalancePatchScheduleVerificationResult {
  ok: boolean;
  seasonId: string;
  errors: string[];
  expected: BalancePatchSchedule;
}

export interface CertifiedEventFeedVerificationResult {
  ok: boolean;
  seed: string;
  errors: string[];
  expected: CertifiedEventFeed;
}

export interface CollusionControlsVerificationResult {
  ok: boolean;
  seasonId: string;
  errors: string[];
  expected: CollusionControls;
}

export interface FallbackDrillVerificationResult {
  ok: boolean;
  seed: string;
  errors: string[];
  expected: FallbackDrill;
}

export interface LadderVerificationResult {
  ok: boolean;
  matchCount: number;
  seedPrefix: string;
  errors: string[];
  expected: LadderSummary;
}

export interface InferenceReceiptsVerificationResult {
  ok: boolean;
  seed: string;
  errors: string[];
  expected: InferenceReceipts;
}

export interface OperatorReadinessVerificationResult {
  ok: boolean;
  seed: string;
  errors: string[];
  expected: OperatorReadiness;
}

export interface MarketReadinessVerificationResult {
  ok: boolean;
  seed: string;
  errors: string[];
  expected: MarketReadiness;
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

export interface RevealScheduleVerificationResult {
  ok: boolean;
  seed: string;
  errors: string[];
  expected: RevealSchedule;
}

export interface SanitizerAuditVerificationResult {
  ok: boolean;
  seed: string;
  errors: string[];
  expected: SanitizerAudit;
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

export function verifyBalancePatchSchedule(schedule: BalancePatchSchedule): BalancePatchScheduleVerificationResult {
  const expected = buildBalancePatchSchedule(schedule.seasonId);
  const errors: string[] = [];

  compare('schema', schedule.schema, expected.schema, errors);
  compare('baseRuleset', schedule.baseRuleset, expected.baseRuleset, errors);
  compare('cadence', schedule.cadence, expected.cadence, errors);
  compare('guardrails', schedule.guardrails, expected.guardrails, errors);
  compare('mutations', schedule.mutations, expected.mutations, errors);
  compare('scheduleHash', schedule.scheduleHash, expected.scheduleHash, errors);

  if (schedule.mutations.length === 0) errors.push('balance patch schedule has no precommitted mutations.');
  if (schedule.mutations.some((mutation) => mutation.operatorDiscretion !== 'none-precommitted-only')) {
    errors.push('balance patch schedule contains operator-discretionary mutations.');
  }

  return {
    ok: errors.length === 0,
    seasonId: schedule.seasonId,
    errors,
    expected,
  };
}

export function verifyCertifiedEventFeed(feed: CertifiedEventFeed): CertifiedEventFeedVerificationResult {
  const expected = buildCertifiedEventFeed(feed.seed);
  const errors: string[] = [];

  compare('schema', feed.schema, expected.schema, errors);
  compare('policy', feed.policy, expected.policy, errors);
  compare('commitments', feed.commitments, expected.commitments, errors);
  compare('events', feed.events, expected.events, errors);
  compare('terminal', feed.terminal, expected.terminal, errors);
  compare('feedHash', feed.feedHash, expected.feedHash, errors);

  if (feed.events.length === 0) errors.push('certified event feed has no events.');
  if (/"role"|"saboteurs"/.test(JSON.stringify(feed.events))) {
    errors.push('certified event feed events contain private role fields.');
  }
  if (!feed.policy.excludes.includes('chain_of_thought')) {
    errors.push('certified event feed policy must exclude chain-of-thought.');
  }

  return {
    ok: errors.length === 0,
    seed: feed.seed,
    errors,
    expected,
  };
}

export function verifyCollusionControls(controls: CollusionControls): CollusionControlsVerificationResult {
  const expected = buildCollusionControls(controls.seasonId);
  const errors: string[] = [];

  compare('schema', controls.schema, expected.schema, errors);
  compare('scope', controls.scope, expected.scope, errors);
  compare('bondTiers', controls.bondTiers, expected.bondTiers, errors);
  compare('steganographyControls', controls.steganographyControls, expected.steganographyControls, errors);
  compare('throwDetection', controls.throwDetection, expected.throwDetection, errors);
  compare('monitoredAgents', controls.monitoredAgents, expected.monitoredAgents, errors);
  compare('controlsHash', controls.controlsHash, expected.controlsHash, errors);

  if (controls.bondTiers.length < 3) errors.push('collusion controls must define at least three bond tiers.');
  if (!controls.bondTiers.every((tier, index, tiers) => index === 0 || tier.bondMultiple > tiers[index - 1].bondMultiple)) {
    errors.push('bond tiers must scale superlinearly as owned agents increase.');
  }
  if (controls.scope.bettingPolicy !== 'authors-blocked-from-own-match-pools') {
    errors.push('authors must remain blocked from own-match pools.');
  }
  if (controls.steganographyControls.exactTokenSignals !== 'dampened-before-agent-context') {
    errors.push('exact-token signals must be dampened before agent context.');
  }
  if (!controls.throwDetection.some((metric) => metric.action === 'forfeit-season-escrow')) {
    errors.push('throw detection must include a season-escrow forfeiture path.');
  }

  return {
    ok: errors.length === 0,
    seasonId: controls.seasonId,
    errors,
    expected,
  };
}

export function verifyFallbackDrill(drill: FallbackDrill): FallbackDrillVerificationResult {
  const expected = buildFallbackDrill(drill.seed, drill.policy.timeoutMs);
  const errors: string[] = [];

  compare('schema', drill.schema, expected.schema, errors);
  compare('policy', drill.policy, expected.policy, errors);
  compare('entries', drill.entries, expected.entries, errors);
  compare('drillHash', drill.drillHash, expected.drillHash, errors);

  if (drill.entries.length === 0) errors.push('fallback drill has no entries.');
  if (drill.entries.some((entry) => entry.voidPolicy !== drill.policy.poolPolicy)) {
    errors.push('one or more fallback entries do not use the configured pool void policy.');
  }

  return {
    ok: errors.length === 0,
    seed: drill.seed,
    errors,
    expected,
  };
}

export function verifyInferenceReceipts(receipts: InferenceReceipts): InferenceReceiptsVerificationResult {
  const expected = buildInferenceReceipts(receipts.seed);
  const errors: string[] = [];

  compare('schema', receipts.schema, expected.schema, errors);
  compare('ruleset', receipts.ruleset, expected.ruleset, errors);
  compare('policy', receipts.policy, expected.policy, errors);
  compare('entries', receipts.entries, expected.entries, errors);
  compare('receiptsHash', receipts.receiptsHash, expected.receiptsHash, errors);

  if (receipts.entries.length === 0) errors.push('inference receipts have no speech entries.');
  for (const entry of receipts.entries) {
    if (entry.tokenCount <= 0) errors.push(`receipt ${entry.eventId} has no tokens.`);
    if (!entry.promptHash.startsWith('sha256:')) errors.push(`receipt ${entry.eventId} has an invalid prompt hash.`);
    if (!entry.outputHash.startsWith('sha256:')) errors.push(`receipt ${entry.eventId} has an invalid output hash.`);
    if (!entry.logprobCommitment.startsWith('sha256:')) {
      errors.push(`receipt ${entry.eventId} has an invalid logprob commitment.`);
    }
    if (!entry.receiptHash.startsWith('sha256:')) errors.push(`receipt ${entry.eventId} has an invalid receipt hash.`);
  }

  return {
    ok: errors.length === 0,
    seed: receipts.seed,
    errors,
    expected,
  };
}

export function verifyOperatorReadiness(readiness: OperatorReadiness): OperatorReadinessVerificationResult {
  const expected = buildOperatorReadiness(
    readiness.seed,
    readiness.evaluation.balance.matchCount,
    readiness.evaluation.balance.seedPrefix,
  );
  const errors: string[] = [];

  compare('schema', readiness.schema, expected.schema, errors);
  compare('evaluation', readiness.evaluation, expected.evaluation, errors);
  compare('inferenceReceipts', readiness.inferenceReceipts, expected.inferenceReceipts, errors);
  compare('revealSchedule', readiness.revealSchedule, expected.revealSchedule, errors);
  compare('sanitizerAudit', readiness.sanitizerAudit, expected.sanitizerAudit, errors);
  compare('fallbackDrill', readiness.fallbackDrill, expected.fallbackDrill, errors);
  compare('gates', readiness.gates, expected.gates, errors);
  compare('recommendation', readiness.recommendation, expected.recommendation, errors);
  compare('readinessHash', readiness.readinessHash, expected.readinessHash, errors);

  if (readiness.gates.length !== 5) errors.push('operator readiness must contain five gates.');
  if (readiness.gates.some((gate) => gate.status !== 'pass')) errors.push('one or more operator readiness gates failed.');

  return {
    ok: errors.length === 0,
    seed: readiness.seed,
    errors,
    expected,
  };
}

export function verifyMarketReadiness(readiness: MarketReadiness): MarketReadinessVerificationResult {
  const options = {
    ...(readiness.evidence.counselMemoHash ? { counselMemoHash: readiness.evidence.counselMemoHash } : {}),
    ...(readiness.evidence.jurisdictionPolicyHash ? { jurisdictionPolicyHash: readiness.evidence.jurisdictionPolicyHash } : {}),
    ...(readiness.evidence.licensedOperatorHash ? { licensedOperatorHash: readiness.evidence.licensedOperatorHash } : {}),
    ...(readiness.evidence.responsiblePlayPolicyHash
      ? { responsiblePlayPolicyHash: readiness.evidence.responsiblePlayPolicyHash }
      : {}),
  };
  const expected = buildMarketReadiness(readiness.seed, options);
  const errors: string[] = [];

  compare('schema', readiness.schema, expected.schema, errors);
  compare('mode', readiness.mode, expected.mode, errors);
  compare('policy', readiness.policy, expected.policy, errors);
  compare('evidence', readiness.evidence, expected.evidence, errors);
  compare('gates', readiness.gates, expected.gates, errors);
  compare('readinessHash', readiness.readinessHash, expected.readinessHash, errors);

  if (readiness.policy.directConsumerBetting !== 'not-implemented') {
    errors.push('direct consumer betting must remain unimplemented in this artifact.');
  }
  if (readiness.gates.length !== 5) errors.push('market readiness must contain five gates.');
  if (readiness.mode === 'b2b-feed-ready' && readiness.gates.some((gate) => gate.status !== 'pass')) {
    errors.push('b2b-feed-ready mode requires every gate to pass.');
  }

  return {
    ok: errors.length === 0,
    seed: readiness.seed,
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

export function verifyRevealSchedule(schedule: RevealSchedule): RevealScheduleVerificationResult {
  const expected = buildRevealSchedule(schedule.seed, schedule.policy.operatorUiDelaySeconds);
  const errors: string[] = [];

  compare('schema', schedule.schema, expected.schema, errors);
  compare('policy', schedule.policy, expected.policy, errors);
  compare('entries', schedule.entries, expected.entries, errors);
  compare('scheduleHash', schedule.scheduleHash, expected.scheduleHash, errors);

  if (schedule.entries.length === 0) errors.push('reveal schedule has no tick commitments.');
  for (const entry of schedule.entries) {
    if (entry.publicRevealSlot !== entry.tick * entry.revealDelaySeconds) {
      errors.push(`tick ${entry.tick} reveal slot does not match configured delay.`);
    }
  }

  return {
    ok: errors.length === 0,
    seed: schedule.seed,
    errors,
    expected,
  };
}

export function verifySanitizerAudit(audit: SanitizerAudit): SanitizerAuditVerificationResult {
  const expected = buildSanitizerAudit(audit.seed);
  const errors: string[] = [];

  compare('schema', audit.schema, expected.schema, errors);
  compare('policy', audit.policy, expected.policy, errors);
  compare('entries', audit.entries, expected.entries, errors);
  compare('changedEntries', audit.changedEntries, expected.changedEntries, errors);
  compare('auditHash', audit.auditHash, expected.auditHash, errors);

  if (audit.entries.length === 0) errors.push('sanitizer audit has no speech entries.');

  return {
    ok: errors.length === 0,
    seed: audit.seed,
    errors,
    expected,
  };
}

function compare(label: string, actual: unknown, expected: unknown, errors: string[]) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`${label} does not match deterministic replay.`);
  }
}
