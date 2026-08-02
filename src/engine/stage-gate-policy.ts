import { digest } from './audit';

export type ProductStage = 'stage-0-show' | 'stage-1-ladder' | 'stage-2-market';

export interface StageGateMetric {
  id: string;
  stage: ProductStage;
  threshold: string;
  sourceArtifact: string;
  actionOnMiss: 'stop' | 'hold-stage' | 'pivot-to-b2b-feed';
}

export interface StageGatePolicy {
  schema: 'airlock.stage_gate_policy.v1';
  programId: string;
  sequencing: ProductStage[];
  principles: {
    bettingLast: true;
    independentStageExit: true;
    counselBeforeRealMoneyScope: true;
  };
  metrics: StageGateMetric[];
  policyHash: string;
}

export function buildStageGatePolicy(programId = 'airlock-roadmap.001'): StageGatePolicy {
  const policyCore = {
    schema: 'airlock.stage_gate_policy.v1',
    programId,
    sequencing: ['stage-0-show', 'stage-1-ladder', 'stage-2-market'],
    principles: {
      bettingLast: true,
      independentStageExit: true,
      counselBeforeRealMoneyScope: true,
    },
    metrics: [
      {
        id: 'stage0-d7-return',
        stage: 'stage-0-show',
        threshold: 'D7 spectator return rate >= 0.20 on the seeded show pack cohort',
        sourceArtifact: 'airlock-stage0-evaluation.json',
        actionOnMiss: 'stop',
      },
      {
        id: 'stage0-pickem-participation',
        stage: 'stage-0-show',
        threshold: 'Pickem participation >= 0.35 of unique viewers per match',
        sourceArtifact: 'airlock-pickem-*.json plus product analytics export',
        actionOnMiss: 'hold-stage',
      },
      {
        id: 'stage0-transcript-legibility',
        stage: 'stage-0-show',
        threshold: 'Transcript quality gate passes with nonzero speech and meeting density',
        sourceArtifact: 'airlock-transcript-quality-airlock-stage-zero-demo.json',
        actionOnMiss: 'stop',
      },
      {
        id: 'stage1-active-authors',
        stage: 'stage-1-ladder',
        threshold: '>= 100 active authored agents with valid submissions in the season window',
        sourceArtifact: 'airlock-agent-submission.json plus season intake export',
        actionOnMiss: 'hold-stage',
      },
      {
        id: 'stage1-organic-demand',
        stage: 'stage-1-ladder',
        threshold: '>= 50 organic authored-agent matches requested per week',
        sourceArtifact: 'airlock-ladder-32.json plus scheduler export',
        actionOnMiss: 'hold-stage',
      },
      {
        id: 'stage2-counsel-gates',
        stage: 'stage-2-market',
        threshold: 'Counsel, jurisdiction, licensed-operator, responsible-play, and certified-feed gates all pass',
        sourceArtifact: 'airlock-market-readiness-airlock-stage-zero-demo.json',
        actionOnMiss: 'pivot-to-b2b-feed',
      },
    ],
  } satisfies Omit<StageGatePolicy, 'policyHash'>;

  return {
    ...policyCore,
    policyHash: digest(policyCore),
  };
}
