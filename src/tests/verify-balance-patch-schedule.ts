import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyBalancePatchSchedule } from '../engine';
import type { BalancePatchSchedule } from '../engine/balance-patch-schedule';

const path = resolve(process.argv[2] ?? './artifacts/airlock-balance-patch-schedule-stage1-preview.001.json');
const schedule = JSON.parse(readFileSync(path, 'utf8')) as BalancePatchSchedule;
const result = verifyBalancePatchSchedule(schedule);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seasonId: result.seasonId,
      mutations: schedule.mutations.length,
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
