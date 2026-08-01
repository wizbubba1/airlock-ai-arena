import { agentIds, graph, profiles, rooms } from './content';
import { SeededRng } from './rng';
import type { ActionIntent, AgentId, MatchState, RoomId } from './types';

export function chooseAction(state: MatchState, agentId: AgentId, rng: SeededRng): ActionIntent {
  const agent = state.agents[agentId];
  if (!agent.alive) return { kind: 'wait' };

  const reportableBody = state.bodies.find((body) => !body.reported && body.room === agent.room);
  if (reportableBody) return { kind: 'report' };

  const coLocatedLiving = agentIds.filter((id) => id !== agentId && state.agents[id].alive && state.agents[id].room === agent.room);
  if (agent.role === 'saboteur' && agent.killCooldown === 0) {
    const targets = coLocatedLiving.filter((id) => state.agents[id].role === 'technician');
    if (targets.length > 0 && rng.next() > 0.15) {
      return { kind: 'kill', target: rng.pick(targets) };
    }
  }

  if (agent.role === 'technician' && agent.tasks.includes(agent.room) && rng.next() > 0.18) {
    return { kind: 'task' };
  }

  const nextTask = agent.tasks[0];
  if (nextTask && agent.room !== nextTask) {
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
    return `${profile.name}: ${taskLine} My strongest concern is ${suspectName}; the route timing does not sit cleanly.`;
  }

  return `${profile.name}: I am voting ${suspectName}. If this flips wrong, check who avoided giving room-specific evidence.`;
}

export function chooseVote(state: MatchState, agentId: AgentId): AgentId | undefined {
  const agent = state.agents[agentId];
  if (!agent.alive) return undefined;

  const candidates = Object.entries(agent.suspicion)
    .filter(([id]) => id !== agentId && state.agents[id as AgentId].alive)
    .sort((a, b) => b[1] - a[1]);
  const top = candidates[0];
  if (!top || top[1] < 0.18) return undefined;
  return top[0] as AgentId;
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
