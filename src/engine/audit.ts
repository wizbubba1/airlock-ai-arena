import { agentIds, profiles } from './content';
import { hashString } from './rng';
import type { MatchState } from './types';

export interface AuditDigests {
  rolesHash: string;
  transcriptHash: string;
  marketHash: string;
  personaHash: string;
  snapshotHash: string;
}

export function auditDigests(match: MatchState): AuditDigests {
  return {
    rolesHash: digest(
      agentIds.map((id) => ({
        id,
        role: match.agents[id].role,
      })),
    ),
    transcriptHash: digest(match.transcript.map(({ tick, kind, speaker, publicText }) => ({ tick, kind, speaker, publicText }))),
    marketHash: digest(match.market),
    personaHash: digest(agentIds.map((id) => profiles[id])),
    snapshotHash: digest(match.snapshots),
  };
}

export function digest(value: unknown): string {
  return `fnv1a32:${hashString(stableStringify(value)).toString(16).padStart(8, '0')}`;
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`;

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}
