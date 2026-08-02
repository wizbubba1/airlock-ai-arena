import { digest } from './audit';

export type AnalyticsEventName =
  | 'match_view_started'
  | 'transcript_advanced'
  | 'pickem_submitted'
  | 'result_revealed'
  | 'audit_exported'
  | 'return_visit_recorded';

export interface AnalyticsEventSpec {
  name: AnalyticsEventName;
  requiredFields: string[];
  stageGateUse: string;
  retentionPolicy: 'aggregate-only' | 'pseudonymous-30-day';
}

export interface AnalyticsSchema {
  schema: 'airlock.analytics_schema.stage0.v1';
  programId: string;
  privacyPolicy: {
    accountRequired: false;
    storesPrivatePrompts: false;
    storesRolesBeforeReveal: false;
    defaultRetention: 'aggregate-only';
  };
  events: AnalyticsEventSpec[];
  derivedMetrics: {
    id: string;
    formula: string;
    sourceEvents: AnalyticsEventName[];
  }[];
  analyticsHash: string;
}

export function buildAnalyticsSchema(programId = 'airlock-roadmap.001'): AnalyticsSchema {
  const schemaCore = {
    schema: 'airlock.analytics_schema.stage0.v1',
    programId,
    privacyPolicy: {
      accountRequired: false,
      storesPrivatePrompts: false,
      storesRolesBeforeReveal: false,
      defaultRetention: 'aggregate-only',
    },
    events: [
      {
        name: 'match_view_started',
        requiredFields: ['viewerIdHash', 'seed', 'startedAt', 'referrerClass'],
        stageGateUse: 'Stage 0 viewer denominator and cohort construction.',
        retentionPolicy: 'pseudonymous-30-day',
      },
      {
        name: 'transcript_advanced',
        requiredFields: ['viewerIdHash', 'seed', 'eventSequence', 'advancedAt'],
        stageGateUse: 'Transcript engagement depth and legibility review.',
        retentionPolicy: 'aggregate-only',
      },
      {
        name: 'pickem_submitted',
        requiredFields: ['viewerIdHash', 'seed', 'picks', 'submittedAt', 'receiptHash'],
        stageGateUse: 'Pickem participation numerator.',
        retentionPolicy: 'pseudonymous-30-day',
      },
      {
        name: 'result_revealed',
        requiredFields: ['viewerIdHash', 'seed', 'revealedAt', 'winner'],
        stageGateUse: 'Completion and reveal-rate measurement.',
        retentionPolicy: 'aggregate-only',
      },
      {
        name: 'audit_exported',
        requiredFields: ['viewerIdHash', 'seed', 'artifactSchema', 'exportedAt'],
        stageGateUse: 'Reviewer/auditor artifact usage.',
        retentionPolicy: 'aggregate-only',
      },
      {
        name: 'return_visit_recorded',
        requiredFields: ['viewerIdHash', 'cohortSeed', 'daysSinceFirstVisit', 'visitedAt'],
        stageGateUse: 'D7 spectator return numerator.',
        retentionPolicy: 'pseudonymous-30-day',
      },
    ],
    derivedMetrics: [
      {
        id: 'd7-spectator-return-rate',
        formula: 'return_visit_recorded(daysSinceFirstVisit >= 7) / match_view_started unique viewers',
        sourceEvents: ['match_view_started', 'return_visit_recorded'],
      },
      {
        id: 'pickem-participation-rate',
        formula: 'pickem_submitted unique viewers / match_view_started unique viewers',
        sourceEvents: ['match_view_started', 'pickem_submitted'],
      },
      {
        id: 'transcript-completion-rate',
        formula: 'result_revealed unique viewers / match_view_started unique viewers',
        sourceEvents: ['match_view_started', 'result_revealed'],
      },
    ],
  } satisfies Omit<AnalyticsSchema, 'analyticsHash'>;

  return {
    ...schemaCore,
    analyticsHash: digest(schemaCore),
  };
}
