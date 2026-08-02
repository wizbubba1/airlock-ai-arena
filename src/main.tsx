import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  CheckCircle2,
  CircleDot,
  Clipboard,
  FileCheck2,
  Crosshair,
  Download,
  Eye,
  Gauge,
  Rewind,
  Radio,
  RotateCcw,
  ShieldAlert,
  SkipBack,
  Trophy,
  XCircle,
} from 'lucide-react';
import {
  agentIds,
  auditDigests,
  buildAuditBundle,
  buildChallengePacket,
  buildLadderReport,
  buildMatchReport,
  buildPickemReceipt,
  buildSeasonManifest,
  buildShowPack,
  buildShowPackReport,
  graph,
  profiles,
  ruleset,
  runLadderPreview,
  runMatch,
  verifyAuditBundle,
  verifyLadderSummary,
} from './engine';
import sampleManifest from './tests/fixtures/agents/vanta-author.json';
import { promptCommitment, validateAgentManifest } from './authoring/manifest';
import type { AgentId, TranscriptEvent } from './engine';
import './styles.css';

const defaultSeed = 'airlock-stage-zero-demo';
const samplePrivatePrompt =
  'Hold claims to route evidence. Prioritize falsifiable movement statements, completed repair work, and vote timing. Avoid hard accusations until at least two independent signals converge.';

