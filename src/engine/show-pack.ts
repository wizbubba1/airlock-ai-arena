import { auditDigests, digest } from './audit';
import { agentIds, profiles } from './content';
import { runMatch } from './match';
import { ruleset } from './ruleset';
import type { AgentId, Role } from './types';

export const defaultShowSeeds = [
  'airlock-stage-zero-demo',
  'stage-zero-show-1',
  'stage-zero-show-2',
  'stage-zero-show-3',
] as const;

export interface ShowPackMatch {
  seed: string;
  title: string;
  prompt: string;
  winner: Role;
  reason: string;
  ticks: number;
  meetings: number;
  transcriptEvents: number;
  saboteurs: AgentId[];
  leadSuspects: AgentId[];
  openingTranscript: string[];
  meetingTranscript: string[];
  transcriptHash: string;
  marketHash: string;
  entropyHash: string;
}

export interface ShowPack {
  schema: 'airlock.show_pack.stage0.v1';
  ruleset: string;
  matches: ShowPackMatch[];
  packHash: string;
}

export function buildShowPack(seeds: readonly string[] = defaultShowSeeds): ShowPack {
  const matches = seeds.map((seed, index) => buildShowPackMatch(seed, index + 1));
  const packCore = {
    schema: 'airlock.show_pack.stage0.v1',
    ruleset: ruleset.id,
    matches,
  } satisfies Omit<ShowPack, 'packHash'>;

  return {
    ...packCore,
    packHash: digest(packCore),
  };
}

function buildShowPackMatch(seed: string, showNumber: number): ShowPackMatch {
  const match = runMatch(seed);
  const digests = auditDigests(match);
  const saboteurs = agentIds.filter((id) => match.agents[id].role === 'saboteur');
  const terminalMarket = match.market.at(-1) ?? match.market[0];
  const leadSuspects = [...agentIds].sort((a, b) => terminalMarket.prices[b] - terminalMarket.prices[a]).slice(0, 2);
  const openingTranscript = match.transcript
    .filter((event) => event.kind === 'system' || event.kind === 'movement' || event.kind === 'task' || event.kind === 'report')
    .slice(0, 6)
    .map((event) => `T${event.tick} ${event.publicText}`);
  const meetingTranscript = match.transcript
    .filter((event) => event.kind === 'speech' || event.kind === 'vote')
    .slice(0, 8)
    .map((event) => `T${event.tick} ${event.publicText}`);

  return {
    seed,
    title: `Show ${showNumber}: ${headlineFor(match.winner ?? 'saboteur', match.meetingCount)}`,
    prompt: `Before reveal, pick the two Saboteurs from ${agentIds.map((id) => profiles[id].name).join(', ')}.`,
    winner: match.winner ?? 'saboteur',
    reason: match.reason ?? 'unknown',
    ticks: match.tick,
    meetings: match.meetingCount,
    transcriptEvents: match.transcript.length,
    saboteurs,
    leadSuspects,
    openingTranscript,
    meetingTranscript,
    transcriptHash: digests.transcriptHash,
    marketHash: digests.marketHash,
    entropyHash: digests.entropyHash,
  };
}

function headlineFor(winner: Role, meetings: number): string {
  if (winner === 'technician') return meetings >= 4 ? 'Crew survives a long argument' : 'Crew finds the fault line early';
  return meetings >= 4 ? 'Saboteurs win through confusion' : 'Saboteurs close fast';
}
