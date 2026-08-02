import { digest } from './audit';
import { buildB2BFeedPacket } from './b2b-feed-packet';
import { buildJurisdictionPolicy } from './jurisdiction-policy';
import { buildResponsiblePlayPolicy } from './responsible-play-policy';
import type { B2BFeedPacket } from './b2b-feed-packet';
import type { JurisdictionPolicy } from './jurisdiction-policy';
import type { ResponsiblePlayPolicy } from './responsible-play-policy';

export interface PartnerHandoffItem {
  id: string;
  status: 'ready' | 'blocked' | 'external';
  owner: 'airlock' | 'partner' | 'counsel';
  summary: string;
}

export interface PartnerHandoff {
  schema: 'airlock.partner_handoff.stage2.v1';
  seed: string;
  programId: string;
  audience: 'licensed-operator-or-media-partner';
  posture: {
    airlockRole: 'certified-content-feed-provider';
    partnerRole: 'market-operator-or-media-distributor';
    settlement: 'external-partner-only';
    directConsumerBetting: 'not-implemented';
  };
  evidence: {
    b2bFeedPacket: B2BFeedPacket;
    jurisdictionPolicy: JurisdictionPolicy;
    responsiblePlayPolicy: ResponsiblePlayPolicy;
  };
  checklist: PartnerHandoffItem[];
  handoffHash: string;
}

export function buildPartnerHandoff(
  seed = 'airlock-stage-zero-demo',
  programId = 'airlock-roadmap.001',
): PartnerHandoff {
  const b2bFeedPacket = buildB2BFeedPacket(seed, programId);
  const jurisdictionPolicy = buildJurisdictionPolicy(programId);
  const responsiblePlayPolicy = buildResponsiblePlayPolicy(programId);
  const handoffCore = {
    schema: 'airlock.partner_handoff.stage2.v1',
    seed,
    programId,
    audience: 'licensed-operator-or-media-partner',
    posture: {
      airlockRole: 'certified-content-feed-provider',
      partnerRole: 'market-operator-or-media-distributor',
      settlement: 'external-partner-only',
      directConsumerBetting: 'not-implemented',
    },
    evidence: {
      b2bFeedPacket,
      jurisdictionPolicy,
      responsiblePlayPolicy,
    },
    checklist: [
      {
        id: 'certified-feed',
        status: b2bFeedPacket.reviewChecklist.some((item) => item.id === 'certified-feed-present' && item.status === 'ready')
          ? 'ready'
          : 'blocked',
        owner: 'airlock',
        summary: `${b2bFeedPacket.evidence.certifiedFeed.events.length} public feed events are packaged with terminal-only role disclosure.`,
      },
      {
        id: 'consumer-betting',
        status: 'blocked',
        owner: 'airlock',
        summary: 'AIRLOCK does not implement direct consumer betting or settlement in the handoff.',
      },
      {
        id: 'jurisdiction-signoff',
        status: 'blocked',
        owner: 'counsel',
        summary: 'Jurisdiction, geo-fencing, and allowed-region evidence remain required before paid use.',
      },
      {
        id: 'responsible-play-controls',
        status: 'blocked',
        owner: 'partner',
        summary: 'Prize or paid modes require age gate, self-exclusion, limits, cooling-off, support, and risk-review evidence.',
      },
      {
        id: 'market-operation',
        status: 'external',
        owner: 'partner',
        summary: 'Any real-money market, pool, wallet, payout, or redemption workflow must be operated by the licensed partner.',
      },
    ],
  } satisfies Omit<PartnerHandoff, 'handoffHash'>;

  return {
    ...handoffCore,
    handoffHash: digest(handoffCore),
  };
}
