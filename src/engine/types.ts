export type Role = 'technician' | 'saboteur';

export type RoomId =
  | 'bridge'
  | 'medbay'
  | 'reactor'
  | 'galley'
  | 'comms'
  | 'hydroponics'
  | 'security'
  | 'cargo'
  | 'airlock'
  | 'observatory';

export type AgentId =
  | 'vanta'
  | 'kepler'
  | 'morrow'
  | 'sable'
  | 'ion'
  | 'nyx'
  | 'sol'
  | 'rune';

export type MatchPhase = 'action' | 'meeting' | 'ended';

export type ActionIntent =
  | { kind: 'move'; to: RoomId }
  | { kind: 'task' }
  | { kind: 'kill'; target: AgentId }
  | { kind: 'report' }
  | { kind: 'wait' };

export interface AgentProfile {
  id: AgentId;
  name: string;
  callsign: string;
  persona: string;
  color: string;
  policy: {
    aggression: number;
    diligence: number;
    suspicionThreshold: number;
    wander: number;
    voice: 'terse' | 'analytical' | 'narrative' | 'direct' | 'operational' | 'quiet' | 'diplomatic' | 'pattern';
  };
}

export interface AgentState {
  id: AgentId;
  role: Role;
  alive: boolean;
  room: RoomId;
  tasks: RoomId[];
  completedTasks: number;
  killCooldown: number;
  suspicion: Record<AgentId, number>;
}

export interface TranscriptEvent {
  id: string;
  tick: number;
  phase: MatchPhase;
  speaker?: AgentId;
  kind: 'system' | 'movement' | 'task' | 'kill' | 'report' | 'speech' | 'vote' | 'market' | 'end';
  text: string;
  publicText: string;
}

export interface MarketSnapshot {
  tick: number;
  prices: Record<AgentId, number>;
}

export interface PublicAgentSnapshot {
  id: AgentId;
  alive: boolean;
  room: RoomId;
  completedTasks: number;
}

export interface PublicStateSnapshot {
  tick: number;
  phase: MatchPhase;
  agents: Record<AgentId, PublicAgentSnapshot>;
  bodies: Array<{ room: RoomId; tick: number; reported: boolean }>;
}

export interface MatchState {
  seed: string;
  tick: number;
  phase: MatchPhase;
  agents: Record<AgentId, AgentState>;
  bodies: Array<{ victim: AgentId; room: RoomId; tick: number; reported: boolean }>;
  transcript: TranscriptEvent[];
  market: MarketSnapshot[];
  snapshots: PublicStateSnapshot[];
  meetingCount: number;
  winner?: Role;
  reason?: string;
}
