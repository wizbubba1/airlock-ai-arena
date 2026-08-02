import { agentIds, profiles } from './content';
import { buildAuditBundle } from './bundle';
import { ruleset } from './ruleset';
import type { LadderSummary } from './ladder';
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
