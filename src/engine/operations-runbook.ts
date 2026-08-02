import { digest } from './audit';

export type RunbookSeverity = 'sev1' | 'sev2' | 'sev3';

export interface OperationsRunbookTrigger {
  id: string;
  severity: RunbookSeverity;
  signal: string;
  threshold: string;
  owner: 'operator' | 'engineering' | 'audit';
  action: string;
}

export interface OperationsRunbookStep {
  id: string;
  phase: 'detect' | 'contain' | 'communicate' | 'recover' | 'review';
  owner: 'operator' | 'engineering' | 'audit';
  maxDelayMinutes: number;
  action: string;
}

export interface OperationsRunbook {
  schema: 'airlock.operations_runbook.stage0.v1';
  programId: string;
  policy: {
    moneyMarketsEnabled: false;
    publicIncidentLogRequired: true;
    frozenMatchPolicy: 'freeze-reveal-and-mark-demo-void';
    auditDisputePolicy: 'publish-artifact-diff-and-open-review';
  };
  triggers: OperationsRunbookTrigger[];
  steps: OperationsRunbookStep[];
  evidenceArtifacts: string[];
  runbookHash: string;
}

export function buildOperationsRunbook(programId = 'airlock-roadmap.001'): OperationsRunbook {
  const runbookCore = {
    schema: 'airlock.operations_runbook.stage0.v1',
    programId,
    policy: {
      moneyMarketsEnabled: false,
      publicIncidentLogRequired: true,
      frozenMatchPolicy: 'freeze-reveal-and-mark-demo-void',
      auditDisputePolicy: 'publish-artifact-diff-and-open-review',
    },
    triggers: [
      {
        id: 'delayed-reveal',
        severity: 'sev2',
        signal: 'public reveal slot missed after tick commitment',
        threshold: '> 60 seconds past scheduled reveal',
        owner: 'operator',
        action: 'freeze live demo UI, publish delay notice, resume from committed tick only after artifact verifier passes',
      },
      {
        id: 'fallback-spike',
        severity: 'sev2',
        signal: 'inference timeout fallback rate increases',
        threshold: '>= 3 fallback events in one match or >= 10% across show block',
        owner: 'engineering',
        action: 'disable queued show matches, inspect provider latency, regenerate fallback drill evidence',
      },
      {
        id: 'audit-drift',
        severity: 'sev1',
        signal: 'artifact verifier or challenge packet disagrees with deterministic replay',
        threshold: 'any verifier mismatch',
        owner: 'audit',
        action: 'halt publication queue, preserve artifacts, publish diff summary, open audit review',
      },
      {
        id: 'private-leak',
        severity: 'sev1',
        signal: 'public feed contains hidden role, prompt, or chain-of-thought field before terminal reveal',
        threshold: 'any leaked private field',
        owner: 'audit',
        action: 'remove affected public feed, mark match invalid, rotate affected artifacts after root-cause review',
      },
      {
        id: 'quality-regression',
        severity: 'sev3',
        signal: 'transcript quality or stage evaluation drops below Stage 0 gate',
        threshold: 'transcript quality verifier fails or stage0 recommendation is hold',
        owner: 'operator',
        action: 'hold demo promotion, update house personas or balance settings, rerun seed index and show pack',
      },
    ],
    steps: [
      {
        id: 'detect-with-verifiers',
        phase: 'detect',
        owner: 'operator',
        maxDelayMinutes: 5,
        action: 'run verify-all and record failing artifact names before changing any artifact inputs',
      },
      {
        id: 'contain-public-surface',
        phase: 'contain',
        owner: 'operator',
        maxDelayMinutes: 10,
        action: 'freeze affected demo match pages and label any pickem receipts as demo-void',
      },
      {
        id: 'preserve-evidence',
        phase: 'contain',
        owner: 'engineering',
        maxDelayMinutes: 10,
        action: 'archive JSON and Markdown artifacts, commit SHA, build logs, and generated hashes',
      },
      {
        id: 'publish-status',
        phase: 'communicate',
        owner: 'operator',
        maxDelayMinutes: 20,
        action: 'publish a short incident note with affected seed, trigger ID, current state, and next update time',
      },
      {
        id: 'recover-from-artifacts',
        phase: 'recover',
        owner: 'engineering',
        maxDelayMinutes: 60,
        action: 'resume only from deterministic committed artifacts that pass their dedicated verifier and verify-all',
      },
      {
        id: 'post-incident-review',
        phase: 'review',
        owner: 'audit',
        maxDelayMinutes: 1440,
        action: 'publish trigger, root cause, artifact hashes, verifier output, and prevention item',
      },
    ],
    evidenceArtifacts: [
      'airlock-audit-airlock-stage-zero-demo.json',
      'airlock-event-feed-airlock-stage-zero-demo.json',
      'airlock-fallback-drill-airlock-stage-zero-demo.json',
      'airlock-randomness-beacon-plan-airlock-stage-zero-demo.json',
      'airlock-reveal-schedule-airlock-stage-zero-demo.json',
      'airlock-stage0-evaluation.json',
    ],
  } satisfies Omit<OperationsRunbook, 'runbookHash'>;

  return {
    ...runbookCore,
    runbookHash: digest(runbookCore),
  };
}
