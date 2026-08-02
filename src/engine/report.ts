import { agentIds, profiles } from './content';
import { buildAuditBundle } from './bundle';
import { ruleset } from './ruleset';
import type { AnalyticsSchema } from './analytics-schema';
import type { ArtifactCatalog } from './artifact-catalog';
import type { AuthorIntakeRegistry } from './author-intake-registry';
import type { B2BFeedPacket } from './b2b-feed-packet';
import type { BalancePatchSchedule } from './balance-patch-schedule';
import type { CertifiedEventFeed } from './event-feed';
import type { CollusionControls } from './collusion-controls';
import type { EngagementBaseline } from './engagement-baseline';
import type { FallbackDrill } from './fallback-drill';
import type { InferenceReceipts } from './inference-receipts';
import type { JurisdictionPolicy } from './jurisdiction-policy';
import type { LadderSummary } from './ladder';
import type { MarketReadiness } from './market-readiness';
import type { OperatorReadiness } from './readiness';
import type { OperationsRunbook } from './operations-runbook';
import type { PartnerHandoff } from './partner-handoff';
import type { PromptRevealPolicy } from './prompt-reveal-policy';
import type { RandomnessBeaconPlan } from './randomness-beacon-plan';
import type { RevealSchedule } from './reveal-schedule';
import type { ResponsiblePlayPolicy } from './responsible-play-policy';
import type { RoleRoadmap } from './role-roadmap';
import type { SanitizerAudit } from './sanitizer-audit';
import type { SeedIndex } from './seed-index';
import type { ShowPack } from './show-pack';
import type { StageGatePolicy } from './stage-gate-policy';
import type { Stage0Evaluation } from './stage0-evaluation';
import type { TranscriptQualityReport } from './transcript-quality';
import type { MatchState } from './types';

