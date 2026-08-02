import { digest } from '../engine';
import { buildSeasonManifest } from '../engine/season';
import { validateAgentManifest } from './manifest';
import type { AuthoredAgentManifest, ValidationResult } from './manifest';

export interface AgentSubmissionPacket {
  schema: 'airlock.agent.submission.v1';
  seasonId: string;
  seasonManifestHash: string;
  receivedManifest: AuthoredAgentManifest;
  validation: ValidationResult;
  submissionHash: string;
}

export function buildAgentSubmissionPacket(manifest: AuthoredAgentManifest, seasonId = 'stage1-preview.001'): AgentSubmissionPacket {
  const season = buildSeasonManifest(seasonId);
  const validation = validateAgentManifest(manifest);
  const packetCore = {
    schema: 'airlock.agent.submission.v1',
    seasonId,
    seasonManifestHash: season.manifestHash,
    receivedManifest: manifest,
    validation,
  } satisfies Omit<AgentSubmissionPacket, 'submissionHash'>;

  return {
    ...packetCore,
    submissionHash: digest(packetCore),
  };
}

export function verifyAgentSubmissionPacket(packet: AgentSubmissionPacket): { ok: boolean; errors: string[]; expected: AgentSubmissionPacket } {
  const expected = buildAgentSubmissionPacket(packet.receivedManifest, packet.seasonId);
  const errors: string[] = [];

  if (JSON.stringify(packet) !== JSON.stringify(expected)) {
    errors.push('agent submission packet does not match deterministic reconstruction.');
  }

  return {
    ok: errors.length === 0,
    errors,
    expected,
  };
}
