import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  CheckCircle2,
  CircleDot,
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
import { agentIds, auditDigests, buildAuditBundle, graph, profiles, runMatch } from './engine';
import type { AgentId, TranscriptEvent } from './engine';
import './styles.css';

const defaultSeed = 'airlock-stage-zero-demo';

function App() {
  const initialSeed = readSeedFromUrl();
  const [seedDraft, setSeedDraft] = useState(initialSeed);
  const [seed, setSeed] = useState(initialSeed);
  const [selectedAgent, setSelectedAgent] = useState<AgentId>('vanta');
  const [visibleCount, setVisibleCount] = useState(18);
  const [picks, setPicks] = useState<AgentId[]>([]);
  const match = useMemo(() => runMatch(seed), [seed]);
  const visibleTranscript = match.transcript.slice(0, visibleCount);
  const latestTick = visibleTranscript.at(-1)?.tick ?? 0;
  const isRevealed = visibleCount >= match.transcript.length;
  const replaySnapshot = useMemo(() => {
    return [...match.snapshots].reverse().find((snapshot) => snapshot.tick <= latestTick) ?? match.snapshots[0];
  }, [latestTick, match.snapshots]);
  const market = useMemo(() => {
    return [...match.market].reverse().find((snapshot) => snapshot.tick <= latestTick) ?? match.market[0];
  }, [latestTick, match.market]);
  const topSuspects = [...agentIds].sort((a, b) => market.prices[b] - market.prices[a]);
  const selected = replaySnapshot.agents[selectedAgent];
  const saboteurs = agentIds.filter((id) => match.agents[id].role === 'saboteur');
  const pickScore = isRevealed ? picks.filter((id) => saboteurs.includes(id)).length : undefined;
  const auditBundle = buildAuditBundle(match, seed);
  const digests = auditDigests(match);

  function regenerateMatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSeed = seedDraft.trim() || defaultSeed;
    setSeed(nextSeed);
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
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `airlock-audit-${seed}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
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
          </form>
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
            </dl>
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
            <button className="icon-button" onClick={downloadAuditBundle} type="button">
              <Download size={18} />
              Export
            </button>
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
              <dd>stage0.v0.1</dd>
            </div>
          </dl>
          <pre>{JSON.stringify(auditBundle.commitments, null, 2)}</pre>
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
