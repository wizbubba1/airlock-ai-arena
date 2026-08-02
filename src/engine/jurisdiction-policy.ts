import { digest } from './audit';

export interface JurisdictionPolicyGate {
  id: 'counsel-review' | 'geo-fencing' | 'real-money' | 'sweeps-rails' | 'b2b-feed';
  status: 'blocked' | 'ready';
  summary: string;
}

export interface JurisdictionPolicy {
  schema: 'airlock.jurisdiction_policy.stage2.v1';
  programId: string;
  posture: {
    defaultGlobalRail: 'points-or-sweepstakes-only';
    realMoneyMarkets: 'blocked';
    directConsumerBetting: 'not-implemented';
    b2bFeedAllowed: 'certified-feed-review-only';
  };
  gates: JurisdictionPolicyGate[];
  requiredEvidence: string[];
  policyHash: string;
}

export function buildJurisdictionPolicy(programId = 'airlock-roadmap.001'): JurisdictionPolicy {
  const policyCore = {
    schema: 'airlock.jurisdiction_policy.stage2.v1',
    programId,
    posture: {
      defaultGlobalRail: 'points-or-sweepstakes-only',
      realMoneyMarkets: 'blocked',
      directConsumerBetting: 'not-implemented',
      b2bFeedAllowed: 'certified-feed-review-only',
    },
    gates: [
      {
        id: 'counsel-review',
        status: 'blocked',
        summary: 'No jurisdiction-specific gaming counsel memo is attached.',
      },
      {
        id: 'geo-fencing',
        status: 'blocked',
        summary: 'No production geo-fencing provider, allowed-region matrix, or audit log policy is attached.',
      },
      {
        id: 'real-money',
        status: 'blocked',
        summary: 'Retail real-money pools remain outside the implementation scope.',
      },
      {
        id: 'sweeps-rails',
        status: 'blocked',
        summary: 'Points or sweepstakes rails require counsel-approved terms before prize redemption.',
      },
      {
        id: 'b2b-feed',
        status: 'ready',
        summary: 'Certified event-feed packets may be reviewed by media or licensed-market partners.',
      },
    ],
    requiredEvidence: [
      'gaming-counsel-memo-hash',
      'allowed-region-matrix-hash',
      'geo-fencing-provider-attestation-hash',
      'responsible-play-policy-hash',
      'licensed-operator-or-sweeps-terms-hash',
    ],
  } satisfies Omit<JurisdictionPolicy, 'policyHash'>;

  return {
    ...policyCore,
    policyHash: digest(policyCore),
  };
}
