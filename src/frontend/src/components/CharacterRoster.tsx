import { Link } from 'react-router-dom';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useGameId } from '../store/authStore.ts';


function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

// DM's roster panel — quick glance at everyone's HP, full edit still happens
// on the real character sheet (no reason to duplicate that here). Live via
// SignalR push — a player editing their own HP on their own Board updates
// this instantly.
interface CharacterRosterProps {
  // NFA-04: switch the Board to this player's view (BoardPage owns the state).
  onViewAs: (ownerUserId: string) => void;
}

export function CharacterRoster({ onViewAs }: CharacterRosterProps) {
  const gameId = useGameId();
  const { characters, fetchCharacters } = useCharactersStore();

  useLiveFetch(gameId, 'characters', fetchCharacters);

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Characters</h3>
      </div>
      <div className="panel-body">
        {characters.length === 0 && <p className="hint" style={{ margin: 0 }}>No characters yet.</p>}
        {characters.map((c) => (
          <div key={c.id} className="char-summary">
            <div className="char-portrait">{initials(c.name)}</div>
            <div className="char-info">
              <div className="char-name">{c.name}</div>
              <div className="char-sub">
                HP {c.hpCurrent} / {c.hpMax ?? '—'} · Level {c.level ?? '—'} {c.class}
              </div>
            </div>
            <div className="roster-actions">
              {c.ownerUserId && (
                <button className="view-as-btn" title={`See the Board exactly as ${c.ownerUsername} does`} onClick={() => onViewAs(c.ownerUserId!)}>
                  View as
                </button>
              )}
              <Link className="view-as-btn" to={`/character/${c.id}`}>Sheet</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
