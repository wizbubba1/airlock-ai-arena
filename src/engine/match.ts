import { chooseAction, chooseVote, meetingSpeech } from './agents';
import { agentIds, graph, profiles, rooms } from './content';
import { SeededRng } from './rng';
import type { ActionIntent, AgentId, AgentState, MarketSnapshot, MatchState, Role, RoomId, TranscriptEvent } from './types';

const taskCount = 8;
const actionTicksPerCycle = 8;
const maxTicks = 56;

export function createMatch(seed = 'airlock-season-zero'): MatchState {
  const rng = new SeededRng(seed);
  const saboteurs = new Set(rng.shuffle(agentIds).slice(0, 2));
  const shuffledRooms = rng.shuffle(rooms);

  const agents = Object.fromEntries(
    agentIds.map((id, index) => {
      const role: Role = saboteurs.has(id) ? 'saboteur' : 'technician';
      const tasks = role === 'technician' ? buildTasks(rng, index) : [];
      const agent: AgentState = {
        id,
        role,
        alive: true,
        room: shuffledRooms[index % shuffledRooms.length],
        tasks,
        completedTasks: 0,
        killCooldown: role === 'saboteur' ? 0 : 999,
        suspicion: Object.fromEntries(agentIds.map((other) => [other, other === id ? 0 : 0.12])) as Record<AgentId, number>,
      };
      return [id, agent];
    }),
  ) as Record<AgentId, AgentState>;

  const state: MatchState = {
    seed,
    tick: 0,
    phase: 'action',
    agents,
    bodies: [],
    transcript: [],
    market: [],
    meetingCount: 0,
  };

  addEvent(state, 'system', 'AIRLOCK match initialized. Roles are sealed until match end.', 'Roles sealed; eight agents enter Salvage Station Theta.');
  updateMarket(state);
  return state;
}

export function runMatch(seed = 'airlock-season-zero'): MatchState {
  const state = createMatch(seed);
  while (state.phase !== 'ended' && state.tick < maxTicks) {
    if (state.phase === 'action') {
      runActionTick(state);
    }
  }

  if (state.phase !== 'ended') {
    endMatch(state, 'saboteur', 'Time expired before Technicians finished repairs.');
  }

  return state;
}

export function runActionTick(state: MatchState): MatchState {
  if (state.phase !== 'action') return state;
  state.tick += 1;
  const rng = new SeededRng(`${state.seed}:tick:${state.tick}`);
  const intents = Object.fromEntries(agentIds.map((id) => [id, chooseAction(state, id, rng)])) as Record<AgentId, ActionIntent>;

  for (const id of rng.shuffle(agentIds)) {
    const agent = state.agents[id];
    if (!agent.alive) continue;
    const intent = intents[id];

    if (intent.kind === 'move' && graph[agent.room].includes(intent.to)) {
      const from = agent.room;
      agent.room = intent.to;
      addEvent(state, 'movement', `${profiles[id].name} moved from ${from} to ${intent.to}.`, `${profiles[id].name} crossed into ${label(intent.to)}.`, id);
    }

    if (intent.kind === 'task' && agent.role === 'technician' && agent.tasks.includes(agent.room)) {
      if (rng.next() > 0.68) {
        agent.tasks = agent.tasks.filter((room) => room !== agent.room);
        agent.completedTasks += 1;
        addEvent(state, 'task', `${profiles[id].name} completed a task in ${agent.room}.`, `${profiles[id].name} logged a repair in ${label(agent.room)}.`, id);
      } else {
        addEvent(state, 'task', `${profiles[id].name} worked on a task in ${agent.room}.`, `${profiles[id].name} worked a repair panel in ${label(agent.room)}.`, id);
      }
      lowerWorkerSuspicion(state, id);
    }

    if (intent.kind === 'kill' && agent.role === 'saboteur' && agent.killCooldown === 0) {
      const target = state.agents[intent.target];
      if (target?.alive && target.room === agent.room && target.role === 'technician') {
        target.alive = false;
        agent.killCooldown = 3;
        state.bodies.push({ victim: intent.target, room: agent.room, tick: state.tick, reported: false });
        addEvent(state, 'kill', `${profiles[id].name} eliminated ${profiles[intent.target].name} in ${agent.room}.`, `A pressure alarm flickered in ${label(agent.room)}.`, id);
        spreadRoomSuspicion(state, agent.room, id);
      }
    }

    if (intent.kind === 'report') {
      const body = state.bodies.find((entry) => !entry.reported && entry.room === agent.room);
      if (body) {
        body.reported = true;
        addEvent(state, 'report', `${profiles[id].name} reported ${profiles[body.victim].name} in ${agent.room}.`, `${profiles[id].name} reported a body in ${label(agent.room)}.`, id);
        runMeeting(state);
        break;
      }
    }
  }

  for (const agent of Object.values(state.agents)) {
    if (agent.killCooldown < 999 && agent.killCooldown > 0) agent.killCooldown -= 1;
  }

  updateMarket(state);
  checkWin(state);

  if (state.phase === 'action' && state.tick % actionTicksPerCycle === 0) {
    addEvent(state, 'system', 'Scheduled station council called.', 'Scheduled station council called.');
    runMeeting(state);
  }

  return state;
}

