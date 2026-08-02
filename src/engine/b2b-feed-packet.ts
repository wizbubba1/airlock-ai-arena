import { digest } from './audit';
import { buildCertifiedEventFeed } from './event-feed';
import { buildMarketReadiness } from './market-readiness';
import { buildStageGatePolicy } from './stage-gate-policy';
import type { CertifiedEventFeed } from './event-feed';
import type { MarketReadiness } from './market-readiness';
import type { StageGatePolicy } from './stage-gate-policy';

export interface B2BFeedPacket {
  schema: 'airlock.b2b_feed_packet.stage2.v1';
  seed: string;
  programId: string;
  audience: 'licensed-operator-or-media-partner';
  commercialPosture: {
    directConsumerBetting: 'not-implemented';
    operatorRole: 'certified-content-feed-provider';
    settlementRole: 'external-licensed-partner-only';
  };
  evidence: {
    certifiedFeed: CertifiedEventFeed;
    marketReadiness: MarketReadiness;
    stageGatePolicy: StageGatePolicy;
  };
  reviewChecklist: {
    id: string;
    status: 'ready' | 'blocked';
    summary: string;
  }[];
  packetHash: string;
}

export function buildB2BFeedPacket(seed = 'airlock-stage-zero-demo', programId = 'airlock-roadmap.001'): B2BFeedPacket {
  const certifiedFeed = buildCertifiedEventFeed(seed);
  const marketReadiness = buildMarketReadiness(seed);
  const stageGatePolicy = buildStageGatePolicy(programId);
  const packetCore = {
    schema: 'airlock.b2b_feed_packet.stage2.v1',
    seed,
    programId,
    audience: 'licensed-operator-or-media-partner',
    commercialPosture: {
      directConsumerBetting: 'not-implemented',
      operatorRole: 'certified-content-feed-provider',
      settlementRole: 'external-licensed-partner-only',
    },
    evidence: {
      certifiedFeed,
      marketReadiness,
      stageGatePolicy,
    },
    reviewChecklist: [
      {
        id: 'certified-feed-present',
        status: certifiedFeed.events.length > 0 ? 'ready' : 'blocked',
        summary: `${certifiedFeed.events.length} public feed events are packaged for partner review.`,
      },
      {
        id: 'consumer-betting-disabled',
        status: marketReadiness.policy.directConsumerBetting === 'not-implemented' ? 'ready' : 'blocked',
        summary: 'AIRLOCK does not implement direct consumer betting in this packet.',
      },
      {
        id: 'licensed-operator-gate',
        status: marketReadiness.mode === 'b2b-feed-ready' ? 'ready' : 'blocked',
        summary: `Market readiness mode is ${marketReadiness.mode}; partner/legal evidence is required before real-money use.`,
      },
      {
        id: 'roadmap-gate-present',
        status: stageGatePolicy.principles.counselBeforeRealMoneyScope ? 'ready' : 'blocked',
        summary: 'Stage gate policy requires counsel before real-money market scope.',
      },
    ],
  } satisfies Omit<B2BFeedPacket, 'packetHash'>;

  return {
    ...packetCore,
    packetHash: digest(packetCore),
  };
}
