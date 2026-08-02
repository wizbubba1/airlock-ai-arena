import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildRevealSchedule, buildRevealScheduleMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const delaySeconds = Number(process.argv[3] ?? 30);
const jsonPath = resolve(process.argv[4] ?? `./artifacts/airlock-reveal-schedule-${seed}.json`);
const markdownPath = resolve(process.argv[5] ?? `./artifacts/airlock-reveal-schedule-${seed}.md`);
const schedule = buildRevealSchedule(seed, delaySeconds);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(schedule, null, 2)}\n`);
writeFileSync(markdownPath, buildRevealScheduleMarkdown(schedule));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seed,
      delaySeconds,
      ticks: schedule.entries.length,
      scheduleHash: schedule.scheduleHash,
    },
    null,
    2,
  ),
);
