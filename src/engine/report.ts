import { agentIds, profiles } from './content';
import { buildAuditBundle } from './bundle';
import { ruleset } from './ruleset';
import type { ArtifactCatalog } from './artifact-catalog';
import type { LadderSummary } from './ladder';
import type { SeedIndex } from './seed-index';
import type { ShowPack } from './show-pack';
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
