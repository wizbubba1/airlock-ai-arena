import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { promptCommitment } from '../authoring/manifest';

const path = resolve(process.argv[2] ?? './src/tests/fixtures/agents/vanta-private-prompt.txt');
const prompt = readFileSync(path, 'utf8').trim();

console.log(
  JSON.stringify(
    {
      ok: true,
      path,
      chars: prompt.length,
      promptCommitment: promptCommitment(prompt),
    },
    null,
    2,
  ),
);
