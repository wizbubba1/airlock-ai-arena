import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildArtifactCatalog,
  buildArtifactCatalogReport,
  buildAnalyticsSchema,
  buildAnalyticsSchemaMarkdown,
  buildAuthorIntakeRegistry,
  buildAuthorIntakeRegistryMarkdown,
  buildAuditBundle,
  buildB2BFeedPacket,
  buildB2BFeedPacketMarkdown,
  buildBalancePatchSchedule,
  buildBalancePatchScheduleMarkdown,
  buildBalanceSummary,
  buildChallengePacket,
  buildCertifiedEventFeed,
  buildCertifiedEventFeedMarkdown,
  buildCollusionControls,
  buildCollusionControlsMarkdown,
  buildFallbackDrill,
  buildFallbackDrillMarkdown,
  buildInferenceReceipts,
  buildInferenceReceiptsMarkdown,
  buildJurisdictionPolicy,
  buildJurisdictionPolicyMarkdown,
  buildLadderReport,
  buildMarketReadiness,
  buildMarketReadinessMarkdown,
  buildOperatorReadiness,
  buildOperatorReadinessMarkdown,
  buildOperationsRunbook,
  buildOperationsRunbookMarkdown,
  buildPromptRevealPolicy,
  buildPromptRevealPolicyMarkdown,
  buildRandomnessBeaconPlan,
  buildRandomnessBeaconPlanMarkdown,
  buildRevealSchedule,
  buildRevealScheduleMarkdown,
  buildRoleRoadmap,
  buildRoleRoadmapMarkdown,
  buildSanitizerAudit,
  buildSanitizerAuditMarkdown,
  buildSeedIndex,
  buildSeedIndexReport,
  buildSeasonManifest,
  buildShowPack,
  buildShowPackReport,
  buildStageGatePolicy,
  buildStageGatePolicyMarkdown,
  buildStage0Evaluation,
  buildStage0EvaluationMarkdown,
  buildTranscriptQualityMarkdown,
  buildTranscriptQualityReport,
  evaluateBalance,
  runLadderPreview,
  runMatch,
  verifyAnalyticsSchema,
  verifyAuthorIntakeRegistry,
  verifyAuditBundle,
  verifyB2BFeedPacket,
  verifyBalancePatchSchedule,
  verifyBalanceSummary,
  verifyCertifiedEventFeed,
  verifyCollusionControls,
  verifyFallbackDrill,
  verifyInferenceReceipts,
  verifyJurisdictionPolicy,
  verifyLadderSummary,
  verifyMarketReadiness,
  verifyOperatorReadiness,
  verifyOperationsRunbook,
  verifyPromptRevealPolicy,
  verifyRandomnessBeaconPlan,
  verifyRevealSchedule,
  verifyRoleRoadmap,
  verifySanitizerAudit,
  verifySeasonManifest,
  verifySeedIndex,
  verifyShowPack,
  verifyStageGatePolicy,
  verifyStage0Evaluation,
  verifyTranscriptQualityReport,
} from '../engine';
import { buildAgentSubmissionPacket, verifyAgentSubmissionPacket } from '../authoring/submission';
import sampleManifest from './fixtures/agents/vanta-author.json';
import type { AuthoredAgentManifest } from '../authoring/manifest';

const artifactDir = resolve('./artifacts');
mkdirSync(artifactDir, { recursive: true });

const seed = 'airlock-stage-zero-demo';
const seasonId = 'stage1-preview.001';
const programId = 'airlock-roadmap.001';
const manifest = sampleManifest as AuthoredAgentManifest;

const match = runMatch(seed);
const analyticsSchema = buildAnalyticsSchema(programId);
const authorIntakeRegistry = buildAuthorIntakeRegistry(seasonId);
const audit = buildAuditBundle(match, seed);
const b2bFeedPacket = buildB2BFeedPacket(seed);
const balancePatchSchedule = buildBalancePatchSchedule(seasonId);
const challenge = buildChallengePacket(seed);
const collusionControls = buildCollusionControls(seasonId);
const eventFeed = buildCertifiedEventFeed(seed);
const balance = buildBalanceSummary(100, 'stage-zero-ci');
const fallbackDrill = buildFallbackDrill(seed);
const inferenceReceipts = buildInferenceReceipts(seed);
const jurisdictionPolicy = buildJurisdictionPolicy(programId);
const ladder = runLadderPreview(32, 'stage-one-ci');
const marketReadiness = buildMarketReadiness(seed);
const operatorReadiness = buildOperatorReadiness(seed, 100, 'stage-zero-ci');
const operationsRunbook = buildOperationsRunbook(programId);
const promptRevealPolicy = buildPromptRevealPolicy(seasonId);
const randomnessBeaconPlan = buildRandomnessBeaconPlan(seed);
const revealSchedule = buildRevealSchedule(seed);
const roleRoadmap = buildRoleRoadmap();
const sanitizerAudit = buildSanitizerAudit(seed);
const season = buildSeasonManifest(seasonId);
const seedIndex = buildSeedIndex();
const showPack = buildShowPack();
const stageGatePolicy = buildStageGatePolicy(programId);
const transcriptQuality = buildTranscriptQualityReport(seed);
const stage0Evaluation = buildStage0Evaluation(seed, 100, 'stage-zero-ci');
const agentSubmission = buildAgentSubmissionPacket(manifest, seasonId);
const catalog = buildArtifactCatalog();

