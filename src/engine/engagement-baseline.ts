import { digest } from './audit';
import { buildAnalyticsSchema } from './analytics-schema';
import { buildStageGatePolicy } from './stage-gate-policy';

export interface EngagementMetricBaseline {
  id: 'd7-spectator-return-rate' | 'pickem-participation-rate' | 'transcript-completion-rate' | 'audit-export-rate';
  numerator: number;
  denominator: number;
  value: number;
  threshold: string;
  status: 'needs-live-data' | 'pass' | 'fail';
  source: string;
}

export interface EngagementBaseline {
  schema: 'airlock.engagement_baseline.stage0.v1';
  programId: string;
  policy: {
    usesPrivatePrompts: false;
    requiresAccounts: false;
    stage0Decision: 'needs-live-data';
    liveAnalyticsRequired: true;
  };
  metrics: EngagementMetricBaseline[];
  evidence: {
    analyticsSchemaHash: string;
    stageGatePolicyHash: string;
  };
  baselineHash: string;
}

export function buildEngagementBaseline(programId = 'airlock-roadmap.001'): EngagementBaseline {
  const analyticsSchema = buildAnalyticsSchema(programId);
  const stageGatePolicy = buildStageGatePolicy(programId);
  const baselineCore = {
    schema: 'airlock.engagement_baseline.stage0.v1',
    programId,
    policy: {
      usesPrivatePrompts: false,
      requiresAccounts: false,
      stage0Decision: 'needs-live-data',
      liveAnalyticsRequired: true,
    },
    metrics: [
      {
        id: 'd7-spectator-return-rate',
        numerator: 0,
        denominator: 0,
        value: 0,
        threshold: '>= 0.20',
        status: 'needs-live-data',
        source: 'return_visit_recorded / match_view_started',
      },
      {
        id: 'pickem-participation-rate',
        numerator: 0,
        denominator: 0,
        value: 0,
        threshold: '>= 0.35',
        status: 'needs-live-data',
        source: 'pickem_submitted / match_view_started',
      },
      {
        id: 'transcript-completion-rate',
        numerator: 0,
        denominator: 0,
        value: 0,
        threshold: 'tracked for Stage 0 legibility review',
        status: 'needs-live-data',
        source: 'result_revealed / match_view_started',
      },
      {
        id: 'audit-export-rate',
        numerator: 0,
        denominator: 0,
        value: 0,
        threshold: 'tracked for reviewer/auditor usage',
        status: 'needs-live-data',
        source: 'audit_exported / match_view_started',
      },
    ],
    evidence: {
      analyticsSchemaHash: analyticsSchema.analyticsHash,
      stageGatePolicyHash: stageGatePolicy.policyHash,
    },
  } satisfies Omit<EngagementBaseline, 'baselineHash'>;

  return {
    ...baselineCore,
    baselineHash: digest(baselineCore),
  };
}
