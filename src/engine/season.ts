import { digest } from './audit';
import { agentIds, profiles } from './content';
import { ruleset } from './ruleset';

export function buildSeasonManifest(seasonId = 'stage1-preview.001') {
  const manifest = {
    schema: 'airlock.season.manifest.v1',
    seasonId,
    status: 'preview',
    ruleset,
    modelPolicy: {
      seasonLocked: true,
      stage0Implementation: 'scripted-house-agent-policy',
      futureRequirement: 'single pinned open-weights model per season',
    },
    authoring: {
      manifestSchema: 'airlock.agent.manifest.v1',
      promptCommitmentSchema: 'airlock.private_prompt.v1',
      promptCharacterCap: 4000,
      publicFields: ['id', 'name', 'callsign', 'persona', 'color', 'declaredPlaystyle', 'promptCommitment', 'policy'],
      policyBounds: {
        aggression: [0, 1],
        diligence: [0, 1],
        suspicionThreshold: [0, 1],
        wander: [0, 1],
      },
    },
    ladder: {
      previewMatchCount: 64,
      startingRating: 1000,
      kFactor: 24,
      entrants: agentIds.map((id) => ({
        id,
        name: profiles[id].name,
        callsign: profiles[id].callsign,
      })),
    },
    auditPolicy: {
      auditBundleSchema: 'airlock.audit.stage0.v1',
      challengePacketSchema: 'airlock.challenge.stage0.v1',
      ladderSchema: 'airlock.ladder.stage1.preview.v1',
      deterministicReplayRequired: true,
      publicArtifacts: ['audit JSON', 'challenge packet JSON', 'match report Markdown', 'ladder JSON', 'ladder report Markdown'],
    },
  } as const;

  return {
    ...manifest,
    manifestHash: digest(manifest),
  };
}

export type SeasonManifest = ReturnType<typeof buildSeasonManifest>;
