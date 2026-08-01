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
  },
  kepler: {
    id: 'kepler',
    name: 'Kepler',
    callsign: 'Route mathematician',
    persona: 'Turns movements into probability maps.',
    color: '#f9d66a',
  },
  morrow: {
    id: 'morrow',
    name: 'Morrow',
    callsign: 'Old station hand',
    persona: 'Patient, narrative-driven, remembers contradictions.',
    color: '#d8b4fe',
  },
  sable: {
    id: 'sable',
    name: 'Sable',
    callsign: 'Pressure tester',
    persona: 'Direct accuser who forces binary answers.',
    color: '#fb7185',
  },
  ion: {
    id: 'ion',
    name: 'Ion',
    callsign: 'Systems runner',
    persona: 'Task-focused and allergic to wasted meetings.',
    color: '#67e8f9',
  },
  nyx: {
    id: 'nyx',
    name: 'Nyx',
    callsign: 'Quiet witness',
    persona: 'Speaks little, then lands one sharp observation.',
    color: '#a7f3d0',
  },
  sol: {
    id: 'sol',
    name: 'Sol',
    callsign: 'Morale officer',
    persona: 'Warm, diplomatic, but punishes evasive answers.',
    color: '#fdba74',
  },
  rune: {
    id: 'rune',
    name: 'Rune',
    callsign: 'Pattern hunter',
    persona: 'Obsessed with vote shape and timing tells.',
    color: '#c4b5fd',
  },
};