const outputs = [
  writeJson('airlock-analytics-schema-airlock-roadmap.001.json', analyticsSchema),
  writeMarkdown('airlock-analytics-schema-airlock-roadmap.001.md', buildAnalyticsSchemaMarkdown(analyticsSchema)),
  writeJson('airlock-author-intake-registry-stage1-preview.001.json', authorIntakeRegistry),
  writeMarkdown('airlock-author-intake-registry-stage1-preview.001.md', buildAuthorIntakeRegistryMarkdown(authorIntakeRegistry)),
  writeJson('airlock-audit-airlock-stage-zero-demo.json', audit),
  writeJson('airlock-b2b-feed-packet-airlock-stage-zero-demo.json', b2bFeedPacket),
  writeMarkdown('airlock-b2b-feed-packet-airlock-stage-zero-demo.md', buildB2BFeedPacketMarkdown(b2bFeedPacket)),
  writeJson('airlock-balance-patch-schedule-stage1-preview.001.json', balancePatchSchedule),
  writeMarkdown('airlock-balance-patch-schedule-stage1-preview.001.md', buildBalancePatchScheduleMarkdown(balancePatchSchedule)),
  writeJson('airlock-challenge-airlock-stage-zero-demo.json', challenge),
  writeJson('airlock-collusion-controls-stage1-preview.001.json', collusionControls),
  writeMarkdown('airlock-collusion-controls-stage1-preview.001.md', buildCollusionControlsMarkdown(collusionControls)),
  writeJson('airlock-event-feed-airlock-stage-zero-demo.json', eventFeed),
  writeMarkdown('airlock-event-feed-airlock-stage-zero-demo.md', buildCertifiedEventFeedMarkdown(eventFeed)),
  writeJson('airlock-balance-ci.json', balance),
  writeJson('airlock-fallback-drill-airlock-stage-zero-demo.json', fallbackDrill),
  writeMarkdown('airlock-fallback-drill-airlock-stage-zero-demo.md', buildFallbackDrillMarkdown(fallbackDrill)),
  writeJson('airlock-inference-receipts-airlock-stage-zero-demo.json', inferenceReceipts),
  writeMarkdown('airlock-inference-receipts-airlock-stage-zero-demo.md', buildInferenceReceiptsMarkdown(inferenceReceipts)),
  writeJson('airlock-jurisdiction-policy-airlock-roadmap.001.json', jurisdictionPolicy),
  writeMarkdown('airlock-jurisdiction-policy-airlock-roadmap.001.md', buildJurisdictionPolicyMarkdown(jurisdictionPolicy)),
  writeJson('airlock-ladder-32.json', ladder),
  writeMarkdown('airlock-ladder-32.md', buildLadderReport(ladder)),
  writeJson('airlock-market-readiness-airlock-stage-zero-demo.json', marketReadiness),
  writeMarkdown('airlock-market-readiness-airlock-stage-zero-demo.md', buildMarketReadinessMarkdown(marketReadiness)),
  writeJson('airlock-operator-readiness.json', operatorReadiness),
  writeMarkdown('airlock-operator-readiness.md', buildOperatorReadinessMarkdown(operatorReadiness)),
  writeJson('airlock-operations-runbook-airlock-roadmap.001.json', operationsRunbook),
  writeMarkdown('airlock-operations-runbook-airlock-roadmap.001.md', buildOperationsRunbookMarkdown(operationsRunbook)),
  writeJson('airlock-prompt-reveal-policy-stage1-preview.001.json', promptRevealPolicy),
  writeMarkdown('airlock-prompt-reveal-policy-stage1-preview.001.md', buildPromptRevealPolicyMarkdown(promptRevealPolicy)),
  writeJson('airlock-randomness-beacon-plan-airlock-stage-zero-demo.json', randomnessBeaconPlan),
  writeMarkdown('airlock-randomness-beacon-plan-airlock-stage-zero-demo.md', buildRandomnessBeaconPlanMarkdown(randomnessBeaconPlan)),
  writeJson('airlock-reveal-schedule-airlock-stage-zero-demo.json', revealSchedule),
  writeMarkdown('airlock-reveal-schedule-airlock-stage-zero-demo.md', buildRevealScheduleMarkdown(revealSchedule)),
  writeJson('airlock-role-roadmap-airlock-role-roadmap.001.json', roleRoadmap),
  writeMarkdown('airlock-role-roadmap-airlock-role-roadmap.001.md', buildRoleRoadmapMarkdown(roleRoadmap)),
  writeJson('airlock-sanitizer-audit-airlock-stage-zero-demo.json', sanitizerAudit),
  writeMarkdown('airlock-sanitizer-audit-airlock-stage-zero-demo.md', buildSanitizerAuditMarkdown(sanitizerAudit)),
  writeJson('airlock-season-stage1-preview.001.json', season),
  writeJson('airlock-seed-index.json', seedIndex),
  writeMarkdown('airlock-seed-index.md', buildSeedIndexReport(seedIndex)),
  writeJson('airlock-show-pack.json', showPack),
  writeMarkdown('airlock-show-pack.md', buildShowPackReport(showPack)),
  writeJson('airlock-stage-gate-policy-airlock-roadmap.001.json', stageGatePolicy),
  writeMarkdown('airlock-stage-gate-policy-airlock-roadmap.001.md', buildStageGatePolicyMarkdown(stageGatePolicy)),
  writeJson('airlock-transcript-quality-airlock-stage-zero-demo.json', transcriptQuality),
  writeMarkdown('airlock-transcript-quality-airlock-stage-zero-demo.md', buildTranscriptQualityMarkdown(transcriptQuality)),
  writeJson('airlock-stage0-evaluation.json', stage0Evaluation),
  writeMarkdown('airlock-stage0-evaluation.md', buildStage0EvaluationMarkdown(stage0Evaluation)),
  writeJson('airlock-agent-submission.json', agentSubmission),
  writeJson('airlock-artifact-catalog.json', catalog),
  writeMarkdown('airlock-artifact-catalog.md', buildArtifactCatalogReport(catalog)),
];

