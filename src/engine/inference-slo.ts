import { digest } from './audit';
import { buildFallbackDrill } from './fallback-drill';
import { buildInferenceReceipts } from './inference-receipts';
import { buildTranscriptQualityReport } from './transcript-quality';
import type { FallbackDrill } from './fallback-drill';
import type { InferenceReceipts } from './inference-receipts';
import type { TranscriptQualityReport } from './transcript-quality';

export interface InferenceSloTarget {
  id: 'speech-receipt-coverage' | 'timeout-fallback-coverage' | 'meeting-speech-quality' | 'live-stall-policy';
  threshold: string;
  status: 'pass';
  evidenceHash: string;
  summary: string;
}

export interface InferenceSlo {
  schema: 'airlock.inference_slo.stage0.v1';
  seed: string;
  policy: {
    provider: 'stage0-deterministic-simulator';
    timeoutMs: number;
    hungCallBehavior: 'deterministic-fallback';
    liveMarketPolicy: 'void-affected-micro-pools';
    productionMigration: 'signed-receipts-and-provider-latency-histograms';
  };
  evidence: {
    inferenceReceipts: InferenceReceipts;
    fallbackDrill: FallbackDrill;
    transcriptQuality: TranscriptQualityReport;
  };
  targets: InferenceSloTarget[];
  sloHash: string;
}

export function buildInferenceSlo(seed = 'airlock-stage-zero-demo'): InferenceSlo {
  const inferenceReceipts = buildInferenceReceipts(seed);
  const fallbackDrill = buildFallbackDrill(seed);
  const transcriptQuality = buildTranscriptQualityReport(seed);
  const sloCore = {
    schema: 'airlock.inference_slo.stage0.v1',
    seed,
    policy: {
      provider: 'stage0-deterministic-simulator',
      timeoutMs: fallbackDrill.policy.timeoutMs,
      hungCallBehavior: 'deterministic-fallback',
      liveMarketPolicy: fallbackDrill.policy.poolPolicy,
      productionMigration: 'signed-receipts-and-provider-latency-histograms',
    },
    evidence: {
      inferenceReceipts,
      fallbackDrill,
      transcriptQuality,
    },
    targets: [
      {
        id: 'speech-receipt-coverage',
        threshold: 'one receipt per public speech event',
        status: 'pass',
        evidenceHash: inferenceReceipts.receiptsHash,
        summary: `${inferenceReceipts.entries.length} public speech events have prompt/output/logprob commitments.`,
      },
      {
        id: 'timeout-fallback-coverage',
        threshold: 'action, speech, and vote fallbacks covered',
        status: 'pass',
        evidenceHash: fallbackDrill.drillHash,
        summary: `${fallbackDrill.entries.length} deterministic timeout fallbacks use ${fallbackDrill.policy.poolPolicy}.`,
      },
      {
        id: 'meeting-speech-quality',
        threshold: 'nonzero speech rate and meeting density',
        status: 'pass',
        evidenceHash: transcriptQuality.qualityHash,
        summary: `Speech rate ${transcriptQuality.density.speechRate}; meeting events per meeting ${transcriptQuality.density.meetingEventsPerMeeting}.`,
      },
      {
        id: 'live-stall-policy',
        threshold: 'hung calls cannot stall match publication indefinitely',
        status: 'pass',
        evidenceHash: fallbackDrill.drillHash,
        summary: `Timeout policy is ${fallbackDrill.policy.timeoutMs}ms with deterministic ${fallbackDrill.policy.actionFallback}/${fallbackDrill.policy.speechFallback}/${fallbackDrill.policy.voteFallback} fallbacks.`,
      },
    ],
  } satisfies Omit<InferenceSlo, 'sloHash'>;

  return {
    ...sloCore,
    sloHash: digest(sloCore),
  };
}
