import { useEffect, useState } from 'react';
import { CustomSelect } from '../components/CustomSelect.tsx';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useQuotesStore } from '../store/quotesStore.ts';
import { useSessionsStore } from '../store/sessionsStore.ts';

// Hardcoded until the Game context / login flow exists.
const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';
const NO_SESSION = '__none__';
const NO_CHARACTER = '__none__';
const ALL_QUOTES = '__all__';

export function QuotesPage() {
  const { quotes, isLoading, error, fetchQuotes, addQuote, toggleShared, setQuoteSession, setQuoteCharacter, removeQuote } =
    useQuotesStore();
  const { sessions, fetchSessions } = useSessionsStore();
  const { characters, fetchCharacters } = useCharactersStore();
  const [newText, setNewText] = useState('');
  const [newSessionId, setNewSessionId] = useState(NO_SESSION);
  const [newCharacterId, setNewCharacterId] = useState(NO_CHARACTER);
  const [filter, setFilter] = useState(ALL_QUOTES);

  useEffect(() => {
    fetchQuotes(DEMO_GAME_ID);
    fetchSessions(DEMO_GAME_ID);
    fetchCharacters(DEMO_GAME_ID);
  }, [fetchQuotes, fetchSessions, fetchCharacters]);

  const sessionOptions = [
    { value: NO_SESSION, label: 'No session' },
    ...sessions.map((s) => ({ value: s.id, label: `Session ${s.number}${s.title ? ` — ${s.title}` : ''}` })),
  ];

  const players = [...new Set(characters.map((c) => c.playerName).filter(Boolean))];

  const characterOptions = [
    { value: NO_CHARACTER, label: 'Unattributed' },
    ...players.flatMap((p) => characters.filter((c) => c.playerName === p).map((c) => ({ value: c.id, label: c.name, group: p }))),
  ];

  const filterOptions = [
    { value: ALL_QUOTES, label: 'All quotes' },
    ...players.flatMap((p) => [
      { value: `player:${p}`, label: `All from ${p}`, group: p },
      ...characters.filter((c) => c.playerName === p).map((c) => ({ value: `character:${c.id}`, label: c.name, group: p })),
    ]),
  ];

  const visibleQuotes = quotes.filter((q) => {
    if (filter === ALL_QUOTES) return true;
    if (filter.startsWith('player:')) return q.playerName === filter.slice('player:'.length);
    if (filter.startsWith('character:')) return q.characterId === filter.slice('character:'.length);
    return true;
  });

  async function handleAdd() {
    const text = newText.trim();
    if (!text) return;
    await addQuote(DEMO_GAME_ID, {
      text,
      sessionId: newSessionId === NO_SESSION ? null : newSessionId,
      characterId: newCharacterId === NO_CHARACTER ? null : newCharacterId,
    });
    setNewText('');
    setNewSessionId(NO_SESSION);
    setNewCharacterId(NO_CHARACTER);
  }

  return (
    <div className="quotes-page">
      <h2>Quotes</h2>
      <p className="hint">Memorable lines from past sessions.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className="quote-add-row">
        <input
          type="text"
          value={newText}
          placeholder="What was said?"
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <div className="quote-add-meta">
          <CustomSelect value={newCharacterId} onChange={setNewCharacterId} options={characterOptions} />
          <CustomSelect value={newSessionId} onChange={setNewSessionId} options={sessionOptions} />
          <button onClick={handleAdd}>+ Add Quote</button>
        </div>
      </div>

      <div className="field" style={{ maxWidth: 260, marginBottom: 14 }}>
        <label>Filter</label>
        <CustomSelect value={filter} onChange={setFilter} options={filterOptions} />
      </div>

      {isLoading && <p className="hint">Loading…</p>}

      <ul className="quote-list">
        {visibleQuotes.map((q) => (
          <li key={q.id} className="quote-row">
            <span className="quote-text">
              &ldquo;{q.text}&rdquo;{q.playerName && <span className="quote-attribution"> {q.playerName}</span>}
            </span>
            <span className="quote-actions">
              <div className="quote-meta-select">
                <CustomSelect
                  value={q.characterId ?? NO_CHARACTER}
                  onChange={(v) => setQuoteCharacter(DEMO_GAME_ID, q.id, v === NO_CHARACTER ? null : v)}
                  options={characterOptions}
                />
              </div>
              <div className="quote-meta-select">
                <CustomSelect
                  value={q.sessionId ?? NO_SESSION}
                  onChange={(v) => setQuoteSession(DEMO_GAME_ID, q.id, v === NO_SESSION ? null : v)}
                  options={sessionOptions}
                />
              </div>
              <button onClick={() => toggleShared(DEMO_GAME_ID, q.id)}>
                {q.isShared ? 'Shared' : 'Hidden'}
              </button>
              <button onClick={() => removeQuote(DEMO_GAME_ID, q.id)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>

      {!isLoading && visibleQuotes.length === 0 && <p className="hint">No quotes yet.</p>}
    </div>
  );
}
