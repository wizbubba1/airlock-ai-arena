import { auditDigests, digest } from './audit';
import { agentIds, profiles } from './content';
import { runMatch } from './match';
import type { AgentId } from './types';

export interface PickemReceipt {
  schema: 'airlock.pickem.stage0.v1';
  seed: string;
  picks: AgentId[];
  saboteurs: AgentId[];
  correct: AgentId[];
  score: number;
  perfect: boolean;
  transcriptHash: string;
  receiptHash: string;
}

export function buildPickemReceipt(seed: string, picks: readonly AgentId[]): PickemReceipt {
  const normalizedPicks = normalizePicks(picks);
  const match = runMatch(seed);
  const saboteurs = agentIds.filter((id) => match.agents[id].role === 'saboteur');
  const correct = normalizedPicks.filter((id) => saboteurs.includes(id));
  const transcriptHash = auditDigests(match).transcriptHash;
  const receiptCore = {
    schema: 'airlock.pickem.stage0.v1',
    seed,
    picks: normalizedPicks,
    saboteurs,
    correct,
    score: correct.length,
    perfect: correct.length === saboteurs.length && normalizedPicks.length === saboteurs.length,
    transcriptHash,
  } satisfies Omit<PickemReceipt, 'receiptHash'>;

  return {
    ...receiptCore,
    receiptHash: digest(receiptCore),
  };
}

export function verifyPickemReceipt(receipt: PickemReceipt): { ok: boolean; errors: string[]; expected: PickemReceipt } {
  const expected = buildPickemReceipt(receipt.seed, receipt.picks);
  const errors: string[] = [];

  if (JSON.stringify(receipt) !== JSON.stringify(expected)) {
    errors.push('pickem receipt does not match deterministic replay.');
  }

  return {
    ok: errors.length === 0,
    errors,
    expected,
  };
}

export function parseAgentPick(value: string): AgentId {
  if (agentIds.includes(value as AgentId)) return value as AgentId;
  const names = agentIds.map((id) => `${id} (${profiles[id].name})`).join(', ');
  throw new Error(`Unknown agent "${value}". Expected one of: ${names}`);
}

function normalizePicks(picks: readonly AgentId[]): AgentId[] {
  const unique: AgentId[] = [];
  for (const pick of picks) {
    if (!agentIds.includes(pick)) {
      throw new Error(`Unknown agent "${pick}".`);
    }
    if (!unique.includes(pick)) unique.push(pick);
  }
  if (unique.length !== 2) {
    throw new Error(`Pick'em receipts require exactly two unique picks; received ${unique.length}.`);
  }
  return unique;
}
