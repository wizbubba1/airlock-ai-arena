import { digest } from './audit';
import { buildBalanceSummary, evaluateBalance } from './balance';
import { buildSeedIndex } from './seed-index';
import { buildShowPack } from './show-pack';
import { buildTranscriptQualityReport } from './transcript-quality';
import type { BalanceGuard, BalanceSummary } from './balance';
import type { SeedIndex } from './seed-index';
import type { ShowPack } from './show-pack';
import type { TranscriptQualityReport } from './transcript-quality';

export interface Stage0Evaluation {
  schema: 'airlock.stage0_evaluation.v1';
  seed: string;
  balance: BalanceSummary;
  balanceGuard: BalanceGuard;
  seedIndex: SeedIndex;
  showPack: ShowPack;
  transcriptQuality: TranscriptQualityReport;
  gates: {
    deterministicArtifacts: boolean;
    balanceHealthy: boolean;
    transcriptLegible: boolean;
    showPackReady: boolean;
  };
  recommendation: 'continue-stage-0' | 'rebalance-before-stage-1';
  evaluationHash: string;
}

export function buildStage0Evaluation(seed = 'airlock-stage-zero-demo', matchCount = 100, seedPrefix = 'stage-zero-ci'): Stage0Evaluation {
  const balance = buildBalanceSummary(matchCount, seedPrefix);
  const balanceGuard = evaluateBalance(balance);
  const seedIndex = buildSeedIndex();
  const showPack = buildShowPack();
  const transcriptQuality = buildTranscriptQualityReport(seed);
  const gates = {
    deterministicArtifacts: seedIndex.seeds.length > 0 && showPack.matches.length > 0,
    balanceHealthy: balanceGuard.ok,
    transcriptLegible: transcriptQuality.events.total > 0 && transcriptQuality.events.speech > 0 && transcriptQuality.meetings > 0,
    showPackReady: showPack.matches.every((match) => match.openingTranscript.length > 0 && match.meetingTranscript.length > 0),
  };
  const evaluationCore = {
    schema: 'airlock.stage0_evaluation.v1',
    seed,
    balance,
    balanceGuard,
    seedIndex,
    showPack,
    transcriptQuality,
    gates,
    recommendation: Object.values(gates).every(Boolean) ? 'continue-stage-0' : 'rebalance-before-stage-1',
  } satisfies Omit<Stage0Evaluation, 'evaluationHash'>;

  return {
    ...evaluationCore,
    evaluationHash: digest(evaluationCore),
  };
}
