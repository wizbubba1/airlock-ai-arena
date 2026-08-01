import type { AgentId, AgentProfile, RoomId } from './types';

export const rooms: RoomId[] = [
  'bridge',
  'medbay',
  'reactor',
  'galley',
  'comms',
  'hydroponics',
  'security',
  'cargo',
  'airlock',
  'observatory',
];

export const graph: Record<RoomId, RoomId[]> = {
  bridge: ['comms', 'security', 'observatory'],
  medbay: ['galley', 'hydroponics'],
  reactor: ['cargo', 'security'],
  galley: ['medbay', 'comms', 'cargo'],
  comms: ['bridge', 'galley', 'airlock'],
  hydroponics: ['medbay', 'observatory'],
  security: ['bridge', 'reactor', 'airlock'],
  cargo: ['reactor', 'galley', 'airlock'],
  airlock: ['comms', 'security', 'cargo'],
  observatory: ['bridge', 'hydroponics'],
};

export const agentIds: AgentId[] = ['vanta', 'kepler', 'morrow', 'sable', 'ion', 'nyx', 'sol', 'rune'];

export const profiles: Record<AgentId, AgentProfile> = {
  vanta: {
    id: 'vanta',
    name: 'Vanta',
    callsign: 'Blackbox auditor',
    persona: 'Clinical, terse, suspicious of convenient stories.',
    color: '#93f7d4',
    policy: { aggression: 0.62, diligence: 0.76, suspicionThreshold: 0.17, wander: 0.12, voice: 'terse' },
  },
  kepler: {
    id: 'kepler',
    name: 'Kepler',
    callsign: 'Route mathematician',
    persona: 'Turns movements into probability maps.',
    color: '#f9d66a',
    policy: { aggression: 0.48, diligence: 0.82, suspicionThreshold: 0.2, wander: 0.08, voice: 'analytical' },
  },
  morrow: {
    id: 'morrow',
    name: 'Morrow',
    callsign: 'Old station hand',
    persona: 'Patient, narrative-driven, remembers contradictions.',
    color: '#d8b4fe',
    policy: { aggression: 0.36, diligence: 0.68, suspicionThreshold: 0.23, wander: 0.18, voice: 'narrative' },
  },
  sable: {
    id: 'sable',
    name: 'Sable',
    callsign: 'Pressure tester',
    persona: 'Direct accuser who forces binary answers.',
    color: '#fb7185',
    policy: { aggression: 0.84, diligence: 0.55, suspicionThreshold: 0.14, wander: 0.26, voice: 'direct' },
  },
  ion: {
    id: 'ion',
    name: 'Ion',
    callsign: 'Systems runner',
    persona: 'Task-focused and allergic to wasted meetings.',
    color: '#67e8f9',
    policy: { aggression: 0.32, diligence: 0.94, suspicionThreshold: 0.24, wander: 0.06, voice: 'operational' },
  },
  nyx: {
    id: 'nyx',
    name: 'Nyx',
    callsign: 'Quiet witness',
    persona: 'Speaks little, then lands one sharp observation.',
    color: '#a7f3d0',
    policy: { aggression: 0.44, diligence: 0.73, suspicionThreshold: 0.21, wander: 0.1, voice: 'quiet' },
  },
  sol: {
    id: 'sol',
    name: 'Sol',
    callsign: 'Morale officer',
    persona: 'Warm, diplomatic, but punishes evasive answers.',
    color: '#fdba74',
    policy: { aggression: 0.4, diligence: 0.7, suspicionThreshold: 0.22, wander: 0.14, voice: 'diplomatic' },
  },
  rune: {
    id: 'rune',
    name: 'Rune',
    callsign: 'Pattern hunter',
    persona: 'Obsessed with vote shape and timing tells.',
    color: '#c4b5fd',
    policy: { aggression: 0.58, diligence: 0.64, suspicionThreshold: 0.18, wander: 0.2, voice: 'pattern' },
  },
};
