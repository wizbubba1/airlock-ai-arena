import { agentIds, profiles } from './content';
import { runMatch } from './match';
import type { AgentId, Role } from './types';

export interface LadderAgentStanding {
  id: AgentId;
  name: string;
  rating: number;
  wins: number;
  losses: number;
  saboteurGames: number;
  technicianGames: number;
}

export interface LadderMatchRecord {
  seed: string;
  winner: Role;
  ticks: number;
  meetings: number;
  saboteurs: AgentId[];
  ratingDelta: Record<AgentId, number>;
}

export interface LadderSummary {
  schema: 'airlock.ladder.stage1.preview.v1';
  matchCount: number;
  seedPrefix: string;
  standings: LadderAgentStanding[];
  matches: LadderMatchRecord[];
}

const startingRating = 1000;
const kFactor = 24;

export function runLadderPreview(matchCount = 64, seedPrefix = 'stage-one-preview'): LadderSummary {
  const standings = Object.fromEntries(
    agentIds.map((id) => [
      id,
      {
        id,
        name: profiles[id].name,
        rating: startingRating,
        wins: 0,
        losses: 0,
        saboteurGames: 0,
        technicianGames: 0,
      },
    ]),
  ) as Record<AgentId, LadderAgentStanding>;

  const matches: LadderMatchRecord[] = [];

  for (let index = 0; index < matchCount; index += 1) {
    const seed = `${seedPrefix}-${index}`;
    const match = runMatch(seed);
    const winner = match.winner ?? 'saboteur';
    const saboteurs = agentIds.filter((id) => match.agents[id].role === 'saboteur');
    const ratingDelta = Object.fromEntries(agentIds.map((id) => [id, 0])) as Record<AgentId, number>;

    for (const id of agentIds) {
      const role = match.agents[id].role;
      const won = role === winner;
      const opponents = agentIds.filter((other) => match.agents[other].role !== role);
      const opponentAverage = opponents.reduce((sum, other) => sum + standings[other].rating, 0) / opponents.length;
      const expected = expectedScore(standings[id].rating, opponentAverage);
      const delta = Math.round(kFactor * ((won ? 1 : 0) - expected));

      standings[id].rating += delta;
      ratingDelta[id] = delta;
      if (won) standings[id].wins += 1;
      else standings[id].losses += 1;
      if (role === 'saboteur') standings[id].saboteurGames += 1;
      else standings[id].technicianGames += 1;
    }

    matches.push({
      seed,
      winner,
      ticks: match.tick,
      meetings: match.meetingCount,
      saboteurs,
      ratingDelta,
    });
  }

  return {
    schema: 'airlock.ladder.stage1.preview.v1',
    matchCount,
    seedPrefix,
    standings: Object.values(standings).sort((a, b) => b.rating - a.rating || a.id.localeCompare(b.id)),
    matches,
  };
}

function expectedScore(rating: number, opponentAverage: number): number {
  return 1 / (1 + 10 ** ((opponentAverage - rating) / 400));
}
