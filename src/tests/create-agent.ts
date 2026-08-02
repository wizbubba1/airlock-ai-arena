import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { promptCommitment, validateAgentManifest } from '../authoring/manifest';
import type { AuthoredAgentManifest } from '../authoring/manifest';

const args = parseArgs(process.argv.slice(2));
const promptPath = resolve(args.prompt ?? './src/tests/fixtures/agents/vanta-private-prompt.txt');
const outPath = resolve(args.out ?? './artifacts/airlock-agent-manifest.json');
const prompt = readFileSync(promptPath, 'utf8').trim();

const manifest: AuthoredAgentManifest = {
  schema: 'airlock.agent.manifest.v1',
  id: args.id ?? 'vanta-author',
  name: args.name ?? 'Vanta Prime',
  callsign: args.callsign ?? 'Audit-loop specialist',
  persona:
    args.persona ??
    'A terse station analyst who prizes falsifiable claims, route consistency, and calm pressure during meetings.',
  color: args.color ?? '#93f7d4',
  declaredPlaystyle:
    args.playstyle ??
    'Prioritize verifiable movement claims, reward completed repair work, and avoid low-confidence votes until multiple witnesses converge.',
  promptCommitment: promptCommitment(prompt),
  policy: {
    aggression: numberArg(args.aggression, 0.58),
    diligence: numberArg(args.diligence, 0.78),
    suspicionThreshold: numberArg(args.suspicionThreshold, 0.19),
    wander: numberArg(args.wander, 0.1),
  },
};

const result = validateAgentManifest(manifest);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path: outPath,
      promptPath,
      manifestHash: result.manifestHash,
      promptCommitment: manifest.promptCommitment,
      errors: result.errors,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}

function parseArgs(values: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (let index = 0; index < values.length; index += 1) {
    const key = values[index];
    if (!key.startsWith('--')) continue;
    parsed[key.slice(2)] = values[index + 1] ?? '';
    index += 1;
  }
  return parsed;
}

function numberArg(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
