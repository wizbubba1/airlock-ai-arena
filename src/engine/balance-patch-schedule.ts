import { digest } from './audit';
import { ruleset } from './ruleset';

export interface BalancePatchMutation {
  id: string;
  patchWindow: 'week-2' | 'week-4' | 'week-6';
  target: 'tasks' | 'cooldowns' | 'meetings' | 'market';
  trigger: string;
  change: string;
  operatorDiscretion: 'none-precommitted-only';
}

export interface BalancePatchSchedule {
  schema: 'airlock.balance_patch_schedule.stage1.preview.v1';
  seasonId: string;
  baseRuleset: string;
  cadence: {
    windowDays: number;
    announcementPolicy: 'publish-before-season-start';
    activationPolicy: 'activate-only-listed-mutations';
  };
  guardrails: {
    minTechnicianWinRate: number;
    maxTechnicianWinRate: number;
    minAverageMeetings: number;
    maxAverageMeetings: number;
  };
  mutations: BalancePatchMutation[];
  scheduleHash: string;
}

export function buildBalancePatchSchedule(seasonId = 'stage1-preview.001'): BalancePatchSchedule {
  const mutations: BalancePatchMutation[] = [
    {
      id: `${seasonId}.week-2.task-pressure`,
      patchWindow: 'week-2',
      target: 'tasks',
      trigger: 'Technician win rate below 0.40 or average ticks above 24 after the review sample.',
      change: `Reduce task count from ${ruleset.taskCount} to ${ruleset.taskCount - 1}.`,
      operatorDiscretion: 'none-precommitted-only',
    },
    {
      id: `${seasonId}.week-2.saboteur-pressure`,
      patchWindow: 'week-2',
      target: 'cooldowns',
      trigger: 'Technician win rate above 0.70 or average ticks below 9 after the review sample.',
      change: `Reduce kill cooldown from ${ruleset.killCooldownTicks} ticks to ${Math.max(1, ruleset.killCooldownTicks - 1)} ticks.`,
      operatorDiscretion: 'none-precommitted-only',
    },
    {
      id: `${seasonId}.week-4.meeting-density`,
      patchWindow: 'week-4',
      target: 'meetings',
      trigger: 'Average meetings outside the 2-8 guardrail after the review sample.',
      change: `Move action cycle length from ${ruleset.actionTicksPerCycle} ticks to ${ruleset.actionTicksPerCycle - 1} or ${ruleset.actionTicksPerCycle + 1}, depending on direction of drift.`,
      operatorDiscretion: 'none-precommitted-only',
    },
    {
      id: `${seasonId}.week-6.market-readable`,
      patchWindow: 'week-6',
      target: 'market',
      trigger: 'Terminal market leader misses both Saboteurs in more than 70% of reviewed matches.',
      change: `Tighten public market bounds from ${ruleset.marketFloor}-${ruleset.marketCeiling} to 0.05-0.72.`,
      operatorDiscretion: 'none-precommitted-only',
    },
  ];
  const scheduleCore = {
    schema: 'airlock.balance_patch_schedule.stage1.preview.v1',
    seasonId,
    baseRuleset: ruleset.id,
    cadence: {
      windowDays: 14,
      announcementPolicy: 'publish-before-season-start',
      activationPolicy: 'activate-only-listed-mutations',
    },
    guardrails: {
      minTechnicianWinRate: 0.35,
      maxTechnicianWinRate: 0.75,
      minAverageMeetings: 2,
      maxAverageMeetings: 8,
    },
    mutations,
  } satisfies Omit<BalancePatchSchedule, 'scheduleHash'>;

  return {
    ...scheduleCore,
    scheduleHash: digest(scheduleCore),
  };
}
