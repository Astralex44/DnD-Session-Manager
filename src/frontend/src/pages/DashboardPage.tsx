import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useQuotesStore } from '../store/quotesStore.ts';
import { useSessionsStore } from '../store/sessionsStore.ts';
import type { Character } from '../types/character.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';
const RECENT_QUOTE_COUNT = 4;
const NOTES_PREVIEW_LENGTH = 220;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

function hpPercent(c: Character): number {
  if (!c.hpMax || c.hpMax <= 0) return 0;
  return Math.max(0, Math.min(100, (c.hpCurrent / c.hpMax) * 100));
}

// "/" per the canonical route table (routing-structure memory) — a session
// overview, per the user's own scoping ("ein Überblick über alles im
// Endeffekt... aber momentan gibt es die Game Logik noch nicht so wirklich
// also mal ein Session-Überblick"): a single-game snapshot for now. A
// cross-game landing view is explicit future work once a Game entity/switcher
// actually exists — don't build multi-game UI ahead of that.
export function DashboardPage() {
  const { characters, fetchCharacters } = useCharactersStore();
  const { sessions, fetchSessions } = useSessionsStore();
  const { quotes, fetchQuotes } = useQuotesStore();

  useEffect(() => {
    fetchCharacters(DEMO_GAME_ID);
    fetchSessions(DEMO_GAME_ID);
    fetchQuotes(DEMO_GAME_ID);
  }, [fetchCharacters, fetchSessions, fetchQuotes]);

  const latestSession = sessions.length > 0
    ? [...sessions].sort((a, b) => b.number - a.number)[0]
    : null;

  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, RECENT_QUOTE_COUNT);

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      <p className="hint">Where things stand right now — characters, the latest session, and what's been said.</p>

      <Link className="dashboard-cta" to="/board">Go to Board →</Link>

      <div className="sheet-section box">
        <h3 className="section-title">Characters</h3>
        {characters.length === 0 && <p className="hint" style={{ margin: 0 }}>No characters yet.</p>}
        <div className="dashboard-char-list">
          {characters.map((c) => (
            <Link key={c.id} className="char-summary dashboard-char-link" to={`/character/${c.id}`}>
              <div className="char-portrait">{initials(c.name)}</div>
              <div className="char-info">
                <div className="char-name">{c.name}</div>
                <div className="char-sub">Level {c.level ?? '?'} {c.class} · {c.playerName}</div>
                <div className="hp-bar-track" style={{ marginTop: 4 }}>
                  <div className={`hp-bar-fill${hpPercent(c) < 25 ? ' low' : ''}`} style={{ width: `${hpPercent(c)}%` }} />
                </div>
              </div>
              <span className={`status-badge ${c.status}`}>{c.status}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="sheet-section box">
        <h3 className="section-title">Latest Session</h3>
        {!latestSession && <p className="hint" style={{ margin: 0 }}>No sessions logged yet.</p>}
        {latestSession && (
          <>
            <div className="row-title">{latestSession.title || `Session ${latestSession.number}`}</div>
            {latestSession.scheduledAt && (
              <div className="row-sub">{new Date(latestSession.scheduledAt).toLocaleDateString()}</div>
            )}
            {latestSession.notes && (
              <p style={{ marginTop: 8 }}>
                {latestSession.notes.length > NOTES_PREVIEW_LENGTH
                  ? `${latestSession.notes.slice(0, NOTES_PREVIEW_LENGTH)}…`
                  : latestSession.notes}
              </p>
            )}
            <Link className="btn-ghost" style={{ marginTop: 10, display: 'inline-block' }} to="/manage/sessions">
              All Sessions →
            </Link>
          </>
        )}
      </div>

      <div className="sheet-section box">
        <h3 className="section-title">Recent Quotes</h3>
        {recentQuotes.length === 0 && <p className="hint" style={{ margin: 0 }}>Nothing quoted yet.</p>}
        {recentQuotes.length > 0 && (
          <ul className="quote-list">
            {recentQuotes.map((q) => (
              <li key={q.id} className="quote-row">
                <span className="quote-text">
                  &ldquo;{q.text}&rdquo;{q.playerName && <span className="quote-attribution"> {q.playerName}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link className="btn-ghost" style={{ marginTop: 10, display: 'inline-block' }} to="/manage/quotes">
          All Quotes →
        </Link>
      </div>
    </div>
  );
}