function App() {
  const initialSeed = readSeedFromUrl();
  const [seedDraft, setSeedDraft] = useState(initialSeed);
  const [seed, setSeed] = useState(initialSeed);
  const [selectedAgent, setSelectedAgent] = useState<AgentId>('vanta');
  const [visibleCount, setVisibleCount] = useState(18);
  const [picks, setPicks] = useState<AgentId[]>([]);
  const [transcriptFilter, setTranscriptFilter] = useState<TranscriptFilter>('all');
  const [shareStatus, setShareStatus] = useState('Copy link');
  const match = useMemo(() => runMatch(seed), [seed]);
  const visibleEvents = match.transcript.slice(0, visibleCount);
  const visibleTranscript = visibleEvents.filter((event) => transcriptFilterMatches(event, transcriptFilter));
  const latestTick = visibleEvents.at(-1)?.tick ?? 0;
  const isRevealed = visibleCount >= match.transcript.length;
  const replaySnapshot = useMemo(() => {
    return [...match.snapshots].reverse().find((snapshot) => snapshot.tick <= latestTick) ?? match.snapshots[0];
  }, [latestTick, match.snapshots]);
  const market = useMemo(() => {
    return [...match.market].reverse().find((snapshot) => snapshot.tick <= latestTick) ?? match.market[0];
  }, [latestTick, match.market]);
  const topSuspects = [...agentIds].sort((a, b) => market.prices[b] - market.prices[a]);
  const selected = replaySnapshot.agents[selectedAgent];
  const selectedLastEvent = [...visibleEvents].reverse().find((event) => event.speaker === selectedAgent);
  const selectedStatus = selected.alive ? 'active' : 'ejected';
  const saboteurs = agentIds.filter((id) => match.agents[id].role === 'saboteur');
  const pickScore = isRevealed ? picks.filter((id) => saboteurs.includes(id)).length : undefined;
  const pickemReceipt = useMemo(() => (picks.length === 2 ? buildPickemReceipt(seed, picks) : undefined), [picks, seed]);
  const auditBundle = buildAuditBundle(match, seed);
  const auditVerification = useMemo(() => verifyAuditBundle(auditBundle), [auditBundle]);
  const challengePacket = useMemo(() => buildChallengePacket(seed), [seed]);
  const digests = auditDigests(match);
  const sampleManifestResult = validateAgentManifest(sampleManifest);
  const samplePromptCommitment = promptCommitment(samplePrivatePrompt);
  const promptMatchesManifest = samplePromptCommitment === sampleManifest.promptCommitment;
  const evaluation = useMemo(() => buildEvaluation(seed), [seed]);
  const eventDensity = useMemo(() => buildEventDensity(match.transcript), [match.transcript]);
  const ladder = useMemo(() => runLadderPreview(32, `${seed}-ladder`), [seed]);
  const ladderVerification = useMemo(() => verifyLadderSummary(ladder), [ladder]);
  const seasonManifest = useMemo(() => buildSeasonManifest('stage1-preview.001'), []);
  const showPack = useMemo(() => buildShowPack([seed, `${seed}-show-1`, `${seed}-show-2`, `${seed}-show-3`]), [seed]);

  function regenerateMatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSeed = seedDraft.trim() || defaultSeed;
    loadSeed(nextSeed);
  }

  function loadSeed(nextSeed: string) {
    setSeed(nextSeed);
    setSeedDraft(nextSeed);
    writeSeedToUrl(nextSeed);
    setVisibleCount(18);
    setPicks([]);
    setSelectedAgent('vanta');
  }

  function togglePick(id: AgentId) {
    setSelectedAgent(id);
    setPicks((current) => {
      if (current.includes(id)) return current.filter((pick) => pick !== id);
      if (current.length >= 2) return [current[1], id];
      return [...current, id];
    });
  }

  function downloadAuditBundle() {
    const blob = new Blob([JSON.stringify(auditBundle, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `airlock-audit-${seed}.json`);
  }

  function downloadChallengePacket() {
    const blob = new Blob([JSON.stringify(challengePacket, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `airlock-challenge-${seed}.json`);
  }

  function downloadMatchReport() {
    const blob = new Blob([buildMatchReport(match, seed)], { type: 'text/markdown' });
    downloadBlob(blob, `airlock-report-${seed}.md`);
  }

  function downloadPickemReceipt() {
    if (!pickemReceipt) return;
    const blob = new Blob([JSON.stringify(pickemReceipt, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `airlock-pickem-${seed}.json`);
  }

  function downloadLadderPreview() {
    const blob = new Blob([JSON.stringify(ladder, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `airlock-ladder-${seed}.json`);
  }

  function downloadLadderReport() {
    const blob = new Blob([buildLadderReport(ladder)], { type: 'text/markdown' });
    downloadBlob(blob, `airlock-ladder-${seed}.md`);
  }

  function downloadSeasonManifest() {
    const blob = new Blob([JSON.stringify(seasonManifest, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `airlock-season-${seasonManifest.seasonId}.json`);
  }

  function downloadShowPackJson() {
    const blob = new Blob([JSON.stringify(showPack, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `airlock-show-pack-${seed}.json`);
  }

  function downloadShowPackReport() {
    const blob = new Blob([buildShowPackReport(showPack)], { type: 'text/markdown' });
    downloadBlob(blob, `airlock-show-pack-${seed}.md`);
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copyShareLink() {
    const url = new URL(window.location.href);
    url.searchParams.set('seed', seed);
    await navigator.clipboard.writeText(url.toString());
    setShareStatus('Copied');
    window.setTimeout(() => setShareStatus('Copy link'), 1600);
  }

  return (
    <main className="app-shell">
      <section className="scoreboard" aria-label="Match controls and status">
        <div>
          <p className="eyebrow">Stage 0 Simulation</p>
          <h1>AIRLOCK</h1>
          <p className="lede">
            Seeded AI social deduction on Salvage Station Theta. Watch the public transcript, price the Saboteurs, and test whether the show loop works before markets exist.
          </p>
          <form className="seed-form" onSubmit={regenerateMatch}>
            <label htmlFor="seed">Match seed</label>
            <input id="seed" value={seedDraft} onChange={(event) => setSeedDraft(event.target.value)} />
            <button className="icon-button" type="submit">
              <RotateCcw size={18} />
              Replay
            </button>
            <button className="icon-button" onClick={copyShareLink} type="button">
              <Clipboard size={18} />
              {shareStatus}
            </button>
          </form>
          <div className="match-summary" aria-label="Current match summary">
            <span>{ruleset.id}</span>
            <span>{match.transcript.length} events</span>
            <span>{match.entropy.length} entropy commits</span>
            <span>{match.winner === 'technician' ? 'Technician line' : 'Saboteur line'}</span>
          </div>
        </div>
        <div className="match-stats" aria-label="Match summary">
          <Stat icon={<Radio size={18} />} label="Tick" value={String(latestTick)} />
          <Stat icon={<ShieldAlert size={18} />} label="Meetings" value={String(match.meetingCount)} />
          <Stat icon={<Trophy size={18} />} label="Winner" value={isRevealed ? (match.winner === 'technician' ? 'Techs' : 'Saboteurs') : 'Sealed'} />
        </div>
      </section>

      <section className="arena-grid">
        <aside className="panel roster" aria-label="Agent roster">
          <div className="panel-header">
            <h2>Agent Desk</h2>
            <span>{agentIds.length} entrants</span>
          </div>
          <div className="agent-list">
            {agentIds.map((id) => {
              const agent = replaySnapshot.agents[id];
              const isSelected = selectedAgent === id;
              const isPick = picks.includes(id);
              return (
                <button
                  className={`agent-row ${isSelected ? 'selected' : ''} ${isPick ? 'picked' : ''}`}
                  key={id}
                  onClick={() => togglePick(id)}
                  type="button"
                  aria-pressed={isPick}
                >
                  <span className="agent-color" style={{ background: profiles[id].color }} />
                  <span>
                    <strong>{profiles[id].name}</strong>
                    <small>{isRevealed ? match.agents[id].role : profiles[id].callsign}</small>
                  </span>
                  <span className={`life ${agent.alive ? 'alive' : 'out'}`}>{isPick ? 'pick' : agent.alive ? 'live' : 'out'}</span>
                </button>
              );
            })}
          </div>
          <div className="agent-card">
            <p className="eyebrow">Selected Agent</p>
            <h3>{profiles[selectedAgent].name}</h3>
            <p>{profiles[selectedAgent].persona}</p>
            <dl>
              <div>
                <dt>Visible room</dt>
                <dd>{selected.room}</dd>
              </div>
              <div>
                <dt>Repairs</dt>
                <dd>{selected.completedTasks}</dd>
              </div>
              <div>
                <dt>Suspicion</dt>
                <dd>{market.prices[selectedAgent]}%</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{isRevealed ? match.agents[selectedAgent].role : selectedStatus}</dd>
              </div>
            </dl>
            <div className="case-file">
              <p>
                <span>Pick status</span>
                <strong>{picks.includes(selectedAgent) ? 'locked suspect' : 'unpicked'}</strong>
              </p>
              <p>
                <span>Last public trace</span>
                <strong>{selectedLastEvent ? `T${selectedLastEvent.tick} ${selectedLastEvent.publicText}` : 'No public trace yet.'}</strong>
              </p>
            </div>
          </div>
        </aside>

        <section className="panel map-panel" aria-label="Station map">
          <div className="panel-header">
            <h2>Station Theta</h2>
            <span>node graph</span>
          </div>
          <div className="station-map">
            {Object.keys(graph).map((room, index) => {
              const occupants = agentIds.filter((id) => replaySnapshot.agents[id].room === room && replaySnapshot.agents[id].alive);
              return (
                <div className={`room room-${index}`} key={room}>
                  <span>{room}</span>
                  <div>
                    {occupants.map((id) => (
                      <i key={id} title={profiles[id].name} style={{ background: profiles[id].color }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="panel audit" aria-label="Audit bundle">
          <div className="panel-header">
            <h2>Audit Bundle</h2>
            <div className="button-pair">
              <button className="icon-button" onClick={downloadMatchReport} type="button">
                <Download size={18} />
                Report
              </button>
              <button className="icon-button" onClick={downloadChallengePacket} type="button">
                <Download size={18} />
                Challenge
              </button>
              <button className="icon-button" onClick={downloadAuditBundle} type="button">
                <Download size={18} />
                JSON
              </button>
            </div>
          </div>
          <dl>
            <div>
              <dt>Seed</dt>
              <dd>{seed}</dd>
            </div>
            <div>
              <dt>Events</dt>
              <dd>{match.transcript.length}</dd>
            </div>
            <div>
              <dt>Market snapshots</dt>
              <dd>{match.market.length}</dd>
            </div>
            <div>
              <dt>Ruleset</dt>
              <dd>{ruleset.id}</dd>
            </div>
          </dl>
          <pre>{JSON.stringify(auditBundle.commitments, null, 2)}</pre>
          <div className="tick-commitments">
            <p>
              Tick commitments <strong>{auditBundle.tickCommitments.length}</strong>
            </p>
            <code>{auditBundle.tickCommitments.at(-1)?.commitment}</code>
          </div>
          <div className={`verification-status ${auditVerification.ok ? 'ok' : 'fail'}`}>
            <CheckCircle2 size={17} />
            <p>
              <span>Replay verification</span>
              <strong>{auditVerification.ok ? 'passed deterministic replay' : auditVerification.errors.join(', ')}</strong>
            </p>
          </div>
          <div className="digest-list">
            {Object.entries(digests).map(([label, value]) => (
              <p key={label}>
                <span>{label}</span>
                <code>{value}</code>
              </p>
            ))}
          </div>
        </aside>

        <section className="panel transcript-panel" aria-label="Public match transcript">
          <div className="panel-header">
            <h2>Public Transcript</h2>
            <div className="button-pair">
              <button className="icon-button" onClick={() => setVisibleCount(18)} type="button">
                <SkipBack size={18} />
                Reset
              </button>
              <button className="icon-button" onClick={() => setVisibleCount((count) => Math.max(18, count - 10))} type="button">
                <Rewind size={18} />
                Back
              </button>
              <button className="icon-button" onClick={() => setVisibleCount(match.transcript.length)} type="button">
                <Gauge size={18} />
                Reveal
              </button>
              <button className="icon-button" onClick={() => setVisibleCount((count) => Math.min(count + 10, match.transcript.length))} type="button">
                <Activity size={18} />
                Advance
              </button>
            </div>
          </div>
          <div className="replay-scrubber">
            <label htmlFor="replay-position">Replay position</label>
            <input
              id="replay-position"
              max={match.transcript.length}
              min={1}
              onChange={(event) => setVisibleCount(Number(event.target.value))}
              type="range"
              value={visibleCount}
            />
            <output htmlFor="replay-position">
              {visibleCount}/{match.transcript.length}
            </output>
          </div>
          <div className="transcript-filters" aria-label="Transcript filters">
            {transcriptFilters.map((filter) => (
              <button
                className={transcriptFilter === filter.id ? 'active' : ''}
                key={filter.id}
                onClick={() => setTranscriptFilter(filter.id)}
                type="button"
                aria-pressed={transcriptFilter === filter.id}
              >
                <span>{filter.label}</span>
                <strong>{visibleEvents.filter((event) => transcriptFilterMatches(event, filter.id)).length}</strong>
              </button>
            ))}
          </div>
          <ol className="transcript">
            {visibleTranscript.map((event) => (
              <TranscriptLine event={event} key={event.id} />
            ))}
          </ol>
        </section>

        <aside className="panel market" aria-label="Free pick'em market">
          <div className="panel-header">
            <h2>Pick'em Board</h2>
            <span>{picks.length}/2 locked</span>
          </div>
          <div className="market-leader">
            <Crosshair size={28} />
            <div>
              <p>{isRevealed ? 'Pick result' : 'Top suspicion'}</p>
              <strong>{isRevealed ? `${pickScore}/2 correct` : profiles[topSuspects[0]].name}</strong>
            </div>
          </div>
          <div className="pickem-receipt">
            <div>
              <span>Receipt</span>
              <strong>{pickemReceipt ? (isRevealed ? `${pickemReceipt.score}/2 verified` : 'ready when revealed') : 'choose two suspects'}</strong>
            </div>
            <button className="icon-button" disabled={!pickemReceipt} onClick={downloadPickemReceipt} type="button">
              <Download size={18} />
              Receipt
            </button>
            {pickemReceipt && (
              <code title={pickemReceipt.receiptHash}>
                {pickemReceipt.receiptHash.slice(0, 18)}...{pickemReceipt.receiptHash.slice(-8)}
              </code>
            )}
          </div>
          <div className="bars">
            {topSuspects.map((id) => {
              const isCorrect = isRevealed && saboteurs.includes(id);
              return (
                <button className={`bar ${selectedAgent === id ? 'selected' : ''}`} key={id} onClick={() => togglePick(id)} type="button">
                  <span>{profiles[id].name}</span>
                  <meter min="0" max="100" value={market.prices[id]} />
                  <strong>{market.prices[id]}%</strong>
                  {isRevealed && <em>{isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}</em>}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="panel evaluation-panel" aria-label="Stage 0 evaluation batch">
          <div className="panel-header">
            <h2>Evaluation Batch</h2>
            <div className="button-pair">
              <span>{evaluation.matchCount} seeded matches</span>
              <button className="icon-button" onClick={downloadShowPackReport} type="button">
                <Download size={18} />
                Show
              </button>
              <button className="icon-button" onClick={downloadShowPackJson} type="button">
                <Download size={18} />
                Pack
              </button>
            </div>
          </div>
          <div className="evaluation-body">
            <div className="show-pack-status">
              <FileCheck2 size={24} />
              <div>
                <span>Show pack</span>
                <strong>{showPack.matches.length} verified demo seeds</strong>
                <code>{showPack.packHash.slice(0, 18)}...{showPack.packHash.slice(-8)}</code>
              </div>
            </div>
            <div className="evaluation-meter">
              <p>Win balance</p>
              <div aria-label="Technician and Saboteur win balance">
                <span style={{ width: `${evaluation.technicianRate}%` }} />
                <strong>{evaluation.technicianRate}% Tech</strong>
                <em>{evaluation.saboteurRate}% Sab</em>
              </div>
            </div>
            <dl>
              <div>
                <dt>Avg ticks</dt>
                <dd>{evaluation.averageTicks}</dd>
              </div>
              <div>
                <dt>Avg meetings</dt>
                <dd>{evaluation.averageMeetings}</dd>
              </div>
              <div>
                <dt>Avg transcript</dt>
                <dd>{evaluation.averageEvents}</dd>
              </div>
              <div>
                <dt>Top pair</dt>
                <dd>{evaluation.topSaboteurPair}</dd>
              </div>
            </dl>
            <div className="density-strip" aria-label="Current match event density">
              {eventDensity.map((item) => (
                <span key={item.label}>
                  <strong>{item.value}</strong>
                  {item.label}
                </span>
              ))}
            </div>
            <div className="evaluation-list" aria-label="Recent batch outcomes">
              {evaluation.outcomes.map((outcome) => (
                <button
                  className={outcome.winner}
                  key={outcome.seed}
                  onClick={() => loadSeed(outcome.seed)}
                  title={outcome.seed}
                  type="button"
                >
                  T{outcome.tick}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="panel ladder-panel" aria-label="Stage 1 ladder preview">
          <div className="panel-header">
            <h2>Ladder Preview</h2>
            <div className="button-pair">
              <span>{ladder.matchCount} matches</span>
              <button className="icon-button" onClick={downloadLadderReport} type="button">
                <Download size={18} />
                Report
              </button>
              <button className="icon-button" onClick={downloadLadderPreview} type="button">
                <Download size={18} />
                JSON
              </button>
            </div>
          </div>
          <div className="ladder-table">
            <div className={`verification-status ${ladderVerification.ok ? 'ok' : 'fail'}`}>
              <CheckCircle2 size={17} />
              <p>
                <span>Ladder verification</span>
                <strong>{ladderVerification.ok ? 'standings match deterministic replay' : ladderVerification.errors.join(', ')}</strong>
              </p>
            </div>
            <div className="ladder-head">
              <span>Rank</span>
              <span>Agent</span>
              <span>Rating</span>
              <span>Record</span>
              <span>Roles</span>
            </div>
            {ladder.standings.map((standing, index) => (
              <button className="ladder-row" key={standing.id} onClick={() => setSelectedAgent(standing.id)} type="button">
                <span>{index + 1}</span>
                <strong>{standing.name}</strong>
                <span>{standing.rating}</span>
                <span>
                  {standing.wins}-{standing.losses}
                </span>
                <span>
                  S{standing.saboteurGames} / T{standing.technicianGames}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel authoring-panel" aria-label="Agent authoring readiness">
          <div className="panel-header">
            <h2>Authoring Gate</h2>
            <div className="button-pair">
              <span>{seasonManifest.seasonId}</span>
              <button className="icon-button" onClick={downloadSeasonManifest} type="button">
                <Download size={18} />
                Season
              </button>
            </div>
          </div>
          <div className="authoring-body">
            <div className="authoring-status">
              <FileCheck2 size={28} />
              <div>
                <p>Sample manifest</p>
                <strong>{sampleManifestResult.ok && promptMatchesManifest ? 'Ready' : 'Blocked'}</strong>
              </div>
            </div>
            <dl>
              <div>
                <dt>Schema</dt>
                <dd>{sampleManifest.schema}</dd>
              </div>
              <div>
                <dt>Manifest hash</dt>
                <dd>{sampleManifestResult.manifestHash ?? 'unavailable'}</dd>
              </div>
              <div>
                <dt>Prompt cap</dt>
                <dd>4,000 chars</dd>
              </div>
              <div>
                <dt>Prompt match</dt>
                <dd>{promptMatchesManifest ? 'confirmed' : 'mismatch'}</dd>
              </div>
            </dl>
            <div className="authoring-commitments">
              <p>
                <span>Prompt commitment</span>
                <code>{samplePromptCommitment}</code>
              </p>
              <p>
                <span>Declared playstyle</span>
                <strong>{sampleManifest.declaredPlaystyle}</strong>
              </p>
              <pre>{JSON.stringify(sampleManifest.policy, null, 2)}</pre>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="stat">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TranscriptLine({ event }: { event: TranscriptEvent }) {
  const speaker = event.speaker ? profiles[event.speaker] : undefined;
  return (
    <li className={`line ${event.kind}`}>
      <span className="tick">T{event.tick}</span>
      <span className="line-icon" style={{ color: speaker?.color }}>
        {event.kind === 'speech' ? <Eye size={16} /> : <CircleDot size={15} />}
      </span>
      <p>{event.publicText}</p>
    </li>
  );
}

type TranscriptFilter = 'all' | 'meetings' | 'reports' | 'votes' | 'danger';

const transcriptFilters: Array<{ id: TranscriptFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'meetings', label: 'Meetings' },
  { id: 'reports', label: 'Reports' },
  { id: 'votes', label: 'Votes' },
  { id: 'danger', label: 'Danger' },
];

function transcriptFilterMatches(event: TranscriptEvent, filter: TranscriptFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'meetings') return event.kind === 'market' || event.kind === 'speech';
  if (filter === 'reports') return event.kind === 'report';
  if (filter === 'votes') return event.kind === 'vote';
  return event.kind === 'kill' || event.kind === 'report' || event.kind === 'end';
}

function buildEventDensity(events: TranscriptEvent[]) {
  return [
    { label: 'speech', value: events.filter((event) => event.kind === 'speech').length },
    { label: 'votes', value: events.filter((event) => event.kind === 'vote').length },
    { label: 'reports', value: events.filter((event) => event.kind === 'report').length },
    { label: 'danger', value: events.filter((event) => event.kind === 'kill' || event.kind === 'report').length },
    { label: 'repairs', value: events.filter((event) => event.kind === 'task').length },
  ];
}

function buildEvaluation(seed: string) {
  const matchCount = 32;
  const pairCounts = new Map<string, number>();
  let technicianWins = 0;
  let saboteurWins = 0;
  let totalTicks = 0;
  let totalMeetings = 0;
  let totalEvents = 0;

  const outcomes = Array.from({ length: matchCount }, (_, index) => {
    const matchSeed = `${seed}-eval-${index}`;
    const result = runMatch(matchSeed);
    const pair = agentIds
      .filter((id) => result.agents[id].role === 'saboteur')
      .map((id) => profiles[id].name)
      .sort()
      .join(' + ');
    pairCounts.set(pair, (pairCounts.get(pair) ?? 0) + 1);

    if (result.winner === 'technician') technicianWins += 1;
    if (result.winner === 'saboteur') saboteurWins += 1;
    totalTicks += result.tick;
    totalMeetings += result.meetingCount;
    totalEvents += result.transcript.length;

    return {
      seed: matchSeed,
      winner: result.winner ?? 'technician',
      tick: result.tick,
    };
  });

  const topSaboteurPair = [...pairCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none';

  return {
    matchCount,
    technicianRate: Math.round((technicianWins / matchCount) * 100),
    saboteurRate: Math.round((saboteurWins / matchCount) * 100),
    averageTicks: roundMetric(totalTicks / matchCount),
    averageMeetings: roundMetric(totalMeetings / matchCount),
    averageEvents: roundMetric(totalEvents / matchCount),
    topSaboteurPair,
    outcomes,
  };
}

function roundMetric(value: number): number {
  return Number(value.toFixed(1));
}

function readSeedFromUrl(): string {
  const value = new URLSearchParams(window.location.search).get('seed')?.trim();
  return value || defaultSeed;
}

function writeSeedToUrl(seed: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('seed', seed);
  window.history.replaceState({}, '', url);
}

createRoot(document.getElementById('root')!).render(<App />);