export function buildMatchReport(match: MatchState, seed: string): string {
  const bundle = buildAuditBundle(match, seed);
  const lines: string[] = [
    `# AIRLOCK Match Report`,
    ``,
    `Seed: \`${seed}\``,
    `Ruleset: \`${bundle.commitments.ruleset}\``,
    `Winner: **${bundle.result.winner === 'technician' ? 'Technicians' : 'Saboteurs'}**`,
    `Reason: ${bundle.result.reason}`,
    ``,
    `## Commitments`,
    ``,
    `| Field | Hash |`,
    `|---|---|`,
    `| Roles | \`${bundle.commitments.rolesHash}\` |`,
    `| Personas | \`${bundle.commitments.personaHash}\` |`,
    `| Transcript | \`${bundle.commitments.transcriptHash}\` |`,
    `| Market | \`${bundle.commitments.marketHash}\` |`,
    `| Public snapshots | \`${bundle.commitments.snapshotHash}\` |`,
    `| Entropy ledger | \`${bundle.commitments.entropyHash}\` |`,
    ``,
    `## Result`,
    ``,
    `| Metric | Value |`,
    `|---|---:|`,
    `| Ticks | ${bundle.result.ticks} |`,
    `| Meetings | ${bundle.result.meetings} |`,
    `| Transcript events | ${bundle.commitments.transcriptEvents} |`,
    `| Market snapshots | ${bundle.commitments.marketSnapshots} |`,
    `| Tick commitments | ${bundle.commitments.tickCommitmentCount} |`,
    `| Entropy events | ${bundle.entropy.length} |`,
    `| Max ticks | ${ruleset.maxTicks} |`,
    `| Tasks per Technician | ${ruleset.taskCount} |`,
    ``,
    `## Role Reveal`,
    ``,
    `| Agent | Callsign | Role |`,
    `|---|---|---|`,
    ...agentIds.map((id) => `| ${profiles[id].name} | ${profiles[id].callsign} | ${match.agents[id].role} |`),
    ``,
    `## Public Transcript`,
    ``,
    ...bundle.publicTranscript.map((event) => `- T${event.tick} [${event.kind}] ${event.publicText}`),
    ``,
    `## Entropy Ledger`,
    ``,
    `| Kind | Tick | Commitment |`,
    `|---|---:|---|`,
    ...bundle.entropy.map((entry) => `| ${entry.kind} | ${entry.tick} | \`${entry.commitment}\` |`),
    ``,
    `## Tick Commitments`,
    ``,
    `| Tick | Events | Snapshots | Market | Commitment |`,
    `|---:|---:|---:|---:|---|`,
    ...bundle.tickCommitments.map(
      (entry) => `| ${entry.tick} | ${entry.eventCount} | ${entry.snapshotCount} | ${entry.marketCount} | \`${entry.commitment}\` |`,
    ),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildAnalyticsSchemaMarkdown(schema: AnalyticsSchema): string {
  const lines: string[] = [
    `# AIRLOCK Analytics Schema`,
    ``,
    `Program: \`${schema.programId}\``,
    `Schema: \`${schema.schema}\``,
    `Analytics hash: \`${schema.analyticsHash}\``,
    ``,
    `## Privacy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Account required | ${schema.privacyPolicy.accountRequired} |`,
    `| Stores private prompts | ${schema.privacyPolicy.storesPrivatePrompts} |`,
    `| Stores roles before reveal | ${schema.privacyPolicy.storesRolesBeforeReveal} |`,
    `| Default retention | ${schema.privacyPolicy.defaultRetention} |`,
    ``,
    `## Events`,
    ``,
    `| Event | Required fields | Stage gate use | Retention |`,
    `|---|---|---|---|`,
    ...schema.events.map(
      (event) =>
        `| ${event.name} | ${event.requiredFields.join(', ')} | ${event.stageGateUse} | ${event.retentionPolicy} |`,
    ),
    ``,
    `## Derived Metrics`,
    ``,
    `| Metric | Formula | Source events |`,
    `|---|---|---|`,
    ...schema.derivedMetrics.map(
      (metric) => `| ${metric.id} | ${metric.formula} | ${metric.sourceEvents.join(', ')} |`,
    ),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildAuthorIntakeRegistryMarkdown(registry: AuthorIntakeRegistry): string {
  const lines: string[] = [
    `# AIRLOCK Author Intake Registry`,
    ``,
    `Season: \`${registry.seasonId}\``,
    `Schema: \`${registry.schema}\``,
    `Season manifest: \`${registry.seasonManifestHash}\``,
    `Registry hash: \`${registry.registryHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Active author target | ${registry.policy.activeAuthorTarget} |`,
    `| Valid submission required | ${registry.policy.validSubmissionRequired} |`,
    `| Prompt commit required | ${registry.policy.promptCommitRequired} |`,
    `| Duplicate identity review | ${registry.policy.duplicateIdentityReview} |`,
    ``,
    `## Gates`,
    ``,
    `| Gate | Threshold | Source | Status |`,
    `|---|---|---|---|`,
    ...registry.gates.map((gate) => `| ${gate.id} | ${gate.threshold} | ${gate.sourceArtifact} | ${gate.status} |`),
    ``,
    `## Sample Intake`,
    ``,
    `| Metric | Value |`,
    `|---|---:|`,
    `| Valid submissions | ${registry.sampleIntake.validSubmissions} |`,
    `| Invalid submissions | ${registry.sampleIntake.invalidSubmissions} |`,
    `| Active author target | ${registry.sampleIntake.activeAuthorTarget} |`,
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildArtifactCatalogReport(catalog: ArtifactCatalog): string {
  const lines: string[] = [
    `# AIRLOCK Artifact Catalog`,
    ``,
    `Schema: \`${catalog.schema}\``,
    `Artifacts: ${catalog.entries.length}`,
    `Catalog hash: \`${catalog.catalogHash}\``,
    ``,
    `| Artifact | Schema | Format | Generate | Verify |`,
    `|---|---|---|---|---|`,
    ...catalog.entries.map(
      (entry) =>
        `| ${entry.name} | \`${entry.schema}\` | ${entry.format} | \`${entry.generateCommand}\` | ${entry.verifyCommand ? `\`${entry.verifyCommand}\`` : 'manual review'} |`,
    ),
    ``,
    `## Review Use`,
    ``,
    ...catalog.entries.map((entry) => `- **${entry.name}:** ${entry.purpose}`),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildB2BFeedPacketMarkdown(packet: B2BFeedPacket): string {
  const lines: string[] = [
    `# AIRLOCK B2B Feed Packet`,
    ``,
    `Seed: \`${packet.seed}\``,
    `Program: \`${packet.programId}\``,
    `Schema: \`${packet.schema}\``,
    `Packet hash: \`${packet.packetHash}\``,
    ``,
    `## Commercial Posture`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Audience | ${packet.audience} |`,
    `| Direct consumer betting | ${packet.commercialPosture.directConsumerBetting} |`,
    `| Operator role | ${packet.commercialPosture.operatorRole} |`,
    `| Settlement role | ${packet.commercialPosture.settlementRole} |`,
    ``,
    `## Evidence`,
    ``,
    `| Artifact | Hash |`,
    `|---|---|`,
    `| Certified feed | \`${packet.evidence.certifiedFeed.feedHash}\` |`,
    `| Market readiness | \`${packet.evidence.marketReadiness.readinessHash}\` |`,
    `| Stage gate policy | \`${packet.evidence.stageGatePolicy.policyHash}\` |`,
    ``,
    `## Review Checklist`,
    ``,
    `| Gate | Status | Summary |`,
    `|---|---|---|`,
    ...packet.reviewChecklist.map((gate) => `| ${gate.id} | ${gate.status} | ${gate.summary} |`),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildCertifiedEventFeedMarkdown(feed: CertifiedEventFeed): string {
  const lines: string[] = [
    `# AIRLOCK Certified Event Feed`,
    ``,
    `Seed: \`${feed.seed}\``,
    `Schema: \`${feed.schema}\``,
    `Feed hash: \`${feed.feedHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Feed type | ${feed.policy.feedType} |`,
    `| Role disclosure | ${feed.policy.roleDisclosure} |`,
    `| Consumer | ${feed.policy.consumer} |`,
    `| Excludes | ${feed.policy.excludes.join(', ')} |`,
    ``,
    `## Commitments`,
    ``,
    `| Field | Hash |`,
    `|---|---|`,
    `| Transcript | \`${feed.commitments.transcriptHash}\` |`,
    `| Market | \`${feed.commitments.marketHash}\` |`,
    `| Public snapshots | \`${feed.commitments.snapshotHash}\` |`,
    `| Entropy | \`${feed.commitments.entropyHash}\` |`,
    ``,
    `## Feed Events`,
    ``,
    `| Seq | Tick | Kind | Speaker | Public Text | Event Hash |`,
    `|---:|---:|---|---|---|---|`,
    ...feed.events.map(
      (event) =>
        `| ${event.sequence} | ${event.tick} | ${event.kind} | ${event.speaker ? profiles[event.speaker].name : 'system'} | ${event.publicText} | \`${event.eventHash}\` |`,
    ),
    ``,
    `## Terminal`,
    ``,
    `Winner: ${feed.terminal.winner}`,
    `Reason: ${feed.terminal.reason}`,
    `Saboteurs: ${feed.terminal.saboteurs.map((id) => profiles[id].name).join(', ')}`,
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildEngagementBaselineMarkdown(baseline: EngagementBaseline): string {
  const lines: string[] = [
    `# AIRLOCK Engagement Baseline`,
    ``,
    `Program: \`${baseline.programId}\``,
    `Schema: \`${baseline.schema}\``,
    `Baseline hash: \`${baseline.baselineHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Uses private prompts | ${baseline.policy.usesPrivatePrompts} |`,
    `| Requires accounts | ${baseline.policy.requiresAccounts} |`,
    `| Stage 0 decision | ${baseline.policy.stage0Decision} |`,
    `| Live analytics required | ${baseline.policy.liveAnalyticsRequired} |`,
    ``,
    `## Metrics`,
    ``,
    `| Metric | Numerator | Denominator | Value | Threshold | Status | Source |`,
    `|---|---:|---:|---:|---|---|---|`,
    ...baseline.metrics.map(
      (metric) =>
        `| ${metric.id} | ${metric.numerator} | ${metric.denominator} | ${metric.value} | ${metric.threshold} | ${metric.status} | ${metric.source} |`,
    ),
    ``,
    `## Evidence`,
    ``,
    `| Artifact | Hash |`,
    `|---|---|`,
    `| Analytics schema | \`${baseline.evidence.analyticsSchemaHash}\` |`,
    `| Stage gate policy | \`${baseline.evidence.stageGatePolicyHash}\` |`,
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildBalancePatchScheduleMarkdown(schedule: BalancePatchSchedule): string {
  const lines: string[] = [
    `# AIRLOCK Balance Patch Schedule`,
    ``,
    `Season: \`${schedule.seasonId}\``,
    `Schema: \`${schedule.schema}\``,
    `Base ruleset: \`${schedule.baseRuleset}\``,
    `Schedule hash: \`${schedule.scheduleHash}\``,
    ``,
    `## Cadence`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Window days | ${schedule.cadence.windowDays} |`,
    `| Announcement | ${schedule.cadence.announcementPolicy} |`,
    `| Activation | ${schedule.cadence.activationPolicy} |`,
    ``,
    `## Guardrails`,
    ``,
    `| Metric | Value |`,
    `|---|---:|`,
    `| Min Technician win rate | ${schedule.guardrails.minTechnicianWinRate} |`,
    `| Max Technician win rate | ${schedule.guardrails.maxTechnicianWinRate} |`,
    `| Min average meetings | ${schedule.guardrails.minAverageMeetings} |`,
    `| Max average meetings | ${schedule.guardrails.maxAverageMeetings} |`,
    ``,
    `## Mutations`,
    ``,
    `| Window | Target | Trigger | Change | Discretion |`,
    `|---|---|---|---|---|`,
    ...schedule.mutations.map(
      (mutation) =>
        `| ${mutation.patchWindow} | ${mutation.target} | ${mutation.trigger} | ${mutation.change} | ${mutation.operatorDiscretion} |`,
    ),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildCollusionControlsMarkdown(controls: CollusionControls): string {
  const lines: string[] = [
    `# AIRLOCK Collusion Controls`,
    ``,
    `Season: \`${controls.seasonId}\``,
    `Schema: \`${controls.schema}\``,
    `Controls hash: \`${controls.controlsHash}\``,
    ``,
    `## Scope`,
    ``,
    `| Policy | Value |`,
    `|---|---|`,
    `| Identity | ${controls.scope.verifiedIdentityPolicy} |`,
    `| Betting | ${controls.scope.bettingPolicy} |`,
    `| Sanitizer | ${controls.scope.sanitizerPolicy} |`,
    `| Escrow | ${controls.scope.escrowPolicy} |`,
    ``,
    `## Bond Tiers`,
    ``,
    `| Owned agents | Bond multiple | Review | Summary |`,
    `|---:|---:|---|---|`,
    ...controls.bondTiers.map(
      (tier) => `| ${tier.ownedAgents} | ${tier.bondMultiple}x | ${tier.reviewLevel} | ${tier.summary} |`,
    ),
    ``,
    `## Steganography Controls`,
    ``,
    `| Control | Value |`,
    `|---|---|`,
    `| Speech sanitizer | ${controls.steganographyControls.speechSanitizer} |`,
    `| Exact-token signals | ${controls.steganographyControls.exactTokenSignals} |`,
    `| Spectator visibility | ${controls.steganographyControls.spectatorVisibility} |`,
    ``,
    `## Throw Detection`,
    ``,
    `| Metric | Signal | Threshold | Action |`,
    `|---|---|---|---|`,
    ...controls.throwDetection.map(
      (metric) => `| ${metric.id} | ${metric.signal} | ${metric.threshold} | ${metric.action} |`,
    ),
    ``,
    `## Coverage`,
    ``,
    `Monitored agents: ${controls.monitoredAgents.map((id) => profiles[id].name).join(', ')}`,
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildLadderReport(summary: LadderSummary): string {
  const lines: string[] = [
    `# AIRLOCK Ladder Preview`,
    ``,
    `Seed prefix: \`${summary.seedPrefix}\``,
    `Matches: ${summary.matchCount}`,
    `Schema: \`${summary.schema}\``,
    ``,
    `## Standings`,
    ``,
    `| Rank | Agent | Rating | Record | Roles |`,
    `|---:|---|---:|---:|---:|`,
    ...summary.standings.map(
      (standing, index) =>
        `| ${index + 1} | ${standing.name} | ${standing.rating} | ${standing.wins}-${standing.losses} | S${standing.saboteurGames} / T${standing.technicianGames} |`,
    ),
    ``,
    `## Match Log`,
    ``,
    `| Match | Seed | Winner | Ticks | Meetings | Saboteurs |`,
    `|---:|---|---|---:|---:|---|`,
    ...summary.matches.map(
      (match, index) =>
        `| ${index + 1} | \`${match.seed}\` | ${match.winner} | ${match.ticks} | ${match.meetings} | ${match.saboteurs
          .map((id) => profiles[id].name)
          .join(', ')} |`,
    ),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildSeedIndexReport(index: SeedIndex): string {
  const technicianWins = index.seeds.filter((entry) => entry.winner === 'technician').length;
  const saboteurWins = index.seeds.length - technicianWins;
  const lines: string[] = [
    `# AIRLOCK Canonical Seed Index`,
    ``,
    `Schema: \`${index.schema}\``,
    `Ruleset: \`${index.ruleset}\``,
    `Seeds: ${index.seeds.length}`,
    `Result split: Technicians ${technicianWins} / Saboteurs ${saboteurWins}`,
    ``,
    `## Seeds`,
    ``,
    `| Seed | Winner | Ticks | Meetings | Events | Transcript Hash |`,
    `|---|---|---:|---:|---:|---|`,
    ...index.seeds.map(
      (entry) =>
        `| \`${entry.seed}\` | ${entry.winner} | ${entry.ticks} | ${entry.meetings} | ${entry.transcriptEvents} | \`${entry.transcriptHash}\` |`,
    ),
    ``,
    `## Audit Hashes`,
    ``,
    `| Seed | Market | Public snapshots | Entropy ledger |`,
    `|---|---|---|---|`,
    ...index.seeds.map(
      (entry) => `| \`${entry.seed}\` | \`${entry.marketHash}\` | \`${entry.snapshotHash}\` | \`${entry.entropyHash}\` |`,
    ),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildShowPackReport(pack: ShowPack): string {
  const lines: string[] = [
    `# AIRLOCK Stage 0 Show Pack`,
    ``,
    `Schema: \`${pack.schema}\``,
    `Ruleset: \`${pack.ruleset}\``,
    `Matches: ${pack.matches.length}`,
    `Pack hash: \`${pack.packHash}\``,
    ``,
  ];

  for (const match of pack.matches) {
    lines.push(
      `## ${match.title}`,
      ``,
      `Seed: \`${match.seed}\``,
      `Prompt: ${match.prompt}`,
      `Result: ${match.winner} after ${match.ticks} ticks and ${match.meetings} meetings.`,
      `Transcript hash: \`${match.transcriptHash}\``,
      ``,
      `### Public Setup`,
      ``,
      ...match.openingTranscript.map((line) => `- ${line}`),
      ``,
      `### First Meeting Signals`,
      ``,
      ...match.meetingTranscript.map((line) => `- ${line}`),
      ``,
      `### Reveal`,
      ``,
      `Saboteurs: ${match.saboteurs.map((id) => profiles[id].name).join(', ')}`,
      `Terminal market suspects: ${match.leadSuspects.map((id) => profiles[id].name).join(', ')}`,
      ``,
    );
  }

  return `${lines.join('\n')}\n`;
}

export function buildTranscriptQualityMarkdown(report: TranscriptQualityReport): string {
  const lines: string[] = [
    `# AIRLOCK Transcript Quality`,
    ``,
    `Seed: \`${report.seed}\``,
    `Schema: \`${report.schema}\``,
    `Winner: ${report.winner}`,
    `Quality hash: \`${report.qualityHash}\``,
    `Transcript hash: \`${report.transcriptHash}\``,
    ``,
    `## Event Mix`,
    ``,
    `| Event | Count |`,
    `|---|---:|`,
    `| Total | ${report.events.total} |`,
    `| Speech | ${report.events.speech} |`,
    `| Votes | ${report.events.votes} |`,
    `| Reports | ${report.events.reports} |`,
    `| Danger | ${report.events.danger} |`,
    `| Repairs | ${report.events.repairs} |`,
    `| Market | ${report.events.market} |`,
    ``,
    `## Density`,
    ``,
    `| Metric | Value |`,
    `|---|---:|`,
    `| Meetings | ${report.meetings} |`,
    `| Ticks | ${report.ticks} |`,
    `| Speech rate | ${report.density.speechRate} |`,
    `| Meeting events per meeting | ${report.density.meetingEventsPerMeeting} |`,
    `| Danger rate | ${report.density.dangerRate} |`,
    `| Repair rate | ${report.density.repairRate} |`,
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildStage0EvaluationMarkdown(evaluation: Stage0Evaluation): string {
  const lines: string[] = [
    `# AIRLOCK Stage 0 Evaluation`,
    ``,
    `Schema: \`${evaluation.schema}\``,
    `Seed: \`${evaluation.seed}\``,
    `Recommendation: **${evaluation.recommendation}**`,
    `Evaluation hash: \`${evaluation.evaluationHash}\``,
    ``,
    `## Gates`,
    ``,
    `| Gate | Status |`,
    `|---|---|`,
    `| Deterministic artifacts | ${status(evaluation.gates.deterministicArtifacts)} |`,
    `| Balance healthy | ${status(evaluation.gates.balanceHealthy)} |`,
    `| Transcript legible | ${status(evaluation.gates.transcriptLegible)} |`,
    `| Show pack ready | ${status(evaluation.gates.showPackReady)} |`,
    ``,
    `## Balance`,
    ``,
    `| Metric | Value |`,
    `|---|---:|`,
    `| Matches | ${evaluation.balance.matchCount} |`,
    `| Technician wins | ${evaluation.balance.wins.technician} |`,
    `| Saboteur wins | ${evaluation.balance.wins.saboteur} |`,
    `| Technician rate | ${evaluation.balanceGuard.technicianRate} |`,
    `| Saboteur rate | ${evaluation.balanceGuard.saboteurRate} |`,
    `| Average ticks | ${evaluation.balance.averages.ticks} |`,
    `| Average meetings | ${evaluation.balance.averages.meetings} |`,
    ``,
    `## Transcript Quality`,
    ``,
    `| Metric | Value |`,
    `|---|---:|`,
    `| Events | ${evaluation.transcriptQuality.events.total} |`,
    `| Speech events | ${evaluation.transcriptQuality.events.speech} |`,
    `| Speech rate | ${evaluation.transcriptQuality.density.speechRate} |`,
    `| Meetings | ${evaluation.transcriptQuality.meetings} |`,
    ``,
    `## Artifact Coverage`,
    ``,
    `| Artifact | Count |`,
    `|---|---:|`,
    `| Canonical seeds | ${evaluation.seedIndex.seeds.length} |`,
    `| Show pack matches | ${evaluation.showPack.matches.length} |`,
    ``,
  ];

  if (evaluation.balanceGuard.errors.length > 0) {
    lines.push(`## Balance Guard Errors`, ``, ...evaluation.balanceGuard.errors.map((error) => `- ${error}`), ``);
  }

  return `${lines.join('\n')}\n`;
}

export function buildRandomnessBeaconPlanMarkdown(plan: RandomnessBeaconPlan): string {
  const lines: string[] = [
    `# AIRLOCK Randomness Beacon Plan`,
    ``,
    `Seed: \`${plan.seed}\``,
    `Schema: \`${plan.schema}\``,
    `Ruleset: \`${plan.ruleset}\``,
    `Plan hash: \`${plan.planHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Pre-match betting closes before role entropy | ${plan.policy.preMatchBettingClosesBeforeRoleEntropy} |`,
    `| Tick entropy unavailable before tick | ${plan.policy.tickEntropyUnavailableBeforeTick} |`,
    `| Deterministic Stage 0 placeholder | ${plan.policy.deterministicStage0Placeholder} |`,
    `| Future source | ${plan.policy.futureSource} |`,
    ``,
    `## Entries`,
    ``,
    `| Entry | Phase | Source | Timing | Purpose |`,
    `|---|---|---|---|---|`,
    ...plan.entries.map((entry) => `| ${entry.id} | ${entry.phase} | ${entry.source} | ${entry.timing} | ${entry.purpose} |`),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildOperationsRunbookMarkdown(runbook: OperationsRunbook): string {
  const lines: string[] = [
    `# AIRLOCK Operations Runbook`,
    ``,
    `Program: \`${runbook.programId}\``,
    `Schema: \`${runbook.schema}\``,
    `Runbook hash: \`${runbook.runbookHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Money markets enabled | ${runbook.policy.moneyMarketsEnabled} |`,
    `| Public incident log required | ${runbook.policy.publicIncidentLogRequired} |`,
    `| Frozen match policy | ${runbook.policy.frozenMatchPolicy} |`,
    `| Audit dispute policy | ${runbook.policy.auditDisputePolicy} |`,
    ``,
    `## Triggers`,
    ``,
    `| Trigger | Severity | Signal | Threshold | Owner | Action |`,
    `|---|---|---|---|---|---|`,
    ...runbook.triggers.map(
      (trigger) =>
        `| ${trigger.id} | ${trigger.severity} | ${trigger.signal} | ${trigger.threshold} | ${trigger.owner} | ${trigger.action} |`,
    ),
    ``,
    `## Response Steps`,
    ``,
    `| Step | Phase | Owner | Max delay | Action |`,
    `|---|---|---|---:|---|`,
    ...runbook.steps.map(
      (step) => `| ${step.id} | ${step.phase} | ${step.owner} | ${step.maxDelayMinutes}m | ${step.action} |`,
    ),
    ``,
    `## Evidence Artifacts`,
    ``,
    ...runbook.evidenceArtifacts.map((artifact) => `- \`${artifact}\``),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildRevealScheduleMarkdown(schedule: RevealSchedule): string {
  const lines: string[] = [
    `# AIRLOCK Reveal Schedule`,
    ``,
    `Seed: \`${schedule.seed}\``,
    `Schema: \`${schedule.schema}\``,
    `Schedule hash: \`${schedule.scheduleHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Operator UI delay | ${schedule.policy.operatorUiDelaySeconds}s |`,
    `| Live pool closes | ${schedule.policy.livePoolCloses} |`,
    `| Latency side-channel policy | ${schedule.policy.latencySideChannelPolicy} |`,
    ``,
    `## Tick Commits`,
    ``,
    `| Tick | Reveal slot | Events | Snapshots | Market | Commitment |`,
    `|---:|---:|---:|---:|---:|---|`,
    ...schedule.entries.map(
      (entry) =>
        `| ${entry.tick} | ${entry.publicRevealSlot}s | ${entry.transcriptEvents} | ${entry.publicSnapshots} | ${entry.marketSnapshots} | \`${entry.commitment}\` |`,
    ),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildRoleRoadmapMarkdown(roadmap: RoleRoadmap): string {
  const lines: string[] = [
    `# AIRLOCK Role Roadmap`,
    ``,
    `Roadmap: \`${roadmap.roadmapId}\``,
    `Schema: \`${roadmap.schema}\``,
    `Base ruleset: \`${roadmap.baseRuleset}\``,
    `Roadmap hash: \`${roadmap.roadmapHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Base season roles | ${roadmap.policy.baseSeasonRoles} |`,
    `| Role drops require balance pass | ${roadmap.policy.roleDropsRequireBalancePass} |`,
    `| No mid-season uncommitted roles | ${roadmap.policy.noMidSeasonUncommittedRoles} |`,
    `| Spectator market impact review | ${roadmap.policy.spectatorMarketImpactReview} |`,
    ``,
    `## Drops`,
    ``,
    `| Drop | Target season | Family | Status | Design goal | Release gate |`,
    `|---|---|---|---|---|---|`,
    ...roadmap.drops.map(
      (drop) =>
        `| ${drop.id} | ${drop.targetSeason} | ${drop.roleFamily} | ${drop.status} | ${drop.designGoal} | ${drop.releaseGate} |`,
    ),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildSanitizerAuditMarkdown(audit: SanitizerAudit): string {
  const lines: string[] = [
    `# AIRLOCK Sanitizer Audit`,
    ``,
    `Seed: \`${audit.seed}\``,
    `Schema: \`${audit.schema}\``,
    `Audit hash: \`${audit.auditHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Sanitizer | ${audit.policy.sanitizer} |`,
    `| Agent visibility | ${audit.policy.agentVisibility} |`,
    `| Spectator visibility | ${audit.policy.spectatorVisibility} |`,
    ``,
    `## Speech Entries`,
    ``,
    `| Tick | Speaker | Changed | Original Hash | Sanitized Hash | Sanitized Text |`,
    `|---:|---|---|---|---|---|`,
    ...audit.entries.map(
      (entry) =>
        `| ${entry.tick} | ${profiles[entry.speaker].name} | ${entry.changed ? 'yes' : 'no'} | \`${entry.originalHash}\` | \`${entry.sanitizedHash}\` | ${entry.sanitizedText} |`,
    ),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildFallbackDrillMarkdown(drill: FallbackDrill): string {
  const lines: string[] = [
    `# AIRLOCK Fallback Drill`,
    ``,
    `Seed: \`${drill.seed}\``,
    `Schema: \`${drill.schema}\``,
    `Drill hash: \`${drill.drillHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Timeout | ${drill.policy.timeoutMs}ms |`,
    `| Action fallback | ${drill.policy.actionFallback} |`,
    `| Speech fallback | ${drill.policy.speechFallback} |`,
    `| Vote fallback | ${drill.policy.voteFallback} |`,
    `| Pool policy | ${drill.policy.poolPolicy} |`,
    ``,
    `## Drill Entries`,
    ``,
    `| Tick | Phase | Agent | Fallback | Affected Pools | Entry Hash |`,
    `|---:|---|---|---|---|---|`,
    ...drill.entries.map(
      (entry) =>
        `| ${entry.tick} | ${entry.phase} | ${profiles[entry.agent].name} | ${fallbackLabel(entry.fallback)} | ${entry.affectedPools.join(', ') || 'none'} | \`${entry.entryHash}\` |`,
    ),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildInferenceReceiptsMarkdown(receipts: InferenceReceipts): string {
  const lines: string[] = [
    `# AIRLOCK Inference Receipts`,
    ``,
    `Seed: \`${receipts.seed}\``,
    `Schema: \`${receipts.schema}\``,
    `Ruleset: \`${receipts.ruleset}\``,
    `Receipts hash: \`${receipts.receiptsHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Provider | ${receipts.policy.provider} |`,
    `| Model | ${receipts.policy.model} |`,
    `| Hardware | ${receipts.policy.hardware} |`,
    `| Decoding | ${receipts.policy.decoding} |`,
    `| Attestation | ${receipts.policy.attestation} |`,
    `| Evidence | ${receipts.policy.publishedEvidence.join(', ')} |`,
    ``,
    `## Speech Receipts`,
    ``,
    `| Tick | Speaker | Tokens | Prompt Hash | Output Hash | Logprob Commitment | Receipt |`,
    `|---:|---|---:|---|---|---|---|`,
    ...receipts.entries.map(
      (entry) =>
        `| ${entry.tick} | ${profiles[entry.speaker].name} | ${entry.tokenCount} | \`${entry.promptHash}\` | \`${entry.outputHash}\` | \`${entry.logprobCommitment}\` | \`${entry.receiptHash}\` |`,
    ),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildOperatorReadinessMarkdown(readiness: OperatorReadiness): string {
  const lines: string[] = [
    `# AIRLOCK Operator Readiness`,
    ``,
    `Seed: \`${readiness.seed}\``,
    `Schema: \`${readiness.schema}\``,
    `Recommendation: **${readiness.recommendation}**`,
    `Readiness hash: \`${readiness.readinessHash}\``,
    ``,
    `## Gates`,
    ``,
    `| Gate | Status | Evidence | Summary |`,
    `|---|---|---|---|`,
    ...readiness.gates.map(
      (gate) => `| ${gate.id} | ${gate.status} | \`${gate.evidenceHash}\` | ${gate.summary} |`,
    ),
    ``,
    `## Evidence Bundle`,
    ``,
    `| Artifact | Hash |`,
    `|---|---|`,
    `| Stage 0 evaluation | \`${readiness.evaluation.evaluationHash}\` |`,
    `| Inference receipts | \`${readiness.inferenceReceipts.receiptsHash}\` |`,
    `| Reveal schedule | \`${readiness.revealSchedule.scheduleHash}\` |`,
    `| Sanitizer audit | \`${readiness.sanitizerAudit.auditHash}\` |`,
    `| Fallback drill | \`${readiness.fallbackDrill.drillHash}\` |`,
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildMarketReadinessMarkdown(readiness: MarketReadiness): string {
  const lines: string[] = [
    `# AIRLOCK Market Readiness`,
    ``,
    `Seed: \`${readiness.seed}\``,
    `Schema: \`${readiness.schema}\``,
    `Mode: **${readiness.mode}**`,
    `Readiness hash: \`${readiness.readinessHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Default rail | ${readiness.policy.defaultRail} |`,
    `| Real-money markets | ${readiness.policy.realMoneyMarkets} |`,
    `| Direct consumer betting | ${readiness.policy.directConsumerBetting} |`,
    ``,
    `## Gates`,
    ``,
    `| Gate | Status | Summary |`,
    `|---|---|---|`,
    ...readiness.gates.map((gate) => `| ${gate.id} | ${gate.status} | ${gate.summary} |`),
    ``,
    `## Evidence`,
    ``,
    `| Artifact | Hash |`,
    `|---|---|`,
    `| Certified feed | \`${readiness.evidence.certifiedFeed.feedHash}\` |`,
    `| Counsel memo | ${readiness.evidence.counselMemoHash ? `\`${readiness.evidence.counselMemoHash}\`` : 'missing'} |`,
    `| Jurisdiction policy | ${readiness.evidence.jurisdictionPolicyHash ? `\`${readiness.evidence.jurisdictionPolicyHash}\`` : 'missing'} |`,
    `| Licensed operator | ${readiness.evidence.licensedOperatorHash ? `\`${readiness.evidence.licensedOperatorHash}\`` : 'missing'} |`,
    `| Responsible play | ${readiness.evidence.responsiblePlayPolicyHash ? `\`${readiness.evidence.responsiblePlayPolicyHash}\`` : 'missing'} |`,
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildJurisdictionPolicyMarkdown(policy: JurisdictionPolicy): string {
  const lines: string[] = [
    `# AIRLOCK Jurisdiction Policy`,
    ``,
    `Program: \`${policy.programId}\``,
    `Schema: \`${policy.schema}\``,
    `Policy hash: \`${policy.policyHash}\``,
    ``,
    `## Posture`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Default global rail | ${policy.posture.defaultGlobalRail} |`,
    `| Real-money markets | ${policy.posture.realMoneyMarkets} |`,
    `| Direct consumer betting | ${policy.posture.directConsumerBetting} |`,
    `| B2B feed | ${policy.posture.b2bFeedAllowed} |`,
    ``,
    `## Gates`,
    ``,
    `| Gate | Status | Summary |`,
    `|---|---|---|`,
    ...policy.gates.map((gate) => `| ${gate.id} | ${gate.status} | ${gate.summary} |`),
    ``,
    `## Required Evidence`,
    ``,
    ...policy.requiredEvidence.map((evidence) => `- \`${evidence}\``),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildResponsiblePlayPolicyMarkdown(policy: ResponsiblePlayPolicy): string {
  const lines: string[] = [
    `# AIRLOCK Responsible Play Policy`,
    ``,
    `Program: \`${policy.programId}\``,
    `Schema: \`${policy.schema}\``,
    `Policy hash: \`${policy.policyHash}\``,
    ``,
    `## Posture`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Direct consumer betting | ${policy.posture.directConsumerBetting} |`,
    `| Real-money pools | ${policy.posture.realMoneyPools} |`,
    `| Default mode | ${policy.posture.defaultMode} |`,
    `| Prize redemption | ${policy.posture.prizeRedemption} |`,
    ``,
    `## Controls`,
    ``,
    `| Control | Status | Summary |`,
    `|---|---|---|`,
    ...policy.controls.map((control) => `| ${control.id} | ${control.status} | ${control.summary} |`),
    ``,
    `## Evidence Required`,
    ``,
    ...policy.evidenceRequired.map((evidence) => `- \`${evidence}\``),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildPartnerHandoffMarkdown(handoff: PartnerHandoff): string {
  const lines: string[] = [
    `# AIRLOCK Partner Handoff`,
    ``,
    `Seed: \`${handoff.seed}\``,
    `Program: \`${handoff.programId}\``,
    `Schema: \`${handoff.schema}\``,
    `Audience: ${handoff.audience}`,
    `Handoff hash: \`${handoff.handoffHash}\``,
    ``,
    `## Posture`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| AIRLOCK role | ${handoff.posture.airlockRole} |`,
    `| Partner role | ${handoff.posture.partnerRole} |`,
    `| Settlement | ${handoff.posture.settlement} |`,
    `| Direct consumer betting | ${handoff.posture.directConsumerBetting} |`,
    ``,
    `## Evidence`,
    ``,
    `| Artifact | Hash |`,
    `|---|---|`,
    `| B2B feed packet | \`${handoff.evidence.b2bFeedPacket.packetHash}\` |`,
    `| Jurisdiction policy | \`${handoff.evidence.jurisdictionPolicy.policyHash}\` |`,
    `| Responsible play policy | \`${handoff.evidence.responsiblePlayPolicy.policyHash}\` |`,
    ``,
    `## Checklist`,
    ``,
    `| Item | Status | Owner | Summary |`,
    `|---|---|---|---|`,
    ...handoff.checklist.map((item) => `| ${item.id} | ${item.status} | ${item.owner} | ${item.summary} |`),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildPromptRevealPolicyMarkdown(policy: PromptRevealPolicy): string {
  const lines: string[] = [
    `# AIRLOCK Prompt Reveal Policy`,
    ``,
    `Season: \`${policy.seasonId}\``,
    `Schema: \`${policy.schema}\``,
    `Policy hash: \`${policy.promptRevealHash}\``,
    ``,
    `## Policy`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Commitment required | ${policy.policy.commitmentRequired} |`,
    `| Public reveal lag | ${policy.policy.publicRevealLagSeasons} seasons |`,
    `| Live prompt publication | ${policy.policy.livePromptPublication} |`,
    `| Audit access | ${policy.policy.auditAccess} |`,
    `| Challenge access | ${policy.policy.challengeAccess} |`,
    ``,
    `## Stages`,
    ``,
    `| Stage | Timing | Audience | Material | Purpose |`,
    `|---|---|---|---|---|`,
    ...policy.stages.map((stage) => `| ${stage.id} | ${stage.timing} | ${stage.audience} | ${stage.material} | ${stage.purpose} |`),
    ``,
    `## Author Moat`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| Private prompt cap | ${policy.protectedAuthorMoat.privatePromptCapCharacters} characters |`,
    `| Public personality card | ${policy.protectedAuthorMoat.publicPersonalityCard} |`,
    `| Public match history | ${policy.protectedAuthorMoat.publicMatchHistory} |`,
    `| Private prompt reuse window | ${policy.protectedAuthorMoat.privatePromptReuseWindow} |`,
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildStageGatePolicyMarkdown(policy: StageGatePolicy): string {
  const lines: string[] = [
    `# AIRLOCK Stage Gate Policy`,
    ``,
    `Program: \`${policy.programId}\``,
    `Schema: \`${policy.schema}\``,
    `Policy hash: \`${policy.policyHash}\``,
    ``,
    `## Sequencing`,
    ``,
    policy.sequencing.map((stage, index) => `${index + 1}. ${stage}`).join('\n'),
    ``,
    `## Principles`,
    ``,
    `| Principle | Value |`,
    `|---|---|`,
    `| Betting last | ${policy.principles.bettingLast} |`,
    `| Independent stage exit | ${policy.principles.independentStageExit} |`,
    `| Counsel before real-money scope | ${policy.principles.counselBeforeRealMoneyScope} |`,
    ``,
    `## Metrics`,
    ``,
    `| Metric | Stage | Threshold | Source | Action on miss |`,
    `|---|---|---|---|---|`,
    ...policy.metrics.map(
      (metric) =>
        `| ${metric.id} | ${metric.stage} | ${metric.threshold} | ${metric.sourceArtifact} | ${metric.actionOnMiss} |`,
    ),
    ``,
  ];

  return `${lines.join('\n')}\n`;
}

function fallbackLabel(fallback: FallbackDrill['entries'][number]['fallback']): string {
  if (fallback.kind === 'action-intent') return fallback.intent.kind;
  if (fallback.kind === 'vote') return fallback.target ? `vote ${profiles[fallback.target].name}` : 'skip vote';
  return fallback.text;
}

function status(ok: boolean): string {
  return ok ? 'pass' : 'fail';
}
