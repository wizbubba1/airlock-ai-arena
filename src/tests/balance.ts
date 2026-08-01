import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { agentIds, runMatch } from '../engine';
import type { AgentId } from '../engine';

const matchCount = Number(process.argv[2] ?? 1000);
const seedPrefix = process.argv[3] ?? 'stage-zero';
const outPath = resolve(process.argv[4] ?? `./artifacts/airlock-balance-${matchCount}.json`);
const enforce = process.argv.includes('--enforce');

const summary = {
  schema: 'airlock.balance.stage0.v1',
  matchCount,
  seedPrefix,
  wins: {
    technician: 0,
    saboteur: 0,
  },
  averages: {
    ticks: 0,
    meetings: 0,
    transcriptEvents: 0,
  },
  saboteurPairs: {} as Record<string, number>,
  terminalReasons: {} as Record<string, number>,
};

for (let index = 0; index < matchCount; index += 1) {
  const match = runMatch(`${seedPrefix}-${index}`);
  if (match.winner === 'technician') summary.wins.technician += 1;
  if (match.winner === 'saboteur') summary.wins.saboteur += 1;
  summary.averages.ticks += match.tick;
  summary.averages.meetings += match.meetingCount;
  summary.averages.transcriptEvents += match.transcript.length;

  const saboteurPair = agentIds
    .filter((id) => match.agents[id].role === 'saboteur')
    .sort()
    .join('+') as `${AgentId}+${AgentId}`;
  summary.saboteurPairs[saboteurPair] = (summary.saboteurPairs[saboteurPair] ?? 0) + 1;

  const reason = match.reason ?? 'unknown';
  summary.terminalReasons[reason] = (summary.terminalReasons[reason] ?? 0) + 1;
}

summary.averages.ticks = round(summary.averages.ticks / matchCount);
summary.averages.meetings = round(summary.averages.meetings / matchCount);
summary.averages.transcriptEvents = round(summary.averages.transcriptEvents / matchCount);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);

const guard = evaluateBalance(summary);
const ok = !enforce || guard.ok;

console.log(JSON.stringify({ ok, path: outPath, guard, ...summary }, null, 2));

if (!ok) {
  process.exitCode = 1;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

function evaluateBalance(value: typeof summary) {
  const technicianRate = value.wins.technician / value.matchCount;
  const saboteurRate = value.wins.saboteur / value.matchCount;
  const errors: string[] = [];

  if (technicianRate < 0.35 || technicianRate > 0.75) {
    errors.push(`Technician win rate ${round(technicianRate)} is outside 0.35-0.75.`);
  }
  if (saboteurRate < 0.25 || saboteurRate > 0.65) {
    errors.push(`Saboteur win rate ${round(saboteurRate)} is outside 0.25-0.65.`);
  }
  if (value.averages.ticks < 8 || value.averages.ticks > 30) {
    errors.push(`Average ticks ${value.averages.ticks} is outside 8-30.`);
  }
  if (value.averages.meetings < 2 || value.averages.meetings > 8) {
    errors.push(`Average meetings ${value.averages.meetings} is outside 2-8.`);
  }

  return {
    ok: errors.length === 0,
    technicianRate: round(technicianRate),
    saboteurRate: round(saboteurRate),
    errors,
  };
}
