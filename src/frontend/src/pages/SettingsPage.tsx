import { useEffect, useState } from 'react';
import { ColorSwatchPicker } from '../components/ColorSwatchPicker.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { useCurrencyStore } from '../store/currencyStore.ts';
import type { CurrencyDenomination } from '../types/currency.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

export function SettingsPage() {
  const {
    denominations, isLoading, error,
    fetchDenominations, createDenomination, updateDenomination, removeDenomination, reorderDenominations,
  } = useCurrencyStore();

  const [deleteTarget, setDeleteTarget] = useState<CurrencyDenomination | null>(null);

  useEffect(() => {
    fetchDenominations(DEMO_GAME_ID);
  }, [fetchDenominations]);

  const sorted = [...denominations].sort((a, b) => a.sortOrder - b.sortOrder);

  async function handleAdd() {
    await createDenomination(DEMO_GAME_ID, { name: 'New Currency', abbreviation: 'NEW', color: '#927355', value: 1 });
  }

  function handleFieldSave(d: CurrencyDenomination, field: 'name' | 'abbreviation' | 'color', value: string) {
    if (value === d[field]) return;
    updateDenomination(DEMO_GAME_ID, d.id, { name: d.name, abbreviation: d.abbreviation, color: d.color, value: d.value, [field]: value });
  }

  function handleColorSave(d: CurrencyDenomination, color: string) {
    if (color === d.color) return;
    updateDenomination(DEMO_GAME_ID, d.id, { name: d.name, abbreviation: d.abbreviation, color, value: d.value });
  }

  function handleValueSave(d: CurrencyDenomination, value: number) {
    if (value === d.value) return;
    updateDenomination(DEMO_GAME_ID, d.id, { name: d.name, abbreviation: d.abbreviation, color: d.color, value });
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    reorderDenominations(DEMO_GAME_ID, reordered.map((d) => d.id));
  }

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <div className="settings-block">
        <h3>Currency</h3>
        <p className="hint">
          Fully configurable per game — not limited to the classic five D&amp;D coins, name/abbreviation/color/value
          are all yours to set. Changes save automatically.
        </p>
        <div className="order-banner">
          Order top (most valuable) to bottom (smallest unit). <strong>The bottom-most currency is always the base
          unit (value = 1)</strong>, every other value is relative to it — just a reference for you, nothing here
          auto-converts between denominations at purchase time.
        </div>

        {error && <div className="error-banner">{error}</div>}
        {isLoading && <p className="hint">Loading…</p>}

        <div className="currency-editor">
          {sorted.map((d, i) => {
            const isBase = i === sorted.length - 1;
            return (
              <div key={d.id} className={`currency-row${isBase ? ' base-row' : ''}`}>
                <div className="currency-move">
                  <button className="icon-btn" disabled={i === 0} onClick={() => handleMove(i, -1)}>▲</button>
                  <button className="icon-btn" disabled={isBase} onClick={() => handleMove(i, 1)}>▼</button>
                </div>
                <ColorSwatchPicker value={d.color} onChange={(color) => handleColorSave(d, color)} />
                <input
                  className="cur-name"
                  defaultValue={d.name}
                  onBlur={(e) => handleFieldSave(d, 'name', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                />
                <input
                  className="cur-code"
                  defaultValue={d.abbreviation}
                  maxLength={4}
                  onBlur={(e) => handleFieldSave(d, 'abbreviation', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                />
                {isBase ? (
                  <span className="value-locked">= 1 (Base)</span>
                ) : (
                  <>
                    <input
                      className="cur-value"
                      type="number"
                      min={1}
                      defaultValue={d.value}
                      onBlur={(e) => handleValueSave(d, Number(e.target.value))}
                      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    />
                    <span className="value-unit">{sorted[sorted.length - 1].abbreviation}</span>
                  </>
                )}
                {isBase && <span className="base-badge">Base Unit</span>}
                <span className="row-remove" onClick={() => setDeleteTarget(d)}>✕</span>
              </div>
            );
          })}
        </div>

        <button className="btn-ghost" style={{ marginTop: 12 }} onClick={handleAdd}>+ New Currency</button>

        {!isLoading && sorted.length === 0 && <p className="hint">No currencies set up for this game yet.</p>}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this currency?"
          message={`This permanently deletes "${deleteTarget.name}" — any shop prices and character wallets using it lose that denomination. This can't be undone.`}
          confirmLabel="Delete Currency"
          onConfirm={async () => {
            await removeDenomination(DEMO_GAME_ID, deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