function runMeeting(state: MatchState): void {
  if (state.phase === 'ended') return;
  state.phase = 'meeting';
  state.meetingCount += 1;
  addEvent(state, 'market', 'Live suspicion market closes for vote commit.', 'Pick window locked before council statements.');

  for (const round of [1, 2]) {
    for (const id of agentIds) {
      if (!state.agents[id].alive) continue;
      const speech = meetingSpeech(state, id, round);
      addEvent(state, 'speech', speech, speech, id);
    }
  }

  const votes = new Map<AgentId, number>();
  for (const id of agentIds) {
    const vote = chooseVote(state, id);
    if (!vote) continue;
    votes.set(vote, (votes.get(vote) ?? 0) + 1);
    addEvent(state, 'vote', `${profiles[id].name} voted for ${profiles[vote].name}.`, `${profiles[id].name} voted for ${profiles[vote].name}.`, id);
  }

  const result = [...votes.entries()].sort((a, b) => b[1] - a[1]);
  if (result.length > 0 && result[0][1] !== result[1]?.[1]) {
    const [ejected] = result[0];
    state.agents[ejected].alive = false;
    addEvent(state, 'vote', `${profiles[ejected].name} was ejected. Role: ${state.agents[ejected].role}.`, `${profiles[ejected].name} was ejected from the station.`, ejected);
    adjustAfterEjection(state, ejected);
  } else {
    addEvent(state, 'vote', 'Vote tied. No ejection.', 'Vote tied. No ejection.');
  }

  updateMarket(state);
  checkWin(state);
  if (!state.winner) state.phase = 'action';
}

function checkWin(state: MatchState): void {
  const livingTechnicians = agentIds.filter((id) => state.agents[id].alive && state.agents[id].role === 'technician').length;
  const livingSaboteurs = agentIds.filter((id) => state.agents[id].alive && state.agents[id].role === 'saboteur').length;
  const totalTasksLeft = agentIds.reduce((sum, id) => sum + state.agents[id].tasks.length, 0);

  if (livingSaboteurs === 0) {
    endMatch(state, 'technician', 'All Saboteurs were ejected.');
  } else if (totalTasksLeft === 0) {
    endMatch(state, 'technician', 'All station repairs were completed.');
  } else if (livingSaboteurs >= livingTechnicians) {
    endMatch(state, 'saboteur', 'Saboteurs reached parity with Technicians.');
  }
}

function endMatch(state: MatchState, winner: Role, reason: string): void {
  state.phase = 'ended';
  state.winner = winner;
  state.reason = reason;
  addEvent(state, 'end', `${winner} win: ${reason}`, `${winner === 'technician' ? 'Technicians' : 'Saboteurs'} win: ${reason}`);
}

function updateMarket(state: MatchState): void {
  const prices = Object.fromEntries(
    agentIds.map((id) => {
      const agent = state.agents[id];
      if (!agent.alive) return [id, 0];
      const suspicionAverage =
        agentIds.reduce((sum, observer) => sum + state.agents[observer].suspicion[id], 0) / agentIds.length;
      return [id, Math.max(0.03, Math.min(0.78, suspicionAverage))];
    }),
  ) as Record<AgentId, number>;
  const total = Object.values(prices).reduce((sum, value) => sum + value, 0);
  const normalized = Object.fromEntries(agentIds.map((id) => [id, Math.round((prices[id] / total) * 100)])) as Record<AgentId, number>;
  const snapshot: MarketSnapshot = { tick: state.tick, prices: normalized };
  state.market.push(snapshot);
}

function addEvent(
  state: MatchState,
  kind: TranscriptEvent['kind'],
  text: string,
  publicText: string,
  speaker?: AgentId,
): void {
  state.transcript.push({
    id: `${state.tick}-${state.transcript.length}-${kind}`,
    tick: state.tick,
    phase: state.phase,
    speaker,
    kind,
    text,
    publicText,
  });
}

function buildTasks(rng: SeededRng, offset: number): RoomId[] {
  const shuffled = rng.shuffle(rooms);
  return Array.from({ length: taskCount }, (_, index) => shuffled[(index + offset) % shuffled.length]);
}

function spreadRoomSuspicion(state: MatchState, room: RoomId, actor: AgentId): void {
  const witnesses = agentIds.filter((id) => state.agents[id].alive && state.agents[id].room === room && id !== actor);
  for (const witness of witnesses) {
    for (const suspect of agentIds) {
      if (state.agents[suspect].alive && suspect !== witness && state.agents[suspect].room === room) {
        state.agents[witness].suspicion[suspect] += 0.3;
      }
    }
  }
}

function lowerWorkerSuspicion(state: MatchState, worker: AgentId): void {
  for (const observer of agentIds) {
    if (!state.agents[observer].alive || observer === worker) continue;
    state.agents[observer].suspicion[worker] = Math.max(0.02, state.agents[observer].suspicion[worker] - 0.04);
  }
}

function adjustAfterEjection(state: MatchState, ejected: AgentId): void {
  const wasSaboteur = state.agents[ejected].role === 'saboteur';
  for (const observer of agentIds) {
    for (const suspect of agentIds) {
      if (suspect === ejected) continue;
      state.agents[observer].suspicion[suspect] += wasSaboteur && state.agents[suspect].role === 'saboteur' ? 0.08 : -0.015;
      state.agents[observer].suspicion[suspect] = Math.max(0.02, state.agents[observer].suspicion[suspect]);
    }
  }
}

function label(room: RoomId): string {
  return room[0].toUpperCase() + room.slice(1);
}
