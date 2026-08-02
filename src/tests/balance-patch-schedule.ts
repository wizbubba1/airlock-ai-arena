import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildBalancePatchSchedule, buildBalancePatchScheduleMarkdown } from '../engine';

const seasonId = process.argv[2] ?? 'stage1-preview.001';
const jsonPath = resolve(process.argv[3] ?? `./artifacts/airlock-balance-patch-schedule-${seasonId}.json`);
const markdownPath = resolve(process.argv[4] ?? `./artifacts/airlock-balance-patch-schedule-${seasonId}.md`);
const schedule = buildBalancePatchSchedule(seasonId);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(schedule, null, 2)}\n`);
writeFileSync(markdownPath, buildBalancePatchScheduleMarkdown(schedule));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seasonId,
      mutations: schedule.mutations.length,
      scheduleHash: schedule.scheduleHash,
    },
    null,
    2,
  ),
);
