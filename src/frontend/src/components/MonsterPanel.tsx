import { useEffect, useState } from 'react';
import { CustomSelect } from './CustomSelect.tsx';
import { NumberInput } from './NumberInput.tsx';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { monstersApi } from '../api/monsters.ts';
import { useMonstersStore } from '../store/monstersStore.ts';
import { useSessionMonstersStore } from '../store/sessionMonstersStore.ts';
import type { SessionMonster } from '../types/sessionMonster.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';
const CUSTOM = '';

// DM-only, per docs/mockups' Board-Panels list (MonsterPanel isn't shown in
// the player view — same "players don't see exact monster HP" reasoning as
// the rest of the app hiding DM-only info). The live, HP-tracking copy of a
// monster in an active encounter — see Entities/SessionMonster.cs and
// monsters-books-sessions-state memory ("Monster: Vorlage getrennt von
// Live-Kampfteilnehmer"). Live via SignalR push (see lib/realtime.ts).
export function MonsterPanel() {
  const { monsters: templates, fetchMonsters } = useMonstersStore();
  const { monsters, fetchMonsters: fetchSessionMonsters, addMonster, updateHp, removeMonster, clear } = useSessionMonstersStore();

  const [templateId, setTemplateId] = useState(CUSTOM);
  const [name, setName] = useState('');
  const [hpMax, setHpMax] = useState(10);
  const [hpDrafts, setHpDrafts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchMonsters(DEMO_GAME_ID);
  }, [fetchMonsters]);

  useLiveFetch(DEMO_GAME_ID, 'monsters', fetchSessionMonsters);

  const templateOptions = [
    { value: CUSTOM, label: 'Custom monster' },
    ...templates.map((t) => ({ value: t.id, label: t.name })),
  ];

  function pickTemplate(id: string) {
    setTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (template) {
      setName(template.name);
      setHpMax(template.defaultHp);
    }
  }

  async function handleAdd() {
    if (!name.trim() && !templateId) return;
    const ok = await addMonster(DEMO_GAME_ID, {
      monsterId: templateId || undefined,
      name: name.trim() || undefined,
      hpMax,
    });
    if (ok) {
      setTemplateId(CUSTOM);
      setName('');
      setHpMax(10);
    }
  }

  function hpFor(monster: SessionMonster) {
    return hpDrafts[monster.id] ?? monster.hpCurrent;
  }

  async function handleHpBlur(monster: SessionMonster) {
    const value = hpFor(monster);
    if (value === monster.hpCurrent) return;
    await updateHp(DEMO_GAME_ID, monster.id, value);
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Monsters</h3>
        {monsters.length > 0 && <span className="tag">{monsters.length} active</span>}
      </div>
      <div className="panel-body">
        {monsters.length === 0 && <p className="hint" style={{ margin: 0 }}>No monsters in this encounter.</p>}

        {monsters.map((monster) => {
          const hpPercent = monster.hpMax > 0 ? Math.max(0, Math.min(100, (hpFor(monster) / monster.hpMax) * 100)) : 0;
          return (
            <div key={monster.id} className="monster-hp-row">
              <div className="monster-top">
                <div className="monster-name">
                  {monster.name}
                  {monster.monsterFileUrl && (
                    <a
                      href={monstersApi.fileUrl(monster.monsterFileUrl)}
                      target="_blank" rel="noreferrer"
                      style={{ marginLeft: 6, fontSize: 11, fontWeight: 'normal', color: 'var(--primary)' }}
                    >
                      stat block
                    </a>
                  )}
                </div>
                <button className="row-remove" onClick={() => removeMonster(DEMO_GAME_ID, monster.id)}>✕</button>
              </div>
              <div className="hp-bar-track"><div className={`hp-bar-fill${hpPercent < 25 ? ' low' : ''}`} style={{ width: `${hpPercent}%` }} /></div>
              <div className="hp-control">
                <NumberInput
                  className="hp-input"
                  value={hpFor(monster)}
                  onChange={(v) => setHpDrafts((d) => ({ ...d, [monster.id]: v }))}
                  onBlur={() => handleHpBlur(monster)}
                />
                <span className="hp-sep">/</span>
                <span className="hp-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{monster.hpMax}</span>
              </div>
            </div>
          );
        })}

        <div className="initiative-add-row" style={{ marginTop: monsters.length > 0 ? 12 : 0 }}>
          <CustomSelect value={templateId} onChange={pickTemplate} options={templateOptions} />
        </div>
        <div className="initiative-add-row">
          <input
            type="text" placeholder="Name" value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div className="initiative-add-meta">
          <NumberInput min={0} value={hpMax} onChange={setHpMax} />
          <span className="hint" style={{ margin: 0 }}>Max HP</span>
        </div>
        <button className="add-btn" style={{ marginTop: 8 }} onClick={handleAdd}>+ Monster</button>

        {monsters.length > 0 && (
          <div className="initiative-toolbar">
            <button className="btn-ghost" onClick={() => clear(DEMO_GAME_ID)}>Clear Encounter</button>
          </div>
        )}
      </div>
    </div>
  );
}
