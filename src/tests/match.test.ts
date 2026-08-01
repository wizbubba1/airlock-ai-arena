import { describe, expect, it } from 'vitest';
import { agentIds, runMatch } from '../engine';

describe('AIRLOCK deterministic engine', () => {
  it('replays the same seed into the same transcript', () => {
    const first = runMatch('repeatable-match');
    const second = runMatch('repeatable-match');
    expect(second.transcript.map((event) => event.publicText)).toEqual(first.transcript.map((event) => event.publicText));
    expect(second.market).toEqual(first.market);
    expect(second.winner).toBe(first.winner);
  });

  it('ends with one winner and bounded market prices', () => {
    const match = runMatch('bounded-market');
    expect(match.phase).toBe('ended');
    expect(match.winner).toMatch(/technician|saboteur/);
    for (const snapshot of match.market) {
      for (const id of agentIds) {
        expect(snapshot.prices[id]).toBeGreaterThanOrEqual(0);
        expect(snapshot.prices[id]).toBeLessThanOrEqual(100);
      }
    }
  });

  it('keeps private roles out of public transcript until the terminal event stream', () => {
    const match = runMatch('public-info');
    const publicBody = match.transcript.map((event) => event.publicText).join(' ');
    const nonTerminal = match.transcript
      .filter((event) => event.kind !== 'end')
      .map((event) => event.publicText)
      .join(' ');
    expect(publicBody).toContain('win:');
    expect(nonTerminal.toLowerCase()).not.toContain('role: saboteur');
  });
});
