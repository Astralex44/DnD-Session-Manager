import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { NumberInput } from '../components/NumberInput.tsx';
import { monstersApi } from '../api/monsters.ts';
import { useMonstersStore } from '../store/monstersStore.ts';
import type { Monster } from '../types/monster.ts';
import { useGameId } from '../store/authStore.ts';


export function MonstersManagePage() {
  const gameId = useGameId();
  const { monsters, isLoading, error, fetchMonsters, createMonster, updateMonster, removeMonster } = useMonstersStore();

  // Inline like every other Manage page: 'new' opens the create panel under
  // the drop zone, a monster opens its edit panel inside its own card.
  const [modalTarget, setModalTarget] = useState<Monster | 'new' | null>(null);
  const [name, setName] = useState('');
  const [hp, setHp] = useState(10);
  const [file, setFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Monster | null>(null);

  useEffect(() => {
    fetchMonsters(gameId);
  }, [gameId, fetchMonsters]);

  function openAddModal() {
    setName('');
    setHp(10);
    setFile(null);
    setModalTarget('new');
  }

  function openEditModal(monster: Monster) {
    setName(monster.name);
    setHp(monster.defaultHp);
    setFile(null);
    setModalTarget(monster);
  }

  function closeModal() {
    setModalTarget(null);
  }

  async function handleSave() {
    if (!modalTarget || !name.trim()) return;
    const ok = modalTarget === 'new'
      ? file && (await createMonster(gameId, name.trim(), hp, file))
      : await updateMonster(gameId, modalTarget.id, name.trim(), hp, file);
    if (ok) closeModal();
  }

  function handleHpBlur(monster: Monster, value: number) {
    if (value === monster.defaultHp) return;
    updateMonster(gameId, monster.id, monster.name, value, null);
  }

  const monsterForm = (isNew: boolean) => (
    <div className={`map-edit-panel${isNew ? ' create-panel' : ''}`}>
      <div className="field">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Goblin Scout" />
      </div>
      <div className="field" style={{ marginTop: 10 }}>
        <label>{isNew ? 'Stat Block (PDF)' : 'Replace Stat Block (optional)'}</label>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <div className="field" style={{ marginTop: 10, maxWidth: 160 }}>
        <label>Default HP</label>
        <NumberInput min={0} value={hp} onChange={setHp} />
      </div>
      <div className="form-actions" style={{ marginTop: 12 }}>
        <button className="btn-ghost" onClick={closeModal}>Cancel</button>
        <button onClick={handleSave} disabled={!name.trim() || (isNew && !file)}>{isNew ? 'Create Monster' : 'Save'}</button>
      </div>
    </div>
  );

  return (
    <div className="monsters-page">
      <h2>Monsters</h2>
      <p className="hint">
        Templates with a PDF and a default HP value. The actual, live-changing HP of a monster in combat doesn't
        belong here — that runs separately per session on the Board.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="upload-zone" onClick={() => (modalTarget === 'new' ? closeModal() : openAddModal())}>
        <span className="glyph">☠</span>
        {modalTarget === 'new' ? 'Cancel' : 'Click to add a monster'}
      </div>
      {modalTarget === 'new' && monsterForm(true)}

      {isLoading && <p className="hint">Loading…</p>}

      <div className="card-list">
        {monsters.map((monster) => (
          <div key={monster.id} className="row-card">
            <div className="row-top">
              <div>
                <div className="row-title">{monster.name}</div>
                <div className="row-sub">{monster.originalFileName}</div>
              </div>
              <div className="hp-field">
                <label>Default HP</label>
                <input
                  type="number" min={0}
                  defaultValue={monster.defaultHp}
                  onBlur={(e) => handleHpBlur(monster, Number(e.target.value))}
                />
              </div>
              <div className="row-actions">
                <a className="icon-btn" href={monstersApi.fileUrl(monster.fileUrl)} target="_blank" rel="noreferrer">Open</a>
                <button className="icon-btn" onClick={() => (modalTarget !== 'new' && modalTarget?.id === monster.id ? closeModal() : openEditModal(monster))}>
                  {modalTarget !== 'new' && modalTarget?.id === monster.id ? 'Close' : 'Edit'}
                </button>
                <button className="icon-btn" onClick={() => setDeleteTarget(monster)}>Delete</button>
              </div>
            </div>
            {modalTarget !== 'new' && modalTarget?.id === monster.id && monsterForm(false)}
          </div>
        ))}
      </div>

      {!isLoading && monsters.length === 0 && <p className="hint">No monsters yet.</p>}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this monster?"
          message={`This permanently deletes "${deleteTarget.name}" and its stat block PDF. This can't be undone.`}
          confirmLabel="Delete Monster"
          onConfirm={async () => {
            await removeMonster(gameId, deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
