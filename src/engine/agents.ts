import { agentIds, graph, profiles, rooms } from './content';
import { SeededRng } from './rng';
import type { ActionIntent, AgentId, MatchState, RoomId } from './types';

export function chooseAction(state: MatchState, agentId: AgentId, rng: SeededRng): ActionIntent {
  const agent = state.agents[agentId];
  const profile = profiles[agentId];
  if (!agent.alive) return { kind: 'wait' };

  const reportableBody = state.bodies.find((body) => !body.reported && body.room === agent.room);
  if (reportableBody) return { kind: 'report' };

  const coLocatedLiving = agentIds.filter((id) => id !== agentId && state.agents[id].alive && state.agents[id].room === agent.room);
  if (agent.role === 'saboteur' && agent.killCooldown === 0) {
    const targets = coLocatedLiving.filter((id) => state.agents[id].role === 'technician');
    if (targets.length > 0 && rng.next() < profile.policy.aggression) {
      return { kind: 'kill', target: rng.pick(targets) };
    }
  }

  if (agent.role === 'technician' && agent.tasks.includes(agent.room) && rng.next() < profile.policy.diligence) {
    return { kind: 'task' };
  }

  const nextTask = agent.tasks[0];
  if (nextTask && agent.room !== nextTask && rng.next() > profile.policy.wander) {
    return { kind: 'move', to: nextRoomToward(agent.room, nextTask) };
  }

  return { kind: 'move', to: rng.pick(graph[agent.room]) };
}

export function meetingSpeech(state: MatchState, agentId: AgentId, round: number): string {
  const agent = state.agents[agentId];
  const profile = profiles[agentId];
  const mostSuspect = Object.entries(agent.suspicion)
    .filter(([id]) => id !== agentId && state.agents[id as AgentId].alive)
    .sort((a, b) => b[1] - a[1])[0]?.[0] as AgentId | undefined;
  const suspectName = mostSuspect ? profiles[mostSuspect].name : 'no one';
  const taskLine =
    agent.role === 'saboteur'
      ? `I was maintaining ${formatRoom(agent.room)} and watching routes.`
      : `I have ${agent.tasks.length} tasks left and last worked near ${formatRoom(agent.room)}.`;

  if (round === 1) {
    return `${profile.name}: ${taskLine} ${voiceLine(profile.policy.voice, suspectName, 'read')}`;
  }

  return `${profile.name}: ${voiceLine(profile.policy.voice, suspectName, 'vote')}`;
}

export function chooseVote(state: MatchState, agentId: AgentId): AgentId | undefined {
  const agent = state.agents[agentId];
  if (!agent.alive) return undefined;

  const candidates = Object.entries(agent.suspicion)
    .filter(([id]) => id !== agentId && state.agents[id as AgentId].alive)
    .sort((a, b) => b[1] - a[1]);
  const top = candidates[0];
  if (!top || top[1] < profiles[agentId].policy.suspicionThreshold) return undefined;
  return top[0] as AgentId;
}

function voiceLine(voice: (typeof profiles)[AgentId]['policy']['voice'], suspectName: string, mode: 'read' | 'vote'): string {
  const lines = {
    terse: {
      read: `Concern: ${suspectName}. Too neat.`,
      vote: `Voting ${suspectName}. Recheck the clean alibis if I am wrong.`,
    },
    analytical: {
      read: `${suspectName} has the worst route fit by my current map.`,
      vote: `My vote is ${suspectName}; movement probability is the deciding factor.`,
    },
    narrative: {
      read: `The story bends around ${suspectName}; I want that timeline tested.`,
      vote: `I am voting ${suspectName}. The contradiction has lasted two rounds.`,
    },
    direct: {
      read: `${suspectName}, answer plainly: why were you near the pressure alarm?`,
      vote: `I am voting ${suspectName}. No more fog.`,
    },
    operational: {
      read: `${suspectName} is slowing repair confidence more than helping it.`,
      vote: `Vote ${suspectName}. Then finish tasks immediately.`,
    },
    quiet: {
      read: `${suspectName} moved once when silence would have been safer.`,
      vote: `${suspectName}. That is my only clean read.`,
    },
    diplomatic: {
      read: `I do not love the case, but ${suspectName} owes the room a cleaner sequence.`,
      vote: `I am voting ${suspectName}; if this misses, compare who followed too easily.`,
    },
    pattern: {
      read: `${suspectName} fits the pressure, vote, and route pattern better than anyone else.`,
      vote: `Voting ${suspectName}. The pattern is louder than the speech.`,
    },
  };

  return lines[voice][mode];
}

function nextRoomToward(from: RoomId, to: RoomId): RoomId {
  if (graph[from].includes(to)) return to;
  const queue: Array<{ room: RoomId; path: RoomId[] }> = [{ room: from, path: [] }];
  const seen = new Set<RoomId>([from]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    for (const neighbor of graph[current.room]) {
      if (seen.has(neighbor)) continue;
      const path = [...current.path, neighbor];
      if (neighbor === to) return path[0];
      seen.add(neighbor);
      queue.push({ room: neighbor, path });
    }
  }

  return graph[from][0] ?? rooms[0];
}

function formatRoom(room: RoomId): string {
  return room.replace('-', ' ');
}
