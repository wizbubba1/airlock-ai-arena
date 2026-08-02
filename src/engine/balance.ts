import { agentIds } from './content';
import { runMatch } from './match';
import type { AgentId } from './types';

export interface BalanceSummary {
  schema: 'airlock.balance.stage0.v1';
  matchCount: number;
  seedPrefix: string;
  wins: {
    technician: number;
    saboteur: number;
  };
  averages: {
    ticks: number;
    meetings: number;
    transcriptEvents: number;
  };
  saboteurPairs: Record<string, number>;
  terminalReasons: Record<string, number>;
}

export interface BalanceGuard {
  ok: boolean;
  technicianRate: number;
  saboteurRate: number;
  errors: string[];
}

export function buildBalanceSummary(matchCount = 1000, seedPrefix = 'stage-zero'): BalanceSummary {
  const summary: BalanceSummary = {
    schema: 'airlock.balance.stage0.v1',
    matchCount,
    seedPrefix,
    wins: {
      technician: 0,
      saboteur: 0,
    },
    averages: {
      ticks: 0,
      meetings: 0,
      transcriptEvents: 0,
    },
    saboteurPairs: {},
    terminalReasons: {},
  };

  for (let index = 0; index < matchCount; index += 1) {
    const match = runMatch(`${seedPrefix}-${index}`);
    if (match.winner === 'technician') summary.wins.technician += 1;
    if (match.winner === 'saboteur') summary.wins.saboteur += 1;
    summary.averages.ticks += match.tick;
    summary.averages.meetings += match.meetingCount;
    summary.averages.transcriptEvents += match.transcript.length;

    const saboteurPair = agentIds
      .filter((id) => match.agents[id].role === 'saboteur')
      .sort()
      .join('+') as `${AgentId}+${AgentId}`;
    summary.saboteurPairs[saboteurPair] = (summary.saboteurPairs[saboteurPair] ?? 0) + 1;

    const reason = match.reason ?? 'unknown';
    summary.terminalReasons[reason] = (summary.terminalReasons[reason] ?? 0) + 1;
  }

  summary.averages.ticks = roundBalance(summary.averages.ticks / matchCount);
  summary.averages.meetings = roundBalance(summary.averages.meetings / matchCount);
  summary.averages.transcriptEvents = roundBalance(summary.averages.transcriptEvents / matchCount);

  return summary;
}

export function evaluateBalance(summary: BalanceSummary): BalanceGuard {
  const technicianRate = summary.wins.technician / summary.matchCount;
  const saboteurRate = summary.wins.saboteur / summary.matchCount;
  const errors: string[] = [];

  if (technicianRate < 0.35 || technicianRate > 0.75) {
    errors.push(`Technician win rate ${roundBalance(technicianRate)} is outside 0.35-0.75.`);
  }
  if (saboteurRate < 0.25 || saboteurRate > 0.65) {
    errors.push(`Saboteur win rate ${roundBalance(saboteurRate)} is outside 0.25-0.65.`);
  }
  if (summary.averages.ticks < 8 || summary.averages.ticks > 30) {
    errors.push(`Average ticks ${summary.averages.ticks} is outside 8-30.`);
  }
  if (summary.averages.meetings < 2 || summary.averages.meetings > 8) {
    errors.push(`Average meetings ${summary.averages.meetings} is outside 2-8.`);
  }

  return {
    ok: errors.length === 0,
    technicianRate: roundBalance(technicianRate),
    saboteurRate: roundBalance(saboteurRate),
    errors,
  };
}

export function roundBalance(value: number): number {
  return Number(value.toFixed(2));
}
