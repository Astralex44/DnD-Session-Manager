import { useState } from 'react';
import { NumberInput } from './NumberInput.tsx';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { useInitiativeStore } from '../store/initiativeStore.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

interface InitiativePanelProps {
  editable: boolean;
}

// Live via SignalR push (see lib/realtime.ts) — the backend broadcasts
// "initiative" after every mutation, so every viewer updates the instant
// anyone else advances the turn, adds an entry, etc. A slow poll stays as a
// fallback if the push connection is ever down.
export function InitiativePanel({ editable }: InitiativePanelProps) {
  const { initiative, fetchInitiative, addEntry, removeEntry, nextTurn, clear } = useInitiativeStore();
  const [name, setName] = useState('');
  const [value, setValue] = useState(10);
  const [isMonster, setIsMonster] = useState(false);

  useLiveFetch(DEMO_GAME_ID, 'initiative', fetchInitiative);

  async function handleAdd() {
    if (!name.trim()) return;
    await addEntry(DEMO_GAME_ID, { name: name.trim(), value, isMonster });
    setName('');
    setValue(10);
    setIsMonster(false);
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Initiative</h3>
        {initiative.entries.length > 0 && <span className="tag">Combat, Round {initiative.round}</span>}
      </div>
      <div className="panel-body">
        {initiative.entries.length === 0 && <p className="hint" style={{ margin: 0 }}>No combat active.</p>}
        {initiative.entries.map((entry) => (
          <div key={entry.id} className={`init-row${entry.isActive ? ' active' : ''}`}>
            <span className={`name${entry.isMonster ? ' monster' : ''}`}>{entry.name}</span>
            <span className="val">{entry.value}</span>
            {editable && (
              <button className="row-remove" onClick={() => removeEntry(DEMO_GAME_ID, entry.id)}>✕</button>
            )}
          </div>
        ))}

        {editable && (
          <>
            <div className="initiative-add-row">
              <input
                type="text" placeholder="Name" value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="initiative-add-meta">
              <NumberInput value={value} onChange={setValue} />
              <label><input type="checkbox" checked={isMonster} onChange={(e) => setIsMonster(e.target.checked)} /> Monster</label>
            </div>
            <button className="add-btn" style={{ marginTop: 8 }} onClick={handleAdd}>+ Entry</button>
            <div className="initiative-toolbar">
              <button className="btn-ghost" onClick={() => clear(DEMO_GAME_ID)}>Clear</button>
              <button onClick={() => nextTurn(DEMO_GAME_ID)}>Next Turn</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
