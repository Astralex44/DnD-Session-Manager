import { useEffect, useMemo, useRef, useState } from 'react';
import { CustomSelect } from './CustomSelect.tsx';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useShopsStore } from '../store/shopStore.ts';
import { shareState } from '../types/shop.ts';
import type { Shop } from '../types/shop.ts';
import { useGameId } from '../store/authStore.ts';


// Read-only — a player can look at prices on a shop the DM shared with their
// character, but only the DM completes a sale (see ShopDmPanel and
// feedback_manage_vs_board_actions). "Hidden" shares stay invisible here;
// "locked" ones still show (locked just means the DM won't take more offers).
// Live via SignalR push — a share toggled by the DM appears here instantly.
interface ShopPlayerPanelProps {
  // "View as player" (DM): only this player's characters are pickable, so
  // the panel shows exactly what that player sees.
  onlyCharacterIds?: string[];
}

export function ShopPlayerPanel({ onlyCharacterIds }: ShopPlayerPanelProps) {
  const gameId = useGameId();
  const { shops, fetchShops } = useShopsStore();
  const { characters, fetchCharacters } = useCharactersStore();
  const pool = useMemo(
    () => (onlyCharacterIds ? characters.filter((c) => onlyCharacterIds.includes(c.id)) : characters),
    [characters, onlyCharacterIds],
  );

  const [characterId, setCharacterId] = useState<string | null>(null);
  const [viewingShop, setViewingShop] = useState<Shop | null>(null);

  useLiveFetch(gameId, 'shops', fetchShops);

  useEffect(() => {
    fetchCharacters(gameId);
  }, [gameId, fetchCharacters]);

  useEffect(() => {
    if (!characterId && pool.length > 0) setCharacterId(pool[0].id);
  }, [pool, characterId]);

  const characterOptions = pool.map((c) => ({ value: c.id, label: `${c.name} (${c.playerName})` }));
  const visibleShops = shops.filter((s) => {
    const share = s.shares.find((sh) => sh.characterId === characterId);
    const state = shareState(share);
    return state === 'visible' || state === 'locked';
  });

  // FA-15 — the moment a shop newly becomes shared, pop the full shop view
  // open directly (no separate small alert card step) — same effect as the
  // player clicking "Open" themselves. Closing it (✕) never touches access;
  // it's still sitting in the panel below, ready to reopen any time. If the
  // DM revokes the share while it's open, the view closes itself.
  const visibleShopIdsKey = visibleShops.map((s) => s.id).sort().join(',');
  const seenShopIdsRef = useRef<Map<string, Set<string>>>(new Map());
  const [autoOpenQueue, setAutoOpenQueue] = useState<Shop[]>([]);

  useEffect(() => {
    if (!characterId) return;
    const currentIds = new Set(visibleShops.map((s) => s.id));
    const seen = seenShopIdsRef.current.get(characterId);
    if (seen) {
      const newShops = visibleShops.filter((s) => !seen.has(s.id));
      if (newShops.length > 0) setAutoOpenQueue((q) => [...q, ...newShops]);
    }
    seenShopIdsRef.current.set(characterId, currentIds);
    setViewingShop((current) => (current && !currentIds.has(current.id) ? null : current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId, visibleShopIdsKey]);

  useEffect(() => {
    if (viewingShop === null && autoOpenQueue.length > 0) {
      setViewingShop(autoOpenQueue[0]);
      setAutoOpenQueue((q) => q.slice(1));
    }
  }, [viewingShop, autoOpenQueue]);

  function openShop(shop: Shop) {
    setViewingShop(shop);
  }

  return (
    <div className="panel">
      <div className="panel-header"><h3>Shop</h3></div>
      <div className="panel-body">
        {characterOptions.length > 1 && (
          <div className="field" style={{ marginBottom: 10 }}>
            <label>Viewing as</label>
            <CustomSelect value={characterId ?? ''} onChange={setCharacterId} options={characterOptions} />
          </div>
        )}

        {visibleShops.length === 0 && (
          <p className="hint" style={{ margin: 0 }}>No shops shared with you yet — ask the DM.</p>
        )}

        {/* Secondary access — a newly-shared shop pops open on its own (see
            the auto-open effect above); this list is just how a player
            finds it again later after closing that view. */}
        {visibleShops.map((shop) => (
          <div key={shop.id} className="init-row">
            <span className="name">{shop.name}</span>
            <button className="btn-ghost" onClick={() => openShop(shop)}>Open</button>
          </div>
        ))}
      </div>

      {viewingShop && (
        <div className="dialog-overlay" onClick={() => setViewingShop(null)}>
          <div className="dialog-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewingShop.name}</h3>
              <span className="modal-close" onClick={() => setViewingShop(null)}>✕</span>
            </div>
            {viewingShop.description && <p className="hint">{viewingShop.description}</p>}
            {viewingShop.items.map((item) => (
              <div key={item.id} className="init-row">
                <span className="name">{item.name}</span>
                <div className="price-pills">
                  {item.prices.map((p) => (
                    <span key={p.denominationId} className="coin-pill-sm">
                      <span className="coin-dot" style={{ background: p.color }} />
                      <span className="coin-amount">{p.amount}</span>
                      <span className="coin-abbr">{p.abbreviation}</span>
                    </span>
                  ))}
                </div>
                {item.saleMode === 'SharedStock' && item.stockQuantity === 0 && (
                  <span className="tag">Sold out</span>
                )}
              </div>
            ))}
            {viewingShop.items.length === 0 && <p className="hint" style={{ margin: 0 }}>Nothing for sale yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
