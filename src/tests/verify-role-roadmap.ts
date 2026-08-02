import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyRoleRoadmap } from '../engine';
import type { RoleRoadmap } from '../engine/role-roadmap';

const path = resolve(process.argv[2] ?? './artifacts/airlock-role-roadmap-airlock-role-roadmap.001.json');
const roadmap = JSON.parse(readFileSync(path, 'utf8')) as RoleRoadmap;
const result = verifyRoleRoadmap(roadmap);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      roadmapId: result.roadmapId,
      drops: roadmap.drops.length,
      errors: result.errors,
      expectedRoadmapHash: result.expected.roadmapHash,
      actualRoadmapHash: roadmap.roadmapHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
