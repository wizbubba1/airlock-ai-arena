import { digest, stableStringify } from '../engine';

export interface AuthoredAgentManifest {
  schema: 'airlock.agent.manifest.v1';
  id: string;
  name: string;
  callsign: string;
  persona: string;
  color: string;
  declaredPlaystyle: string;
  promptCommitment: string;
  policy: {
    aggression: number;
    diligence: number;
    suspicionThreshold: number;
    wander: number;
  };
}

export interface ValidationResult {
  ok: boolean;
  manifestHash?: string;
  errors: string[];
}

const idPattern = /^[a-z][a-z0-9-]{2,31}$/;
const colorPattern = /^#[0-9a-fA-F]{6}$/;
const sha256Pattern = /^sha256:[0-9a-f]{64}$/;

export function validateAgentManifest(value: unknown): ValidationResult {
  const errors: string[] = [];
  const manifest = value as Partial<AuthoredAgentManifest>;

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return { ok: false, errors: ['Manifest must be a JSON object.'] };
  }

  if (manifest.schema !== 'airlock.agent.manifest.v1') errors.push('schema must be airlock.agent.manifest.v1.');
  if (!isString(manifest.id) || !idPattern.test(manifest.id)) errors.push('id must be 3-32 chars: lowercase letters, numbers, hyphen; start with a letter.');
  if (!boundedText(manifest.name, 2, 32)) errors.push('name must be 2-32 characters.');
  if (!boundedText(manifest.callsign, 3, 48)) errors.push('callsign must be 3-48 characters.');
  if (!boundedText(manifest.persona, 24, 240)) errors.push('persona must be 24-240 characters.');
  if (!isString(manifest.color) || !colorPattern.test(manifest.color)) errors.push('color must be a #RRGGBB hex color.');
  if (!boundedText(manifest.declaredPlaystyle, 24, 320)) errors.push('declaredPlaystyle must be 24-320 characters.');
  if (!isString(manifest.promptCommitment) || !sha256Pattern.test(manifest.promptCommitment)) {
    errors.push('promptCommitment must be a sha256:<64 hex chars> commitment.');
  }

  if (!manifest.policy || typeof manifest.policy !== 'object') {
    errors.push('policy object is required.');
  } else {
    for (const key of ['aggression', 'diligence', 'suspicionThreshold', 'wander'] as const) {
      if (!boundedNumber(manifest.policy[key], 0, 1)) errors.push(`policy.${key} must be a number from 0 to 1.`);
    }
  }

  return {
    ok: errors.length === 0,
    manifestHash: errors.length === 0 ? digest(value) : undefined,
    errors,
  };
}

export function promptCommitment(prompt: string): string {
  if (prompt.length > 4000) {
    throw new Error('Prompt must be 4,000 characters or less for Stage 1 manifests.');
  }
  return digest({ schema: 'airlock.private_prompt.v1', prompt });
}

export function publicManifestHash(manifest: AuthoredAgentManifest): string {
  return digest(stableStringify(manifest));
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function boundedText(value: unknown, min: number, max: number): boolean {
  return isString(value) && value.trim().length >= min && value.trim().length <= max;
}

function boundedNumber(value: unknown, min: number, max: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}
