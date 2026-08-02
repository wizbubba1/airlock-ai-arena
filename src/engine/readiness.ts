import { digest } from './audit';
import { buildFallbackDrill } from './fallback-drill';
import { buildInferenceReceipts } from './inference-receipts';
import { buildRevealSchedule } from './reveal-schedule';
import { buildSanitizerAudit } from './sanitizer-audit';
import { buildStage0Evaluation } from './stage0-evaluation';
import type { FallbackDrill } from './fallback-drill';
import type { InferenceReceipts } from './inference-receipts';
import type { RevealSchedule } from './reveal-schedule';
import type { SanitizerAudit } from './sanitizer-audit';
import type { Stage0Evaluation } from './stage0-evaluation';

export interface ReadinessGate {
  id: 'attested-receipts' | 'commit-before-render' | 'speech-sanitizer' | 'timeout-fallbacks' | 'stage0-product';
  status: 'pass' | 'fail';
  evidenceHash: string;
  summary: string;
}

export interface OperatorReadiness {
  schema: 'airlock.operator_readiness.stage0.v1';
  seed: string;
  evaluation: Stage0Evaluation;
  inferenceReceipts: InferenceReceipts;
  revealSchedule: RevealSchedule;
  sanitizerAudit: SanitizerAudit;
  fallbackDrill: FallbackDrill;
  gates: ReadinessGate[];
  recommendation: 'ready-for-stage-0-review' | 'fix-before-review';
  readinessHash: string;
}

export function buildOperatorReadiness(seed = 'airlock-stage-zero-demo', matchCount = 100, seedPrefix = 'stage-zero-ci'): OperatorReadiness {
  const evaluation = buildStage0Evaluation(seed, matchCount, seedPrefix);
  const inferenceReceipts = buildInferenceReceipts(seed);
  const revealSchedule = buildRevealSchedule(seed);
  const sanitizerAudit = buildSanitizerAudit(seed);
  const fallbackDrill = buildFallbackDrill(seed);
  const gates: ReadinessGate[] = [
    {
      id: 'attested-receipts',
      status: inferenceReceipts.entries.length > 0 && inferenceReceipts.entries.every((entry) => entry.tokenCount > 0) ? 'pass' : 'fail',
      evidenceHash: inferenceReceipts.receiptsHash,
      summary: `${inferenceReceipts.entries.length} speech receipts cover prompt hashes, output hashes, token counts, and receipt commitments.`,
    },
    {
      id: 'commit-before-render',
      status:
        revealSchedule.entries.length > 0 &&
        revealSchedule.entries.every((entry) => entry.commitPhase === 'commit-before-render') &&
        revealSchedule.policy.latencySideChannelPolicy === 'fixed-delay-public-render'
          ? 'pass'
          : 'fail',
      evidenceHash: revealSchedule.scheduleHash,
      summary: `${revealSchedule.entries.length} tick commitments use fixed ${revealSchedule.policy.operatorUiDelaySeconds}s public reveal slots.`,
    },
    {
      id: 'speech-sanitizer',
      status:
        sanitizerAudit.entries.length > 0 &&
        sanitizerAudit.policy.agentVisibility === 'sanitized-speech-only' &&
        sanitizerAudit.policy.spectatorVisibility === 'original-and-sanitized'
          ? 'pass'
          : 'fail',
      evidenceHash: sanitizerAudit.auditHash,
      summary: `${sanitizerAudit.entries.length} speech entries are covered by deterministic sanitizer evidence.`,
    },
    {
      id: 'timeout-fallbacks',
      status:
        fallbackDrill.entries.some((entry) => entry.fallback.kind === 'action-intent') &&
        fallbackDrill.entries.some((entry) => entry.fallback.kind === 'meeting-speech') &&
        fallbackDrill.entries.some((entry) => entry.fallback.kind === 'vote') &&
        fallbackDrill.policy.poolPolicy === 'void-affected-micro-pools'
          ? 'pass'
          : 'fail',
      evidenceHash: fallbackDrill.drillHash,
      summary: `${fallbackDrill.entries.length} timeout drills cover action, speech, vote, and affected-pool handling.`,
    },
    {
      id: 'stage0-product',
      status: Object.values(evaluation.gates).every(Boolean) ? 'pass' : 'fail',
      evidenceHash: evaluation.evaluationHash,
      summary: `Stage 0 evaluation recommends ${evaluation.recommendation}.`,
    },
  ];
  const readinessCore = {
    schema: 'airlock.operator_readiness.stage0.v1',
    seed,
    evaluation,
    inferenceReceipts,
    revealSchedule,
    sanitizerAudit,
    fallbackDrill,
    gates,
    recommendation: gates.every((gate) => gate.status === 'pass') ? 'ready-for-stage-0-review' : 'fix-before-review',
  } satisfies Omit<OperatorReadiness, 'readinessHash'>;

  return {
    ...readinessCore,
    readinessHash: digest(readinessCore),
  };
}
