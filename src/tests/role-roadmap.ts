import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildRoleRoadmap, buildRoleRoadmapMarkdown } from '../engine';

const roadmapId = process.argv[2] ?? 'airlock-role-roadmap.001';
const artifactDir = resolve('./artifacts');
mkdirSync(artifactDir, { recursive: true });

const roadmap = buildRoleRoadmap(roadmapId);
const jsonPath = resolve(artifactDir, `airlock-role-roadmap-${roadmapId}.json`);
const markdownPath = resolve(artifactDir, `airlock-role-roadmap-${roadmapId}.md`);

writeFileSync(jsonPath, `${JSON.stringify(roadmap, null, 2)}\n`);
writeFileSync(markdownPath, buildRoleRoadmapMarkdown(roadmap));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      roadmapId,
      drops: roadmap.drops.length,
      roadmapHash: roadmap.roadmapHash,
    },
    null,
    2,
  ),
);
