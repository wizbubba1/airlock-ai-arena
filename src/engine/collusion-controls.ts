import { digest } from './audit';
import { agentIds } from './content';
import type { AgentId } from './types';

export interface BondTier {
  ownedAgents: number;
  bondMultiple: number;
  reviewLevel: 'standard' | 'enhanced' | 'manual';
  summary: string;
}

export interface ThrowDetectionMetric {
  id: string;
  signal: string;
  threshold: string;
  action: 'review-bond' | 'freeze-escrow' | 'forfeit-season-escrow';
}

export interface CollusionControls {
  schema: 'airlock.collusion_controls.stage1.preview.v1';
  seasonId: string;
  scope: {
    verifiedIdentityPolicy: 'one-verified-author-identity-per-league-entry';
    bettingPolicy: 'authors-blocked-from-own-match-pools';
    sanitizerPolicy: 'agents-receive-sanitized-speech-only';
    escrowPolicy: 'season-escrow-with-throw-detection-forfeit';
  };
  bondTiers: BondTier[];
  steganographyControls: {
    speechSanitizer: 'season-locked-paraphrase-pass';
    exactTokenSignals: 'dampened-before-agent-context';
    spectatorVisibility: 'original-and-sanitized-speech';
  };
  throwDetection: ThrowDetectionMetric[];
  monitoredAgents: AgentId[];
  controlsHash: string;
}

export function buildCollusionControls(seasonId = 'stage1-preview.001'): CollusionControls {
  const controlsCore = {
    schema: 'airlock.collusion_controls.stage1.preview.v1',
    seasonId,
    scope: {
      verifiedIdentityPolicy: 'one-verified-author-identity-per-league-entry',
      bettingPolicy: 'authors-blocked-from-own-match-pools',
      sanitizerPolicy: 'agents-receive-sanitized-speech-only',
      escrowPolicy: 'season-escrow-with-throw-detection-forfeit',
    },
    bondTiers: [
      {
        ownedAgents: 1,
        bondMultiple: 1,
        reviewLevel: 'standard',
        summary: 'Single entry uses the base season escrow bond.',
      },
      {
        ownedAgents: 2,
        bondMultiple: 3,
        reviewLevel: 'enhanced',
        summary: 'Second entry pays a superlinear bond and enters enhanced clustering review.',
      },
      {
        ownedAgents: 3,
        bondMultiple: 7,
        reviewLevel: 'manual',
        summary: 'Three or more entries require manual approval before league admission.',
      },
    ],
    steganographyControls: {
      speechSanitizer: 'season-locked-paraphrase-pass',
      exactTokenSignals: 'dampened-before-agent-context',
      spectatorVisibility: 'original-and-sanitized-speech',
    },
    throwDetection: [
      {
        id: 'decision-quality-divergence',
        signal: 'Agent repeatedly chooses dominated actions compared with its own public evidence state.',
        threshold: 'z-score <= -2.5 across the rolling season sample',
        action: 'freeze-escrow',
      },
      {
        id: 'counterparty-soft-play',
        signal: 'Kill avoidance, vote avoidance, or task sabotage is concentrated around a stable counterparty cluster.',
        threshold: 'pairwise correlation >= 0.82 after minimum sample size',
        action: 'review-bond',
      },
      {
        id: 'market-opposed-performance',
        signal: 'Author-linked exposure profits when the authored agent underperforms its prompt/history baseline.',
        threshold: 'two flagged matches plus negative decision-quality divergence',
        action: 'forfeit-season-escrow',
      },
    ],
    monitoredAgents: [...agentIds],
  } satisfies Omit<CollusionControls, 'controlsHash'>;

  return {
    ...controlsCore,
    controlsHash: digest(controlsCore),
  };
}
