import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateAgentManifest } from '../authoring/manifest';

const file = resolve(process.argv[2] ?? './src/tests/fixtures/agents/vanta-author.json');
const manifest = JSON.parse(readFileSync(file, 'utf8'));
const result = validateAgentManifest(manifest);

console.log(JSON.stringify({ file, ...result }, null, 2));
process.exitCode = result.ok ? 0 : 1;
