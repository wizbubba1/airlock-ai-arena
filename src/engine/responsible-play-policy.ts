import { digest } from './audit';

export interface ResponsiblePlayControl {
  id: 'age-gate' | 'self-exclusion' | 'spend-limits' | 'cooling-off' | 'support-links' | 'risk-review';
  status: 'blocked' | 'required';
  summary: string;
}

export interface ResponsiblePlayPolicy {
  schema: 'airlock.responsible_play_policy.stage2.v1';
  programId: string;
  posture: {
    directConsumerBetting: 'not-implemented';
    realMoneyPools: 'blocked';
    defaultMode: 'free-pickem-only';
    prizeRedemption: 'blocked-until-counsel-approved';
  };
  controls: ResponsiblePlayControl[];
  evidenceRequired: string[];
  policyHash: string;
}

export function buildResponsiblePlayPolicy(programId = 'airlock-roadmap.001'): ResponsiblePlayPolicy {
  const policyCore = {
    schema: 'airlock.responsible_play_policy.stage2.v1',
    programId,
    posture: {
      directConsumerBetting: 'not-implemented',
      realMoneyPools: 'blocked',
      defaultMode: 'free-pickem-only',
      prizeRedemption: 'blocked-until-counsel-approved',
    },
    controls: [
      {
        id: 'age-gate',
        status: 'required',
        summary: 'Any prize or paid entry mode requires age screening before participation.',
      },
      {
        id: 'self-exclusion',
        status: 'required',
        summary: 'Accounts must support self-exclusion before any paid or prize-bearing mode.',
      },
      {
        id: 'spend-limits',
        status: 'required',
        summary: 'Deposit, entry, and loss limits must exist before paid market experiments.',
      },
      {
        id: 'cooling-off',
        status: 'required',
        summary: 'Users must be able to pause participation for a configured cooling-off window.',
      },
      {
        id: 'support-links',
        status: 'required',
        summary: 'Help and responsible-play resources must be visible anywhere prize rails exist.',
      },
      {
        id: 'risk-review',
        status: 'blocked',
        summary: 'No production risk review, fraud review, or jurisdiction signoff is attached.',
      },
    ],
    evidenceRequired: [
      'age-gate-provider-attestation-hash',
      'self-exclusion-policy-hash',
      'limit-configuration-hash',
      'cooling-off-policy-hash',
      'support-resource-review-hash',
      'risk-review-approval-hash',
    ],
  } satisfies Omit<ResponsiblePlayPolicy, 'policyHash'>;

  return {
    ...policyCore,
    policyHash: digest(policyCore),
  };
}
