import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  agentIds,
  auditDigests,
  buildAuditBundle,
  buildChallengePacket,
  buildLadderReport,
  buildMatchReport,
  buildSeasonManifest,
  buildSeedIndex,
  buildSeedIndexReport,
  buildTickCommitments,
  canonicalSeeds,
  profiles,
  ruleset,
  runLadderPreview,
  runMatch,
  verifyAuditBundle,
  verifyLadderSummary,
} from '../engine';
import goodManifest from './fixtures/agents/vanta-author.json';
import badManifest from './fixtures/agents/bad-agent.json';
import { promptCommitment, validateAgentManifest } from '../authoring/manifest';

describe('AIRLOCK deterministic engine', () => {
  it('preserves canonical seeded regression outputs', () => {
    const cases = [
      {
        seed: 'airlock-stage-zero-demo',
        winner: 'saboteur',
        tick: 17,
        meetings: 5,
        transcriptHash: 'sha256:f9c6b80b0724833cd855b85b01aa6a38bad063384bfda3b7e9d71a4868149667',
      },
      {
        seed: 'repeatable-match',
        winner: 'technician',
        tick: 8,
        meetings: 3,
        transcriptHash: 'sha256:a44855efb64186ba23c3737360b53d349a45e4b54642082736dfd1a5f6aa379d',
      },
      {
        seed: 'entropy-ledger',
        winner: 'saboteur',
        tick: 9,
        meetings: 4,
        transcriptHash: 'sha256:e0643343fb9283ce9525b56338b2f645cc276dae0899a0fcd0cbea214b8f32e8',
      },
      {
        seed: 'ruleset-artifact',
        winner: 'technician',
        tick: 8,
        meetings: 2,
        transcriptHash: 'sha256:c2fdd7f499b1971bddb32112b2f5346f89da72791d3f14f77afe1385b1334e04',
      },
      {
        seed: 'snapshot-replay',
        winner: 'technician',
        tick: 24,
        meetings: 6,
        transcriptHash: 'sha256:bc6e61e9b640065d3e20c6b7000b9b2cf343c91d1d8e25cdbe74c3de01264d4a',
      },
    ] as const;

    for (const expected of cases) {
      const match = runMatch(expected.seed);
      const digests = auditDigests(match);
      expect(match.winner).toBe(expected.winner);
      expect(match.tick).toBe(expected.tick);
      expect(match.meetingCount).toBe(expected.meetings);
      expect(digests.transcriptHash).toBe(expected.transcriptHash);
    }
  });

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

  it('produces stable audit digests for the same seed', () => {
    const first = auditDigests(runMatch('audit-digest'));
    const second = auditDigests(runMatch('audit-digest'));
    const third = auditDigests(runMatch('audit-digest-alt'));

    expect(second).toEqual(first);
    expect(third.transcriptHash).not.toBe(first.transcriptHash);
    expect(first.rolesHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.personaHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.entropyHash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('builds stable per-tick commitments that cover every public snapshot tick', () => {
    const match = runMatch('tick-commitments');
    const first = buildTickCommitments(match);
    const second = buildTickCommitments(runMatch('tick-commitments'));
    const snapshotTicks = new Set(match.snapshots.map((snapshot) => snapshot.tick));
    const bundle = buildAuditBundle(match, 'tick-commitments');

    expect(first).toEqual(second);
    expect(first).toHaveLength(snapshotTicks.size);
    expect(bundle.commitments.tickCommitmentCount).toBe(first.length);
    for (const entry of first) {
      expect(snapshotTicks.has(entry.tick)).toBe(true);
      expect(entry.commitment).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  it('verifies an audit bundle against deterministic replay', () => {
    const bundle = buildAuditBundle(runMatch('audit-verifier'), 'audit-verifier');
    const verified = verifyAuditBundle(bundle);
    const tampered = verifyAuditBundle({
      ...bundle,
      commitments: {
        ...bundle.commitments,
        transcriptHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
      },
    });

    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('commitments does not match deterministic replay.');
  });

  it('builds a challenge packet with audit verification evidence', () => {
    const packet = buildChallengePacket('challenge-packet');

    expect(packet.schema).toBe('airlock.challenge.stage0.v1');
    expect(packet.seed).toBe('challenge-packet');
    expect(packet.verification.ok).toBe(true);
    expect(packet.verification.errors).toEqual([]);
    expect(packet.verification.actualTranscriptHash).toBe(packet.auditBundle.commitments.transcriptHash);
    expect(packet.verification.expectedTranscriptHash).toBe(packet.auditBundle.commitments.transcriptHash);
  });

  it('builds a versioned season manifest for Stage 1 previews', () => {
    const manifest = buildSeasonManifest('stage1-preview.test');

    expect(manifest.schema).toBe('airlock.season.manifest.v1');
    expect(manifest.seasonId).toBe('stage1-preview.test');
    expect(manifest.ruleset.id).toBe(ruleset.id);
    expect(manifest.ladder.entrants).toHaveLength(agentIds.length);
    expect(manifest.manifestHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(manifest.auditPolicy.deterministicReplayRequired).toBe(true);
  });

  it('runs a deterministic Stage 1 ladder preview', () => {
    const first = runLadderPreview(16, 'ladder-preview');
    const second = runLadderPreview(16, 'ladder-preview');

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.ladder.stage1.preview.v1');
    expect(first.matches).toHaveLength(16);
    expect(first.standings).toHaveLength(agentIds.length);
    expect(first.standings[0].rating).toBeGreaterThanOrEqual(first.standings.at(-1)?.rating ?? 0);
    for (const standing of first.standings) {
      expect(standing.wins + standing.losses).toBe(16);
      expect(standing.saboteurGames + standing.technicianGames).toBe(16);
    }
  });

  it('renders a markdown ladder report', () => {
    const report = buildLadderReport(runLadderPreview(8, 'ladder-report'));

    expect(report).toContain('# AIRLOCK Ladder Preview');
    expect(report).toContain('## Standings');
    expect(report).toContain('## Match Log');
    expect(report).toContain('| Rank | Agent | Rating | Record | Roles |');
  });

  it('builds a deterministic canonical seed index', () => {
    const first = buildSeedIndex();
    const second = buildSeedIndex();

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.seed_index.stage0.v1');
    expect(first.ruleset).toBe(ruleset.id);
    expect(first.seeds.map((entry) => entry.seed)).toEqual([...canonicalSeeds]);
    expect(first.seeds[0].transcriptHash).toBe('sha256:f9c6b80b0724833cd855b85b01aa6a38bad063384bfda3b7e9d71a4868149667');
    for (const entry of first.seeds) {
      expect(entry.transcriptHash).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(entry.marketHash).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(entry.snapshotHash).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(entry.entropyHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  it('renders a markdown seed index report', () => {
    const report = buildSeedIndexReport(buildSeedIndex(['airlock-stage-zero-demo', 'repeatable-match']));

    expect(report).toContain('# AIRLOCK Canonical Seed Index');
    expect(report).toContain('## Seeds');
    expect(report).toContain('## Audit Hashes');
    expect(report).toContain('| Seed | Winner | Ticks | Meetings | Events | Transcript Hash |');
  });

  it('verifies a ladder summary against deterministic replay', () => {
    const summary = runLadderPreview(8, 'ladder-verify');
    const verified = verifyLadderSummary(summary);
    const tampered = verifyLadderSummary({
      ...summary,
      standings: [
        {
          ...summary.standings[0],
          rating: summary.standings[0].rating + 1,
        },
        ...summary.standings.slice(1),
      ],
    });

    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('standings does not match deterministic replay.');
  });

  it('defines bounded house-agent policy profiles', () => {
    const voices = new Set<string>();
    for (const id of agentIds) {
      const policy = profiles[id].policy;
      expect(policy.aggression).toBeGreaterThanOrEqual(0);
      expect(policy.aggression).toBeLessThanOrEqual(1);
      expect(policy.diligence).toBeGreaterThanOrEqual(0);
      expect(policy.diligence).toBeLessThanOrEqual(1);
      expect(policy.suspicionThreshold).toBeGreaterThanOrEqual(0);
      expect(policy.suspicionThreshold).toBeLessThanOrEqual(1);
      expect(policy.wander).toBeGreaterThanOrEqual(0);
      expect(policy.wander).toBeLessThanOrEqual(1);
      voices.add(policy.voice);
    }
    expect(voices.size).toBeGreaterThanOrEqual(6);
  });

  it('exposes the versioned ruleset in audit artifacts', () => {
    const bundle = buildAuditBundle(runMatch('ruleset-artifact'), 'ruleset-artifact');
    expect(bundle.commitments.ruleset).toBe(ruleset.id);
    expect(bundle.commitments.rulesetManifest.taskCount).toBe(ruleset.taskCount);
    expect(bundle.commitments.rulesetManifest.maxTicks).toBe(ruleset.maxTicks);
  });

  it('records a deterministic entropy ledger for setup and every action tick', () => {
    const first = runMatch('entropy-ledger');
    const second = runMatch('entropy-ledger');
    const bundle = buildAuditBundle(first, 'entropy-ledger');

    expect(second.entropy).toEqual(first.entropy);
    expect(first.entropy[0].kind).toBe('setup');
    expect(first.entropy.filter((event) => event.kind === 'tick')).toHaveLength(first.tick);
    expect(bundle.entropy).toEqual(first.entropy);
    for (const event of first.entropy) {
      expect(event.label).toContain('stage0.v0.1');
      expect(event.commitment).toMatch(/^sha256:[0-9a-f]{64}$/);
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

  it('renders a markdown report with audit commitments and transcript', () => {
    const report = buildMatchReport(runMatch('markdown-report'), 'markdown-report');
    expect(report).toContain('# AIRLOCK Match Report');
    expect(report).toContain('## Commitments');
    expect(report).toContain('## Public Transcript');
    expect(report).toContain('sha256:');
  });

  it('validates authored-agent manifests for the Stage 1 ladder path', () => {
    const good = validateAgentManifest(goodManifest);
    const bad = validateAgentManifest(badManifest);
    const privatePrompt = readFileSync('src/tests/fixtures/agents/vanta-private-prompt.txt', 'utf8').trim();

    expect(good.ok).toBe(true);
    expect(good.manifestHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(goodManifest.promptCommitment).toBe(promptCommitment(privatePrompt));
    expect(bad.ok).toBe(false);
    expect(bad.errors.length).toBeGreaterThan(4);
    expect(promptCommitment('Hold claims to route evidence.')).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('generates manifest-compatible prompt commitments from private prompts', () => {
    const privatePrompt = readFileSync('src/tests/fixtures/agents/vanta-private-prompt.txt', 'utf8').trim();
    const generated = {
      ...goodManifest,
      promptCommitment: promptCommitment(privatePrompt),
    };
    const result = validateAgentManifest(generated);

    expect(result.ok).toBe(true);
    expect(generated.promptCommitment).toBe(goodManifest.promptCommitment);
  });
});
