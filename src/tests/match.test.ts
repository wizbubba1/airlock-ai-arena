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
    expect(match.snapshots.length).toBeGreaterThan(1);
    expect(match.snapshots.at(-1)?.tick).toBe(match.tick);
    for (const snapshot of match.market) {
      for (const id of agentIds) {
        expect(snapshot.prices[id]).toBeGreaterThanOrEqual(0);
        expect(snapshot.prices[id]).toBeLessThanOrEqual(100);
      }
    }
  });

  it('records public replay snapshots without leaking roles', () => {
    const match = runMatch('snapshot-replay');
    const snapshotText = JSON.stringify(match.snapshots);
    expect(snapshotText).not.toContain('saboteur');
    expect(snapshotText).not.toContain('technician');
    expect(match.snapshots[0].tick).toBe(0);
    for (const snapshot of match.snapshots) {
      for (const id of agentIds) {
        expect(snapshot.agents[id].id).toBe(id);
        expect(snapshot.agents[id].completedTasks).toBeGreaterThanOrEqual(0);
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
