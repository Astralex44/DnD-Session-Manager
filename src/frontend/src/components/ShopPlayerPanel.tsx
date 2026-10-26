import { useEffect, useMemo, useRef, useState } from 'react';
import { CustomSelect } from './CustomSelect.tsx';
import { formatWeight } from '../lib/dnd.ts';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useCurrencyStore } from '../store/currencyStore.ts';
import { useShopsStore } from '../store/shopStore.ts';
import { useToastStore } from '../store/toastStore.ts';
import { groupByCategory, shareState } from '../types/shop.ts';
import type { Shop, ShopItem } from '../types/shop.ts';
import type { CharacterCurrency } from '../types/currency.ts';

const EMPTY_WALLET: CharacterCurrency[] = [];
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
  const { shops, loaded: shopsLoaded, fetchShops, purchase } = useShopsStore();
  const { wallets, fetchWallet } = useCurrencyStore();
  const showToast = useToastStore((s) => s.showToast);
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
    // Same as the map panel: no baseline before the first real load, or every
    // shop already shared would auto-open on each page load.
    if (!characterId || !shopsLoaded) return;
    const currentIds = new Set(visibleShops.map((s) => s.id));
    const seen = seenShopIdsRef.current.get(characterId);
    if (seen) {
      const newShops = visibleShops.filter((s) => !seen.has(s.id));
      if (newShops.length > 0) setAutoOpenQueue((q) => [...q, ...newShops]);
    }
    seenShopIdsRef.current.set(characterId, currentIds);
    setViewingShop((current) => (current && !currentIds.has(current.id) ? null : current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId, visibleShopIdsKey, shopsLoaded]);

  useEffect(() => {
    if (viewingShop === null && autoOpenQueue.length > 0) {
      setViewingShop(autoOpenQueue[0]);
      setAutoOpenQueue((q) => q.slice(1));
    }
  }, [viewingShop, autoOpenQueue]);

  function openShop(shop: Shop) {
    setViewingShop(shop);
  }

  // FA-11: a character can only buy what it can pay for, in exactly the
  // listed coins (no conversion — house rule). Wallet reloads after a buy.
  useEffect(() => {
    if (characterId) fetchWallet(gameId, characterId);
  }, [gameId, characterId, fetchWallet]);
  const wallet = characterId ? (wallets[characterId] ?? EMPTY_WALLET) : EMPTY_WALLET;
  const canAfford = (item: ShopItem) =>
    item.prices.every((p) => (wallet.find((w) => w.denominationId === p.denominationId)?.quantity ?? 0) >= p.amount);
  // Sold out (shared stock at 0) disappears for players entirely (FA-11).
  const isSoldOut = (item: ShopItem) => item.saleMode === 'SharedStock' && item.stockQuantity === 0;

  async function handleBuy(shopId: string, item: ShopItem) {
    if (!characterId) return;
    const ok = await purchase(gameId, shopId, item.id, { characterId, quantity: 1 });
    const message = useShopsStore.getState().purchaseMessage;
    showToast(ok ? `Bought ${item.name}.` : (message ?? 'Purchase failed.'), ok ? 'success' : 'error');
    fetchWallet(gameId, characterId);
  }

  // The open view follows the store, so stock and items stay current after a buy.
  const openShopLive = viewingShop ? (shops.find((s) => s.id === viewingShop.id) ?? viewingShop) : null;

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
            <div className="shop-item-info">
              <span className="name">{shop.name}</span>
              {shop.location && <span className="shop-location">📍 {shop.location}</span>}
            </div>
            <button className="btn-ghost" onClick={() => openShop(shop)}>Open</button>
          </div>
        ))}
      </div>

      {viewingShop && (
        <div className="dialog-overlay" onClick={() => setViewingShop(null)}>
          <div className="dialog-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {viewingShop.name}
                {viewingShop.location && <span className="shop-location">📍 {viewingShop.location}</span>}
              </h3>
              <span className="modal-close" onClick={() => setViewingShop(null)}>✕</span>
            </div>
            {viewingShop.description && <p className="hint">{viewingShop.description}</p>}
            {groupByCategory(openShopLive!.items.filter((item) => !isSoldOut(item))).map(({ category, items }) => (
              <div key={category}>
              <div className="shop-cat-label">{category}</div>
              {items.map((item) => (
              <div key={item.id} className={`init-row${canAfford(item) ? '' : ' too-expensive'}`}>
                <div className="shop-item-info">
                  <span className="name">{item.name}</span>
                  {(item.weight > 0 || item.description) && (
                    <span className="shop-item-meta">
                      {item.weight > 0 && formatWeight(item.weight)}
                      {item.weight > 0 && item.description && ' · '}
                      {item.description}
                    </span>
                  )}
                </div>
                <div className="price-pills">
                  {item.prices.map((p) => (
                    <span key={p.denominationId} className="coin-pill-sm">
                      <span className="coin-dot" style={{ background: p.color }} />
                      <span className="coin-amount">{p.amount}</span>
                      <span className="coin-abbr">{p.abbreviation}</span>
                    </span>
                  ))}
                </div>
                {item.saleMode === 'SharedStock' && item.stockQuantity != null && (
                  <span className="tag">{item.stockQuantity} left</span>
                )}
                <button
                  className="buy-btn"
                  disabled={!canAfford(item)}
                  title={canAfford(item) ? undefined : "Not enough of the listed coins"}
                  onClick={() => handleBuy(openShopLive!.id, item)}
                >
                  Buy
                </button>
              </div>
              ))}
              </div>
            ))}
            {openShopLive!.items.filter((item) => !isSoldOut(item)).length === 0 && <p className="hint" style={{ margin: 0 }}>Nothing for sale right now.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
