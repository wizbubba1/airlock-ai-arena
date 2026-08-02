import { digest } from './audit';
import { ruleset } from './ruleset';

export interface RoleRoadmapDrop {
  id: string;
  targetSeason: 'stage1-preview' | 'season-2' | 'season-3';
  roleFamily: 'technician-variant' | 'saboteur-variant' | 'neutral';
  status: 'design-only' | 'sim-required' | 'blocked-until-balance-pass';
  designGoal: string;
  releaseGate: string;
}

export interface RoleRoadmap {
  schema: 'airlock.role_roadmap.stage1.preview.v1';
  roadmapId: string;
  baseRuleset: string;
  policy: {
    baseSeasonRoles: 'technicians-vs-saboteurs-only';
    roleDropsRequireBalancePass: true;
    noMidSeasonUncommittedRoles: true;
    spectatorMarketImpactReview: true;
  };
  drops: RoleRoadmapDrop[];
  roadmapHash: string;
}

export function buildRoleRoadmap(roadmapId = 'airlock-role-roadmap.001'): RoleRoadmap {
  const roadmapCore = {
    schema: 'airlock.role_roadmap.stage1.preview.v1',
    roadmapId,
    baseRuleset: ruleset.id,
    policy: {
      baseSeasonRoles: 'technicians-vs-saboteurs-only',
      roleDropsRequireBalancePass: true,
      noMidSeasonUncommittedRoles: true,
      spectatorMarketImpactReview: true,
    },
    drops: [
      {
        id: `${roadmapId}.engineer-variant`,
        targetSeason: 'stage1-preview',
        roleFamily: 'technician-variant',
        status: 'sim-required',
        designGoal: 'Test whether limited public repair credibility creates richer meeting evidence without solving the match.',
        releaseGate: '>= 1,000 sim matches and no terminal win-rate guardrail breach.',
      },
      {
        id: `${roadmapId}.decoy-neutral`,
        targetSeason: 'season-2',
        roleFamily: 'neutral',
        status: 'design-only',
        designGoal: 'Add a non-team objective that keeps accusation markets uncertain after early meetings.',
        releaseGate: 'Transcript quality review confirms spectators can explain the role from public evidence.',
      },
      {
        id: `${roadmapId}.locksmith-saboteur`,
        targetSeason: 'season-3',
        roleFamily: 'saboteur-variant',
        status: 'blocked-until-balance-pass',
        designGoal: 'Explore a sabotage-focused impostor variant that pressures map-route inference rather than kill cadence.',
        releaseGate: 'Balance patch schedule and market readability gates both pass in preview simulations.',
      },
    ],
  } satisfies Omit<RoleRoadmap, 'roadmapHash'>;

  return {
    ...roadmapCore,
    roadmapHash: digest(roadmapCore),
  };
}
