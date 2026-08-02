import { digest } from './audit';
import { buildAuditBundle } from './bundle';
import { runMatch } from './match';
import type { AgentId, TranscriptEvent } from './types';

export interface CertifiedEventFeedEntry {
  sequence: number;
  eventId: string;
  tick: number;
  kind: TranscriptEvent['kind'];
  speaker?: AgentId;
  publicText: string;
  eventHash: string;
}

export interface CertifiedEventFeed {
  schema: 'airlock.certified_event_feed.stage0.v1';
  seed: string;
  policy: {
    feedType: 'public-transcript-and-market';
    roleDisclosure: 'terminal-only';
    consumer: 'media-or-licensed-market-partner';
    excludes: Array<'private_roles_before_terminal' | 'private_prompts' | 'chain_of_thought'>;
  };
  commitments: {
    transcriptHash: string;
    marketHash: string;
    snapshotHash: string;
    entropyHash: string;
  };
  events: CertifiedEventFeedEntry[];
  terminal: {
    winner: string | undefined;
    reason: string | undefined;
    saboteurs: AgentId[];
    ticks: number;
    meetings: number;
  };
  feedHash: string;
}

export function buildCertifiedEventFeed(seed: string): CertifiedEventFeed {
  const match = runMatch(seed);
  const bundle = buildAuditBundle(match, seed);
  const events = match.transcript.map((event, index) => {
    const entryCore = {
      sequence: index + 1,
      eventId: event.id,
      tick: event.tick,
      kind: event.kind,
      speaker: event.speaker,
      publicText: event.publicText,
    };

    return {
      ...entryCore,
      eventHash: digest(entryCore),
    };
  });
  const feedCore = {
    schema: 'airlock.certified_event_feed.stage0.v1',
    seed,
    policy: {
      feedType: 'public-transcript-and-market',
      roleDisclosure: 'terminal-only',
      consumer: 'media-or-licensed-market-partner',
      excludes: ['private_roles_before_terminal', 'private_prompts', 'chain_of_thought'],
    },
    commitments: {
      transcriptHash: bundle.commitments.transcriptHash,
      marketHash: bundle.commitments.marketHash,
      snapshotHash: bundle.commitments.snapshotHash,
      entropyHash: bundle.commitments.entropyHash,
    },
    events,
    terminal: bundle.result,
  } satisfies Omit<CertifiedEventFeed, 'feedHash'>;

  return {
    ...feedCore,
    feedHash: digest(feedCore),
  };
}
