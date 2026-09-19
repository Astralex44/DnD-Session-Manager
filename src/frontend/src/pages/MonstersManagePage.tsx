import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { NumberInput } from '../components/NumberInput.tsx';
import { useMonstersStore } from '../store/monstersStore.ts';
import type { Monster } from '../types/monster.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

export function MonstersManagePage() {
  const { monsters, isLoading, error, fetchMonsters, createMonster, updateMonster, removeMonster } = useMonstersStore();

  const [modalTarget, setModalTarget] = useState<Monster | 'new' | null>(null);
  const [name, setName] = useState('');
  const [hp, setHp] = useState(10);
  const [file, setFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Monster | null>(null);

  useEffect(() => {
    fetchMonsters(DEMO_GAME_ID);
  }, [fetchMonsters]);

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
      ? file && (await createMonster(DEMO_GAME_ID, name.trim(), hp, file))
      : await updateMonster(DEMO_GAME_ID, modalTarget.id, name.trim(), hp, file);
    if (ok) closeModal();
  }

  function handleHpBlur(monster: Monster, value: number) {
    if (value === monster.defaultHp) return;
    updateMonster(DEMO_GAME_ID, monster.id, monster.name, value, null);
  }

  return (
    <div className="monsters-page">
      <h2>Monsters</h2>
      <p className="hint">
        Templates with a PDF and a default HP value. The actual, live-changing HP of a monster in combat doesn't
        belong here — that runs separately per session on the Board.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="upload-zone" onClick={openAddModal}>
        <span className="glyph">☠</span>
        Drag a PDF here, or click to create
      </div>

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
                <button className="icon-btn" onClick={() => openEditModal(monster)}>Edit</button>
                <button className="icon-btn" onClick={() => setDeleteTarget(monster)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && monsters.length === 0 && <p className="hint">No monsters yet.</p>}

      {modalTarget && (
        <div className="dialog-overlay" onClick={closeModal}>
          <div className="dialog-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalTarget === 'new' ? 'Add Monster' : 'Edit Monster'}</h3>
              <span className="modal-close" onClick={closeModal}>✕</span>
            </div>

            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Goblin Scout" />
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label>{modalTarget === 'new' ? 'Stat Block (PDF)' : 'Replace Stat Block (optional)'}</label>
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label>Default HP</label>
              <NumberInput min={0} value={hp} onChange={setHp} />
            </div>

            <div className="form-actions" style={{ marginTop: 16 }}>
              {modalTarget !== 'new' && (
                <button className="btn-danger" style={{ marginRight: 'auto' }} onClick={() => { setDeleteTarget(modalTarget); closeModal(); }}>
                  Delete Monster
                </button>
              )}
              <button className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this monster?"
          message={`This permanently deletes "${deleteTarget.name}" and its stat block PDF. This can't be undone.`}
          confirmLabel="Delete Monster"
          onConfirm={async () => {
            await removeMonster(DEMO_GAME_ID, deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
