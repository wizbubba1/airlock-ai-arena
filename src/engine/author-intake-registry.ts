import { digest } from './audit';
import { buildSeasonManifest } from './season';

export interface AuthorIntakeGate {
  id: string;
  threshold: string;
  sourceArtifact: string;
  status: 'preview-sample' | 'blocked-until-live-intake';
}

export interface AuthorIntakeRegistry {
  schema: 'airlock.author_intake_registry.stage1.preview.v1';
  seasonId: string;
  seasonManifestHash: string;
  policy: {
    activeAuthorTarget: 100;
    validSubmissionRequired: true;
    promptCommitRequired: true;
    duplicateIdentityReview: true;
  };
  gates: AuthorIntakeGate[];
  sampleIntake: {
    validSubmissions: number;
    invalidSubmissions: number;
    activeAuthorTarget: number;
    status: 'preview-only';
  };
  registryHash: string;
}

export function buildAuthorIntakeRegistry(seasonId = 'stage1-preview.001'): AuthorIntakeRegistry {
  const season = buildSeasonManifest(seasonId);
  const registryCore = {
    schema: 'airlock.author_intake_registry.stage1.preview.v1',
    seasonId,
    seasonManifestHash: season.manifestHash,
    policy: {
      activeAuthorTarget: 100,
      validSubmissionRequired: true,
      promptCommitRequired: true,
      duplicateIdentityReview: true,
    },
    gates: [
      {
        id: 'valid-manifest',
        threshold: 'Every accepted author packet validates against airlock.agent.manifest.v1.',
        sourceArtifact: 'airlock-agent-submission.json',
        status: 'preview-sample',
      },
      {
        id: 'prompt-commitment',
        threshold: 'Every accepted author packet includes a sha256 private prompt commitment.',
        sourceArtifact: 'airlock-prompt-reveal-policy-stage1-preview.001.json',
        status: 'preview-sample',
      },
      {
        id: 'active-author-count',
        threshold: 'At least 100 active authored agents submit valid season packets.',
        sourceArtifact: 'season intake export',
        status: 'blocked-until-live-intake',
      },
      {
        id: 'identity-review',
        threshold: 'Duplicate identity and mule clustering review complete before ladder admission.',
        sourceArtifact: 'airlock-collusion-controls-stage1-preview.001.json',
        status: 'blocked-until-live-intake',
      },
    ],
    sampleIntake: {
      validSubmissions: 1,
      invalidSubmissions: 0,
      activeAuthorTarget: 100,
      status: 'preview-only',
    },
  } satisfies Omit<AuthorIntakeRegistry, 'registryHash'>;

  return {
    ...registryCore,
    registryHash: digest(registryCore),
  };
}
