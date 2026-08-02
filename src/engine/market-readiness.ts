import { digest } from './audit';
import { buildCertifiedEventFeed } from './event-feed';
import type { CertifiedEventFeed } from './event-feed';

export type MarketReadinessGateId =
  | 'counsel-review'
  | 'jurisdiction-policy'
  | 'licensed-operator'
  | 'responsible-play'
  | 'certified-feed';

export interface MarketReadinessGate {
  id: MarketReadinessGateId;
  status: 'pass' | 'blocked';
  summary: string;
}

export interface MarketReadinessOptions {
  counselMemoHash?: string;
  jurisdictionPolicyHash?: string;
  licensedOperatorHash?: string;
  responsiblePlayPolicyHash?: string;
}

export interface MarketReadiness {
  schema: 'airlock.market_readiness.stage2.v1';
  seed: string;
  mode: 'b2b-feed-ready' | 'real-money-blocked';
  policy: {
    defaultRail: 'points-or-sweepstakes-only';
    realMoneyMarkets: 'blocked-until-counsel-and-licensed-operator';
    directConsumerBetting: 'not-implemented';
  };
  evidence: {
    certifiedFeed: CertifiedEventFeed;
    counselMemoHash?: string;
    jurisdictionPolicyHash?: string;
    licensedOperatorHash?: string;
    responsiblePlayPolicyHash?: string;
  };
  gates: MarketReadinessGate[];
  readinessHash: string;
}

export function buildMarketReadiness(seed = 'airlock-stage-zero-demo', options: MarketReadinessOptions = {}): MarketReadiness {
  const certifiedFeed = buildCertifiedEventFeed(seed);
  const gates: MarketReadinessGate[] = [
    {
      id: 'counsel-review',
      status: options.counselMemoHash ? 'pass' : 'blocked',
      summary: options.counselMemoHash ? 'Gaming counsel memo hash supplied.' : 'No gaming counsel memo hash supplied.',
    },
    {
      id: 'jurisdiction-policy',
      status: options.jurisdictionPolicyHash ? 'pass' : 'blocked',
      summary: options.jurisdictionPolicyHash ? 'Jurisdiction policy hash supplied.' : 'No jurisdiction or geo-fencing policy hash supplied.',
    },
    {
      id: 'licensed-operator',
      status: options.licensedOperatorHash ? 'pass' : 'blocked',
      summary: options.licensedOperatorHash ? 'Licensed operator evidence hash supplied.' : 'No licensed operator or permitted-market partner hash supplied.',
    },
    {
      id: 'responsible-play',
      status: options.responsiblePlayPolicyHash ? 'pass' : 'blocked',
      summary: options.responsiblePlayPolicyHash ? 'Responsible-play policy hash supplied.' : 'No responsible-play controls hash supplied.',
    },
    {
      id: 'certified-feed',
      status: certifiedFeed.events.length > 0 && certifiedFeed.policy.consumer === 'media-or-licensed-market-partner' ? 'pass' : 'blocked',
      summary: `${certifiedFeed.events.length} public feed events are available for partner review.`,
    },
  ];
  const readinessCore = {
    schema: 'airlock.market_readiness.stage2.v1',
    seed,
    mode: gates.every((gate) => gate.status === 'pass') ? 'b2b-feed-ready' : 'real-money-blocked',
    policy: {
      defaultRail: 'points-or-sweepstakes-only',
      realMoneyMarkets: 'blocked-until-counsel-and-licensed-operator',
      directConsumerBetting: 'not-implemented',
    },
    evidence: {
      certifiedFeed,
      ...options,
    },
    gates,
  } satisfies Omit<MarketReadiness, 'readinessHash'>;

  return {
    ...readinessCore,
    readinessHash: digest(readinessCore),
  };
}