const checks = [
  { name: 'analytics-schema', ...verifyAnalyticsSchema(analyticsSchema) },
  { name: 'author-intake-registry', ...verifyAuthorIntakeRegistry(authorIntakeRegistry) },
  { name: 'audit', ...verifyAuditBundle(audit) },
  { name: 'b2b-feed-packet', ...verifyB2BFeedPacket(b2bFeedPacket) },
  { name: 'balance-patch-schedule', ...verifyBalancePatchSchedule(balancePatchSchedule) },
  { name: 'challenge', ok: challenge.verification.ok, errors: challenge.verification.errors },
  { name: 'collusion-controls', ...verifyCollusionControls(collusionControls) },
  { name: 'event-feed', ...verifyCertifiedEventFeed(eventFeed) },
  { name: 'balance-guard', ...evaluateBalance(balance) },
  { name: 'balance', ...verifyBalanceSummary(balance) },
  { name: 'fallback-drill', ...verifyFallbackDrill(fallbackDrill) },
  { name: 'inference-receipts', ...verifyInferenceReceipts(inferenceReceipts) },
  { name: 'jurisdiction-policy', ...verifyJurisdictionPolicy(jurisdictionPolicy) },
  { name: 'ladder', ...verifyLadderSummary(ladder) },
  { name: 'market-readiness', ...verifyMarketReadiness(marketReadiness) },
  { name: 'operator-readiness', ...verifyOperatorReadiness(operatorReadiness) },
  { name: 'operations-runbook', ...verifyOperationsRunbook(operationsRunbook) },
  { name: 'prompt-reveal-policy', ...verifyPromptRevealPolicy(promptRevealPolicy) },
  { name: 'randomness-beacon-plan', ...verifyRandomnessBeaconPlan(randomnessBeaconPlan) },
  { name: 'reveal-schedule', ...verifyRevealSchedule(revealSchedule) },
  { name: 'role-roadmap', ...verifyRoleRoadmap(roleRoadmap) },
  { name: 'sanitizer-audit', ...verifySanitizerAudit(sanitizerAudit) },
  { name: 'season', ...verifySeasonManifest(season) },
  { name: 'seed-index', ...verifySeedIndex(seedIndex) },
  { name: 'show-pack', ...verifyShowPack(showPack) },
  { name: 'stage-gate-policy', ...verifyStageGatePolicy(stageGatePolicy) },
  { name: 'transcript-quality', ...verifyTranscriptQualityReport(transcriptQuality) },
  { name: 'stage0-evaluation', ...verifyStage0Evaluation(stage0Evaluation) },
  { name: 'agent-submission', ...verifyAgentSubmissionPacket(agentSubmission) },
];

const ok = checks.every((check) => check.ok);

console.log(
  JSON.stringify(
    {
      ok,
      artifactDir,
      outputs,
      checks: checks.map((check) => ({
        name: check.name,
        ok: check.ok,
        errors: check.errors,
      })),
    },
    null,
    2,
  ),
);

if (!ok) {
  process.exitCode = 1;
}

function writeJson(filename: string, value: unknown): string {
  const path = resolve(artifactDir, filename);
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  return path;
}

function writeMarkdown(filename: string, value: string): string {
  const path = resolve(artifactDir, filename);
  writeFileSync(path, value);
  return path;
}
