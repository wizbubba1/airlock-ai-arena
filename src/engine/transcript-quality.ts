import { digest } from './audit';
import { runMatch } from './match';
import type { MatchState, TranscriptEvent } from './types';

export interface TranscriptQualityReport {
  schema: 'airlock.transcript_quality.stage0.v1';
  seed: string;
  events: {
    total: number;
    speech: number;
    votes: number;
    reports: number;
    danger: number;
    repairs: number;
    market: number;
  };
  density: {
    speechRate: number;
    meetingEventsPerMeeting: number;
    dangerRate: number;
    repairRate: number;
  };
  meetings: number;
  ticks: number;
  winner: MatchState['winner'];
  transcriptHash: string;
  qualityHash: string;
}

export function buildTranscriptQualityReport(seed: string): TranscriptQualityReport {
  const match = runMatch(seed);
  const events = {
    total: match.transcript.length,
    speech: count(match.transcript, 'speech'),
    votes: count(match.transcript, 'vote'),
    reports: count(match.transcript, 'report'),
    danger: match.transcript.filter((event) => event.kind === 'kill' || event.kind === 'report').length,
    repairs: count(match.transcript, 'task'),
    market: count(match.transcript, 'market'),
  };
  const reportCore = {
    schema: 'airlock.transcript_quality.stage0.v1',
    seed,
    events,
    density: {
      speechRate: ratio(events.speech, events.total),
      meetingEventsPerMeeting: ratio(events.speech + events.votes + events.market, match.meetingCount),
      dangerRate: ratio(events.danger, events.total),
      repairRate: ratio(events.repairs, events.total),
    },
    meetings: match.meetingCount,
    ticks: match.tick,
    winner: match.winner,
    transcriptHash: digest(match.transcript.map(({ tick, kind, speaker, publicText }) => ({ tick, kind, speaker, publicText }))),
  } satisfies Omit<TranscriptQualityReport, 'qualityHash'>;

  return {
    ...reportCore,
    qualityHash: digest(reportCore),
  };
}

function count(events: TranscriptEvent[], kind: TranscriptEvent['kind']): number {
  return events.filter((event) => event.kind === kind).length;
}

function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(3));
}
