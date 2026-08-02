import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyRevealSchedule } from '../engine';
import type { RevealSchedule } from '../engine/reveal-schedule';

const path = resolve(process.argv[2] ?? './artifacts/airlock-reveal-schedule-airlock-stage-zero-demo.json');
const schedule = JSON.parse(readFileSync(path, 'utf8')) as RevealSchedule;
const result = verifyRevealSchedule(schedule);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      delaySeconds: schedule.policy.operatorUiDelaySeconds,
      ticks: schedule.entries.length,
      errors: result.errors,
      expectedScheduleHash: result.expected.scheduleHash,
      actualScheduleHash: schedule.scheduleHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
