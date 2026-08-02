import { digest } from './audit';
import { profiles } from './content';
import { runMatch } from './match';
import { ruleset } from './ruleset';
import type { AgentId, TranscriptEvent } from './types';

export interface InferenceReceiptEntry {
  eventId: string;
  tick: number;
  speaker: AgentId;
  model: string;
  promptHash: string;
  outputHash: string;
  tokenCount: number;
  logprobCommitment: string;
  receiptHash: string;
}

export interface InferenceReceipts {
  schema: 'airlock.inference_receipts.stage0.v1';
  seed: string;
  ruleset: string;
  policy: {
    provider: 'stage0-deterministic-simulator';
    model: 'house-agent-speech-policy.v0';
    hardware: 'local-dev-reference';
    decoding: 'deterministic-greedy';
    attestation: 'signed-receipt-placeholder';
    publishedEvidence: Array<'prompt_hash' | 'output_hash' | 'token_count' | 'logprob_commitment' | 'receipt_hash'>;
  };
  entries: InferenceReceiptEntry[];
  receiptsHash: string;
}

export function buildInferenceReceipts(seed: string): InferenceReceipts {
  const match = runMatch(seed);
  const policy = {
    provider: 'stage0-deterministic-simulator',
    model: 'house-agent-speech-policy.v0',
    hardware: 'local-dev-reference',
    decoding: 'deterministic-greedy',
    attestation: 'signed-receipt-placeholder',
    publishedEvidence: ['prompt_hash', 'output_hash', 'token_count', 'logprob_commitment', 'receipt_hash'],
  } satisfies InferenceReceipts['policy'];

  const entries = match.transcript.filter(isSpeech).map((event) => {
    const promptHash = digest({
      seed,
      tick: event.tick,
      speaker: event.speaker,
      persona: profiles[event.speaker].persona,
      publicContextHash: digest(match.transcript.filter((prior) => prior.tick <= event.tick && prior.id < event.id).map(publicContextEvent)),
    });
    const outputHash = digest(event.publicText);
    const tokenCount = countTokens(event.publicText);
    const logprobCommitment = digest({
      eventId: event.id,
      tokenCount,
      outputHash,
      model: policy.model,
      note: 'Stage 0 simulator publishes commitments only; production swaps this for signed token logprobs.',
    });
    const receiptCore = {
      eventId: event.id,
      tick: event.tick,
      speaker: event.speaker,
      model: policy.model,
      promptHash,
      outputHash,
      tokenCount,
      logprobCommitment,
    };

    return {
      ...receiptCore,
      receiptHash: digest(receiptCore),
    };
  });

  const receiptsCore = {
    schema: 'airlock.inference_receipts.stage0.v1',
    seed,
    ruleset: ruleset.id,
    policy,
    entries,
  } satisfies Omit<InferenceReceipts, 'receiptsHash'>;

  return {
    ...receiptsCore,
    receiptsHash: digest(receiptsCore),
  };
}

function isSpeech(event: TranscriptEvent): event is TranscriptEvent & { speaker: AgentId } {
  return event.kind === 'speech' && event.speaker !== undefined;
}

function publicContextEvent(event: TranscriptEvent) {
  return {
    id: event.id,
    tick: event.tick,
    phase: event.phase,
    speaker: event.speaker,
    kind: event.kind,
    publicText: event.publicText,
  };
}

function countTokens(text: string): number {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  return tokens.length;
}
