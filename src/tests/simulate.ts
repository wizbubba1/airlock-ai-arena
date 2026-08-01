import { runMatch } from '../engine';

const matchCount = Number(process.argv[2] ?? 100);
const results = {
  technician: 0,
  saboteur: 0,
  averageTicks: 0,
  averageMeetings: 0,
};

for (let index = 0; index < matchCount; index += 1) {
  const match = runMatch(`stage-zero-${index}`);
  if (match.winner === 'technician') results.technician += 1;
  if (match.winner === 'saboteur') results.saboteur += 1;
  results.averageTicks += match.tick;
  results.averageMeetings += match.meetingCount;
}

results.averageTicks = Number((results.averageTicks / matchCount).toFixed(2));
results.averageMeetings = Number((results.averageMeetings / matchCount).toFixed(2));

console.log(JSON.stringify({ matchCount, ...results }, null, 2));
