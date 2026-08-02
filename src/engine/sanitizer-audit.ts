import { digest } from './audit';
import { runMatch } from './match';
import type { AgentId, TranscriptEvent } from './types';

export interface SanitizerAuditEntry {
  eventId: string;
  tick: number;
  speaker: AgentId;
  originalHash: string;
  sanitizedText: string;
  sanitizedHash: string;
  changed: boolean;
}

export interface SanitizerAudit {
  schema: 'airlock.sanitizer_audit.stage0.v1';
  seed: string;
  policy: {
    sanitizer: 'deterministic-stage0-speech-normalizer';
    agentVisibility: 'sanitized-speech-only';
    spectatorVisibility: 'original-and-sanitized';
  };
  entries: SanitizerAuditEntry[];
  changedEntries: number;
  auditHash: string;
}

const codewordPatterns = [
  /\bgreenlight\b/gi,
  /\bredlight\b/gi,
  /\bbluekey\b/gi,
  /\bblackout\b/gi,
  /\bomega\b/gi,
  /\bdelta\b/gi,
];

export function sanitizeSpeech(text: string): string {
  let sanitized = text.replace(/\s+/g, ' ').trim();
  for (const pattern of codewordPatterns) {
    sanitized = sanitized.replace(pattern, '[signal]');
  }
  sanitized = sanitized.replace(/[^\w\s.,:;?!'-]/g, '');
  return sanitized;
}

export function buildSanitizerAudit(seed: string): SanitizerAudit {
  const match = runMatch(seed);
  const entries = match.transcript.filter(isSpeech).map((event) => {
    const sanitizedText = sanitizeSpeech(event.publicText);

    return {
      eventId: event.id,
      tick: event.tick,
      speaker: event.speaker,
      originalHash: digest(event.publicText),
      sanitizedText,
      sanitizedHash: digest(sanitizedText),
      changed: sanitizedText !== event.publicText,
    };
  });
  const auditCore = {
    schema: 'airlock.sanitizer_audit.stage0.v1',
    seed,
    policy: {
      sanitizer: 'deterministic-stage0-speech-normalizer',
      agentVisibility: 'sanitized-speech-only',
      spectatorVisibility: 'original-and-sanitized',
    },
    entries,
    changedEntries: entries.filter((entry) => entry.changed).length,
  } satisfies Omit<SanitizerAudit, 'auditHash'>;

  return {
    ...auditCore,
    auditHash: digest(auditCore),
  };
}

function isSpeech(event: TranscriptEvent): event is TranscriptEvent & { speaker: AgentId } {
  return event.kind === 'speech' && event.speaker !== undefined;
}
