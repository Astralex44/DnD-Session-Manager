import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCharactersStore } from '../store/charactersStore.ts';
import type { Character } from '../types/character.ts';

// Hardcoded until the Game context / login flow exists.
const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

function hpPercent(c: Character): number {
  if (!c.hpMax || c.hpMax <= 0) return 0;
  return Math.max(0, Math.min(100, (c.hpCurrent / c.hpMax) * 100));
}

export function CharacterOverviewPage() {
  const { characters, isLoading, error, fetchCharacters, setCharacterStatus } = useCharactersStore();

  useEffect(() => {
    fetchCharacters(DEMO_GAME_ID);
  }, [fetchCharacters]);

  return (
    <div className="character-overview-page">
      <h2>Characters</h2>
      <p className="hint">
        A brand-new character starts at zero: own inventory only, no map or shop shares carried over.
      </p>

      {error && <div className="error-banner">{error}</div>}
      {isLoading && <p className="hint">Loading…</p>}

      <div className="char-list">
        {characters.map((c) => (
          <div key={c.id} className={`char-card${c.status === 'dead' ? ' dead' : ''}`}>
            <div className="portrait">{initials(c.name)}</div>
            <div className="char-info">
              <div className="name-row">
                <span className="name">{c.name}</span>
                {c.locked
                  ? <span className="status-badge locked">🔒 protected</span>
                  : <span className={`status-badge ${c.status}`}>{c.status}</span>}
              </div>
              {c.locked ? (
                <div className="sub">
                  {c.playerName ? `${c.playerName} · ` : ''}Open the sheet and enter the code to see details.
                </div>
              ) : (
                <>
                  <div className="sub">
                    Level {c.level ?? '?'} {c.class} · {c.race}
                    {c.playerName ? ` · ${c.playerName}` : ''}
                  </div>
                  <div className="hp-mini">
                    <div className="hp-bar-track">
                      <div className="hp-bar-fill" style={{ width: `${hpPercent(c)}%` }} />
                    </div>
                    <span className="hp-text">
                      {c.hpCurrent} {c.hpMax != null ? `/ ${c.hpMax}` : ''} HP
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="char-actions">
              <Link className="btn-open" to={`/character/${c.id}`}>
                Open Sheet
              </Link>
              {!c.locked && c.status !== 'dead' && (
                <button
                  className="btn-set-active"
                  disabled={c.status === 'active'}
                  onClick={() => setCharacterStatus(DEMO_GAME_ID, c.id, 'active')}
                >
                  {c.status === 'active' ? 'Already Active' : 'Set Active'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Link className="new-char-card" to="/characters/new">
        <span>+ Create New Character</span>
      </Link>
    </div>
  );
}
