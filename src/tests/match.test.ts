import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  agentIds,
  auditDigests,
  buildArtifactCatalog,
  buildArtifactCatalogReport,
  buildBalancePatchSchedule,
  buildBalancePatchScheduleMarkdown,
  buildBalanceSummary,
  buildAuditBundle,
  buildChallengePacket,
  buildCertifiedEventFeed,
  buildCertifiedEventFeedMarkdown,
  buildCollusionControls,
  buildCollusionControlsMarkdown,
  buildFallbackDrill,
  buildFallbackDrillMarkdown,
  buildInferenceReceipts,
  buildInferenceReceiptsMarkdown,
  buildLadderReport,
  buildMarketReadiness,
  buildMarketReadinessMarkdown,
  buildMatchReport,
  buildOperatorReadiness,
  buildOperatorReadinessMarkdown,
  buildPickemReceipt,
  buildRevealSchedule,
  buildRevealScheduleMarkdown,
  buildSanitizerAudit,
  buildSanitizerAuditMarkdown,
  buildSeasonManifest,
  buildSeedIndex,
  buildSeedIndexReport,
  buildShowPack,
  buildShowPackReport,
  buildStage0Evaluation,
  buildStage0EvaluationMarkdown,
  buildTickCommitments,
  buildTranscriptQualityMarkdown,
  buildTranscriptQualityReport,
  canonicalSeeds,
  profiles,
  ruleset,
  runLadderPreview,
  runMatch,
  verifyAuditBundle,
  verifyBalancePatchSchedule,
  verifyBalanceSummary,
  verifyCertifiedEventFeed,
  verifyCollusionControls,
  verifyFallbackDrill,
  verifyInferenceReceipts,
  verifyLadderSummary,
  verifyMarketReadiness,
  verifyOperatorReadiness,
  verifyPickemReceipt,
  verifyRevealSchedule,
  verifySanitizerAudit,
  verifySeasonManifest,
  verifySeedIndex,
  verifyShowPack,
  verifyStage0Evaluation,
  verifyTranscriptQualityReport,
} from '../engine';
import goodManifest from './fixtures/agents/vanta-author.json';
import badManifest from './fixtures/agents/bad-agent.json';
import { promptCommitment, validateAgentManifest } from '../authoring/manifest';
import type { AuthoredAgentManifest } from '../authoring/manifest';
import { buildAgentSubmissionPacket, verifyAgentSubmissionPacket } from '../authoring/submission';

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

  it('builds and verifies a certified public event feed', () => {
    const first = buildCertifiedEventFeed('airlock-stage-zero-demo');
    const second = buildCertifiedEventFeed('airlock-stage-zero-demo');
    const markdown = buildCertifiedEventFeedMarkdown(first);
    const verified = verifyCertifiedEventFeed(first);
    const tampered = verifyCertifiedEventFeed({
      ...first,
      feedHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.certified_event_feed.stage0.v1');
    expect(first.policy.roleDisclosure).toBe('terminal-only');
    expect(first.policy.excludes).toContain('chain_of_thought');
    expect(first.events.length).toBeGreaterThan(0);
    expect(first.events[0].sequence).toBe(1);
    expect(first.events[0].eventHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.commitments.transcriptHash).toBe('sha256:f9c6b80b0724833cd855b85b01aa6a38bad063384bfda3b7e9d71a4868149667');
    expect(first.feedHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markdown).toContain('# AIRLOCK Certified Event Feed');
    expect(markdown).toContain('## Terminal');
    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('feedHash does not match deterministic replay.');
  });

  it('builds and verifies a precommitted balance patch schedule', () => {
    const first = buildBalancePatchSchedule('stage1-preview.test');
    const second = buildBalancePatchSchedule('stage1-preview.test');
    const markdown = buildBalancePatchScheduleMarkdown(first);
    const verified = verifyBalancePatchSchedule(first);
    const tampered = verifyBalancePatchSchedule({
      ...first,
      scheduleHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.balance_patch_schedule.stage1.preview.v1');
    expect(first.cadence.activationPolicy).toBe('activate-only-listed-mutations');
    expect(first.mutations.length).toBeGreaterThan(3);
    expect(first.mutations.every((mutation) => mutation.operatorDiscretion === 'none-precommitted-only')).toBe(true);
    expect(first.scheduleHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markdown).toContain('# AIRLOCK Balance Patch Schedule');
    expect(markdown).toContain('## Mutations');
    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('scheduleHash does not match deterministic replay.');
  });

  it('builds and verifies market readiness with real-money markets blocked by default', () => {
    const first = buildMarketReadiness('airlock-stage-zero-demo');
    const second = buildMarketReadiness('airlock-stage-zero-demo');
    const markdown = buildMarketReadinessMarkdown(first);
    const verified = verifyMarketReadiness(first);
    const tampered = verifyMarketReadiness({
      ...first,
      readinessHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.market_readiness.stage2.v1');
    expect(first.mode).toBe('real-money-blocked');
    expect(first.policy.directConsumerBetting).toBe('not-implemented');
    expect(first.gates.some((gate) => gate.status === 'blocked')).toBe(true);
    expect(first.evidence.certifiedFeed.events.length).toBeGreaterThan(0);
    expect(first.readinessHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markdown).toContain('# AIRLOCK Market Readiness');
    expect(markdown).toContain('## Gates');
    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('readinessHash does not match deterministic replay.');
  });

  it('builds and verifies Stage 1 collusion controls', () => {
    const first = buildCollusionControls('stage1-preview.test');
    const second = buildCollusionControls('stage1-preview.test');
    const markdown = buildCollusionControlsMarkdown(first);
    const verified = verifyCollusionControls(first);
    const tampered = verifyCollusionControls({
      ...first,
      controlsHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.collusion_controls.stage1.preview.v1');
    expect(first.scope.bettingPolicy).toBe('authors-blocked-from-own-match-pools');
    expect(first.scope.escrowPolicy).toBe('season-escrow-with-throw-detection-forfeit');
    expect(first.bondTiers).toHaveLength(3);
    expect(first.bondTiers[2].bondMultiple).toBeGreaterThan(first.bondTiers[1].bondMultiple);
    expect(first.steganographyControls.exactTokenSignals).toBe('dampened-before-agent-context');
    expect(first.throwDetection.some((metric) => metric.action === 'forfeit-season-escrow')).toBe(true);
    expect(first.monitoredAgents).toEqual(agentIds);
    expect(first.controlsHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markdown).toContain('# AIRLOCK Collusion Controls');
    expect(markdown).toContain('## Throw Detection');
    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('controlsHash does not match deterministic replay.');
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

  it('verifies season manifests against deterministic reconstruction', () => {
    const manifest = buildSeasonManifest('stage1-preview.test');
    const verified = verifySeasonManifest(manifest);
    const tampered = verifySeasonManifest({
      ...manifest,
      manifestHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('manifestHash does not match deterministic replay.');
  });

  it('builds a deterministic artifact catalog', () => {
    const first = buildArtifactCatalog();
    const second = buildArtifactCatalog();

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.artifact_catalog.v1');
    expect(first.entries.length).toBeGreaterThanOrEqual(8);
    expect(first.entries.some((entry) => entry.schema === 'airlock.audit.stage0.v1')).toBe(true);
    expect(first.entries.some((entry) => entry.verifyCommand?.includes('verify-season'))).toBe(true);
    expect(first.catalogHash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('renders a markdown artifact catalog report', () => {
    const report = buildArtifactCatalogReport(buildArtifactCatalog());

    expect(report).toContain('# AIRLOCK Artifact Catalog');
    expect(report).toContain('| Artifact | Schema | Format | Generate | Verify |');
    expect(report).toContain('## Review Use');
    expect(report).toContain('npm run verify-audit');
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

  it('verifies a seed index against deterministic replay', () => {
    const index = buildSeedIndex(['airlock-stage-zero-demo', 'repeatable-match']);
    const verified = verifySeedIndex(index);
    const tampered = verifySeedIndex({
      ...index,
      seeds: [
        {
          ...index.seeds[0],
          transcriptHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
        },
        ...index.seeds.slice(1),
      ],
    });

    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('seeds does not match deterministic replay.');
  });

  it('builds and verifies deterministic pickem receipts', () => {
    const receipt = buildPickemReceipt('airlock-stage-zero-demo', ['vanta', 'kepler']);
    const repeated = buildPickemReceipt('airlock-stage-zero-demo', ['vanta', 'kepler']);
    const verified = verifyPickemReceipt(receipt);
    const tampered = verifyPickemReceipt({
      ...receipt,
      score: receipt.score + 1,
    });

    expect(repeated).toEqual(receipt);
    expect(receipt.schema).toBe('airlock.pickem.stage0.v1');
    expect(receipt.picks).toEqual(['vanta', 'kepler']);
    expect(receipt.saboteurs).toHaveLength(2);
    expect(receipt.score).toBeGreaterThanOrEqual(0);
    expect(receipt.score).toBeLessThanOrEqual(2);
    expect(receipt.transcriptHash).toBe('sha256:f9c6b80b0724833cd855b85b01aa6a38bad063384bfda3b7e9d71a4868149667');
    expect(receipt.receiptHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(verified.ok).toBe(true);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('pickem receipt does not match deterministic replay.');
  });

  it('verifies balance summaries against deterministic replay', () => {
    const summary = buildBalanceSummary(12, 'balance-verify');
    const verified = verifyBalanceSummary(summary);
    const tampered = verifyBalanceSummary({
      ...summary,
      wins: {
        ...summary.wins,
        technician: summary.wins.technician + 1,
      },
    });

    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('wins does not match deterministic replay.');
  });

  it('builds a deterministic Stage 0 show pack', () => {
    const first = buildShowPack(['airlock-stage-zero-demo', 'repeatable-match']);
    const second = buildShowPack(['airlock-stage-zero-demo', 'repeatable-match']);

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.show_pack.stage0.v1');
    expect(first.ruleset).toBe(ruleset.id);
    expect(first.matches).toHaveLength(2);
    expect(first.matches[0].seed).toBe('airlock-stage-zero-demo');
    expect(first.matches[0].openingTranscript.length).toBeGreaterThan(0);
    expect(first.matches[0].meetingTranscript.length).toBeGreaterThan(0);
    expect(first.matches[0].saboteurs).toHaveLength(2);
    expect(first.matches[0].leadSuspects).toHaveLength(2);
    expect(first.packHash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('renders a markdown show pack report', () => {
    const report = buildShowPackReport(buildShowPack(['airlock-stage-zero-demo']));

    expect(report).toContain('# AIRLOCK Stage 0 Show Pack');
    expect(report).toContain('## Show 1:');
    expect(report).toContain('### Public Setup');
    expect(report).toContain('### First Meeting Signals');
    expect(report).toContain('### Reveal');
  });

  it('verifies a show pack against deterministic replay', () => {
    const pack = buildShowPack(['airlock-stage-zero-demo', 'repeatable-match']);
    const verified = verifyShowPack(pack);
    const tampered = verifyShowPack({
      ...pack,
      packHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('packHash does not match deterministic replay.');
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

  it('builds deterministic transcript quality reports', () => {
    const first = buildTranscriptQualityReport('airlock-stage-zero-demo');
    const second = buildTranscriptQualityReport('airlock-stage-zero-demo');
    const markdown = buildTranscriptQualityMarkdown(first);
    const verified = verifyTranscriptQualityReport(first);
    const tampered = verifyTranscriptQualityReport({
      ...first,
      qualityHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.transcript_quality.stage0.v1');
    expect(first.events.total).toBeGreaterThan(0);
    expect(first.events.speech).toBeGreaterThan(0);
    expect(first.density.speechRate).toBeGreaterThan(0);
    expect(first.transcriptHash).toBe('sha256:f9c6b80b0724833cd855b85b01aa6a38bad063384bfda3b7e9d71a4868149667');
    expect(first.qualityHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markdown).toContain('# AIRLOCK Transcript Quality');
    expect(markdown).toContain('## Event Mix');
    expect(markdown).toContain('## Density');
    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('qualityHash does not match deterministic replay.');
  });

  it('builds and verifies a Stage 0 evaluation summary', () => {
    const first = buildStage0Evaluation('airlock-stage-zero-demo', 12, 'stage0-eval');
    const second = buildStage0Evaluation('airlock-stage-zero-demo', 12, 'stage0-eval');
    const markdown = buildStage0EvaluationMarkdown(first);
    const verified = verifyStage0Evaluation(first);
    const tampered = verifyStage0Evaluation({
      ...first,
      evaluationHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.stage0_evaluation.v1');
    expect(first.gates.deterministicArtifacts).toBe(true);
    expect(first.gates.transcriptLegible).toBe(true);
    expect(first.showPack.matches.length).toBeGreaterThan(0);
    expect(first.seedIndex.seeds.length).toBeGreaterThan(0);
    expect(first.evaluationHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markdown).toContain('# AIRLOCK Stage 0 Evaluation');
    expect(markdown).toContain('## Gates');
    expect(markdown).toContain('## Artifact Coverage');
    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('evaluationHash does not match deterministic replay.');
  });

  it('builds and verifies a fixed-delay reveal schedule', () => {
    const first = buildRevealSchedule('airlock-stage-zero-demo', 30);
    const second = buildRevealSchedule('airlock-stage-zero-demo', 30);
    const markdown = buildRevealScheduleMarkdown(first);
    const verified = verifyRevealSchedule(first);
    const tampered = verifyRevealSchedule({
      ...first,
      scheduleHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.reveal_schedule.stage0.v1');
    expect(first.policy.operatorUiDelaySeconds).toBe(30);
    expect(first.policy.latencySideChannelPolicy).toBe('fixed-delay-public-render');
    expect(first.entries.length).toBeGreaterThan(0);
    expect(first.entries[0].commitPhase).toBe('commit-before-render');
    expect(first.entries[0].publicRevealSlot).toBe(first.entries[0].tick * 30);
    expect(first.scheduleHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markdown).toContain('# AIRLOCK Reveal Schedule');
    expect(markdown).toContain('## Tick Commits');
    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('scheduleHash does not match deterministic replay.');
  });

  it('builds and verifies a deterministic sanitizer audit', () => {
    const first = buildSanitizerAudit('airlock-stage-zero-demo');
    const second = buildSanitizerAudit('airlock-stage-zero-demo');
    const markdown = buildSanitizerAuditMarkdown(first);
    const verified = verifySanitizerAudit(first);
    const tampered = verifySanitizerAudit({
      ...first,
      auditHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.sanitizer_audit.stage0.v1');
    expect(first.policy.agentVisibility).toBe('sanitized-speech-only');
    expect(first.entries.length).toBeGreaterThan(0);
    expect(first.entries[0].originalHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.entries[0].sanitizedHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.auditHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markdown).toContain('# AIRLOCK Sanitizer Audit');
    expect(markdown).toContain('## Speech Entries');
    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('auditHash does not match deterministic replay.');
  });

  it('builds and verifies a deterministic fallback drill', () => {
    const first = buildFallbackDrill('airlock-stage-zero-demo', 8000);
    const second = buildFallbackDrill('airlock-stage-zero-demo', 8000);
    const markdown = buildFallbackDrillMarkdown(first);
    const verified = verifyFallbackDrill(first);
    const tampered = verifyFallbackDrill({
      ...first,
      drillHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.fallback_drill.stage0.v1');
    expect(first.policy.timeoutMs).toBe(8000);
    expect(first.policy.poolPolicy).toBe('void-affected-micro-pools');
    expect(first.entries).toHaveLength(4);
    expect(first.entries.some((entry) => entry.fallback.kind === 'meeting-speech')).toBe(true);
    expect(first.entries.some((entry) => entry.fallback.kind === 'vote')).toBe(true);
    expect(first.drillHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markdown).toContain('# AIRLOCK Fallback Drill');
    expect(markdown).toContain('## Drill Entries');
    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('drillHash does not match deterministic replay.');
  });

  it('builds and verifies deterministic inference receipts', () => {
    const first = buildInferenceReceipts('airlock-stage-zero-demo');
    const second = buildInferenceReceipts('airlock-stage-zero-demo');
    const markdown = buildInferenceReceiptsMarkdown(first);
    const verified = verifyInferenceReceipts(first);
    const tampered = verifyInferenceReceipts({
      ...first,
      receiptsHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.inference_receipts.stage0.v1');
    expect(first.policy.attestation).toBe('signed-receipt-placeholder');
    expect(first.entries.length).toBeGreaterThan(0);
    expect(first.entries[0].promptHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.entries[0].outputHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.entries[0].logprobCommitment).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.entries[0].receiptHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.entries[0].tokenCount).toBeGreaterThan(0);
    expect(first.receiptsHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markdown).toContain('# AIRLOCK Inference Receipts');
    expect(markdown).toContain('## Speech Receipts');
    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('receiptsHash does not match deterministic replay.');
  });

  it('builds and verifies operator readiness across Stage 0 evidence', () => {
    const first = buildOperatorReadiness('airlock-stage-zero-demo', 12, 'stage0-readiness');
    const second = buildOperatorReadiness('airlock-stage-zero-demo', 12, 'stage0-readiness');
    const markdown = buildOperatorReadinessMarkdown(first);
    const verified = verifyOperatorReadiness(first);
    const tampered = verifyOperatorReadiness({
      ...first,
      readinessHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(second).toEqual(first);
    expect(first.schema).toBe('airlock.operator_readiness.stage0.v1');
    expect(first.recommendation).toBe('ready-for-stage-0-review');
    expect(first.gates).toHaveLength(5);
    expect(first.gates.every((gate) => gate.status === 'pass')).toBe(true);
    expect(first.gates.map((gate) => gate.id)).toEqual([
      'attested-receipts',
      'commit-before-render',
      'speech-sanitizer',
      'timeout-fallbacks',
      'stage0-product',
    ]);
    expect(first.readinessHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(markdown).toContain('# AIRLOCK Operator Readiness');
    expect(markdown).toContain('## Evidence Bundle');
    expect(verified.ok).toBe(true);
    expect(verified.errors).toEqual([]);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('readinessHash does not match deterministic replay.');
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

  it('builds and verifies agent submission packets for Stage 1 intake', () => {
    const manifest = goodManifest as AuthoredAgentManifest;
    const packet = buildAgentSubmissionPacket(manifest, 'stage1-preview.test');
    const repeated = buildAgentSubmissionPacket(manifest, 'stage1-preview.test');
    const verified = verifyAgentSubmissionPacket(packet);
    const tampered = verifyAgentSubmissionPacket({
      ...packet,
      submissionHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(repeated).toEqual(packet);
    expect(packet.schema).toBe('airlock.agent.submission.v1');
    expect(packet.validation.ok).toBe(true);
    expect(packet.validation.manifestHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(packet.seasonManifestHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(packet.submissionHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(verified.ok).toBe(true);
    expect(tampered.ok).toBe(false);
    expect(tampered.errors).toContain('agent submission packet does not match deterministic reconstruction.');
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
