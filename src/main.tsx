import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, CircleDot, Crosshair, Eye, Gauge, Radio, ShieldAlert, Trophy } from 'lucide-react';
import { agentIds, graph, profiles, runMatch } from './engine';
import type { AgentId, TranscriptEvent } from './engine';
import './styles.css';

const match = runMatch('airlock-stage-zero-demo');

function App() {
  const [selectedAgent, setSelectedAgent] = useState<AgentId>('vanta');
  const [visibleCount, setVisibleCount] = useState(18);
  const visibleTranscript = match.transcript.slice(0, visibleCount);
  const latestTick = visibleTranscript.at(-1)?.tick ?? 0;
  const market = useMemo(() => {
    return [...match.market].reverse().find((snapshot) => snapshot.tick <= latestTick) ?? match.market[0];
  }, [latestTick]);
  const topSuspects = [...agentIds].sort((a, b) => market.prices[b] - market.prices[a]);
  const selected = match.agents[selectedAgent];

  return (
    <main className="app-shell">
      <section className="scoreboard" aria-label="Match controls and status">
        <div>
          <p className="eyebrow">Stage 0 Simulation</p>
          <h1>AIRLOCK</h1>
          <p className="lede">
            Seeded AI social deduction on Salvage Station Theta. Watch the public transcript, price the Saboteurs, and test whether the show loop works before markets exist.
          </p>
        </div>
        <div className="match-stats" aria-label="Match summary">
          <Stat icon={<Radio size={18} />} label="Tick" value={String(latestTick)} />
          <Stat icon={<ShieldAlert size={18} />} label="Meetings" value={String(match.meetingCount)} />
          <Stat icon={<Trophy size={18} />} label="Winner" value={match.winner === 'technician' ? 'Techs' : 'Saboteurs'} />
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
              const agent = match.agents[id];
              const isSelected = selectedAgent === id;
              return (
                <button
                  className={`agent-row ${isSelected ? 'selected' : ''}`}
                  key={id}
                  onClick={() => setSelectedAgent(id)}
                  type="button"
                  aria-pressed={isSelected}
                >
                  <span className="agent-color" style={{ background: profiles[id].color }} />
                  <span>
                    <strong>{profiles[id].name}</strong>
                    <small>{agent.alive ? profiles[id].callsign : 'Ejected or eliminated'}</small>
                  </span>
                  <span className={`life ${agent.alive ? 'alive' : 'out'}`}>{agent.alive ? 'live' : 'out'}</span>
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
                <dt>Room</dt>
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
              const occupants = agentIds.filter((id) => match.agents[id].room === room && match.agents[id].alive);
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

        <section className="panel transcript-panel" aria-label="Public match transcript">
          <div className="panel-header">
            <h2>Public Transcript</h2>
            <button className="icon-button" onClick={() => setVisibleCount((count) => Math.min(count + 10, match.transcript.length))} type="button">
              <Activity size={18} />
              Advance
            </button>
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
            <span>free points</span>
          </div>
          <div className="market-leader">
            <Crosshair size={28} />
            <div>
              <p>Top suspicion</p>
              <strong>{profiles[topSuspects[0]].name}</strong>
            </div>
          </div>
          <div className="bars">
            {topSuspects.map((id) => (
              <button className={`bar ${selectedAgent === id ? 'selected' : ''}`} key={id} onClick={() => setSelectedAgent(id)} type="button">
                <span>{profiles[id].name}</span>
                <meter min="0" max="100" value={market.prices[id]} />
                <strong>{market.prices[id]}%</strong>
              </button>
            ))}
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

createRoot(document.getElementById('root')!).render(<App />);
