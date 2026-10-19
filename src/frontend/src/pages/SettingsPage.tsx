import { useEffect, useState } from 'react';
import { ColorSwatchPicker } from '../components/ColorSwatchPicker.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { currencyApi } from '../api/currency.ts';
import { useCurrencyStore } from '../store/currencyStore.ts';
import type { CurrencyDenomination } from '../types/currency.ts';
import { useGameId } from '../store/authStore.ts';


export function SettingsPage() {
  const gameId = useGameId();
  const {
    denominations, isLoading, error,
    fetchDenominations, createDenomination, updateDenomination, removeDenomination, reorderDenominations,
  } = useCurrencyStore();

  const [deleteTarget, setDeleteTarget] = useState<CurrencyDenomination | null>(null);
  const [usage, setUsage] = useState<Awaited<ReturnType<typeof currencyApi.usage>> | null>(null);

  // Check first: a coin still used in shop prices can't be deleted (the
  // server refuses too) — say exactly which items, so the DM knows where to
  // look. Coins in purses are only a warning: they're lost with it.
  async function askDelete(d: CurrencyDenomination) {
    try {
      setUsage(await currencyApi.usage(gameId, d.id));
    } catch {
      setUsage(null);
    }
    setDeleteTarget(d);
  }

  function closeDelete() {
    setDeleteTarget(null);
    setUsage(null);
  }

  useEffect(() => {
    fetchDenominations(gameId);
  }, [gameId, fetchDenominations]);

  const sorted = [...denominations].sort((a, b) => a.sortOrder - b.sortOrder);

  async function handleAdd() {
    await createDenomination(gameId, { name: 'New Currency', abbreviation: 'NEW', color: '#927355', value: 1 });
  }

  function handleFieldSave(d: CurrencyDenomination, field: 'name' | 'abbreviation' | 'color', value: string) {
    if (value === d[field]) return;
    updateDenomination(gameId, d.id, { name: d.name, abbreviation: d.abbreviation, color: d.color, value: d.value, [field]: value });
  }

  function handleColorSave(d: CurrencyDenomination, color: string) {
    if (color === d.color) return;
    updateDenomination(gameId, d.id, { name: d.name, abbreviation: d.abbreviation, color, value: d.value });
  }

  function handleValueSave(d: CurrencyDenomination, value: number) {
    if (value === d.value) return;
    updateDenomination(gameId, d.id, { name: d.name, abbreviation: d.abbreviation, color: d.color, value });
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    reorderDenominations(gameId, reordered.map((d) => d.id));
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
                <span className="row-remove" onClick={() => askDelete(d)}>✕</span>
              </div>
            );
          })}
        </div>

        <button className="btn-ghost" style={{ marginTop: 12 }} onClick={handleAdd}>+ New Currency</button>

        {!isLoading && sorted.length === 0 && <p className="hint">No currencies set up for this game yet.</p>}
      </div>

      {deleteTarget && usage && usage.shopItems.length > 0 && (
        <div className="dialog-overlay" onClick={closeDelete}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3>Can't delete "{deleteTarget.name}" yet</h3>
            <p>These shop items still have a price in {deleteTarget.abbreviation}. Change their prices in Manage → Shops first:</p>
            <ul className="usage-list">
              {usage.shopItems.map((x) => <li key={`${x.shop}/${x.item}`}><strong>{x.shop}</strong> → {x.item}</li>)}
            </ul>
            <div className="form-actions"><button onClick={closeDelete}>OK</button></div>
          </div>
        </div>
      )}

      {deleteTarget && (!usage || usage.shopItems.length === 0) && (
        <ConfirmDialog
          title="Delete this currency?"
          message={
            usage && usage.charactersHolding > 0
              ? `${usage.charactersHolding} ${usage.charactersHolding === 1 ? 'character holds' : 'characters hold'} ${usage.totalHeld} ${deleteTarget.abbreviation} in total — those coins are deleted from their purses along with "${deleteTarget.name}". This can't be undone.`
              : `This permanently deletes "${deleteTarget.name}". No shop prices or purses use it. This can't be undone.`
          }
          confirmLabel="Delete Currency"
          onConfirm={async () => {
            await removeDenomination(gameId, deleteTarget.id);
            closeDelete();
          }}
          onCancel={closeDelete}
        />
      )}
    </div>
  );
}
