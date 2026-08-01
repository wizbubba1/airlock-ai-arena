export const ruleset = {
  id: 'stage0.v0.1',
  title: 'AIRLOCK Stage 0 House-Agent Ruleset',
  playerCount: 8,
  saboteurCount: 2,
  technicianCount: 6,
  taskCount: 8,
  actionTicksPerCycle: 8,
  maxTicks: 56,
  killCooldownTicks: 3,
  taskCompletionChance: 0.32,
  initialSuspicion: 0.12,
  roomKillSuspicionDelta: 0.3,
  completedWorkSuspicionDelta: -0.04,
  saboteurPartnerRevealDelta: 0.08,
  clearedEjectionDelta: -0.015,
  minSuspicion: 0.02,
  marketFloor: 0.03,
  marketCeiling: 0.78,
  meetingSpeechRounds: 2,
} as const;

export type Ruleset = typeof ruleset;
