import { useEffect, useState } from 'react';
import { CustomSelect } from './CustomSelect.tsx';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useShopsStore } from '../store/shopStore.ts';
import { shareState } from '../types/shop.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

// Read-only — a player can look at prices on a shop the DM shared with their
// character, but only the DM completes a sale (see ShopDmPanel and
// feedback_manage_vs_board_actions). "Hidden" shares stay invisible here;
// "locked" ones still show (locked just means the DM won't take more offers).
// Live via SignalR push — a share toggled by the DM appears here instantly.
export function ShopPlayerPanel() {
  const { shops, fetchShops } = useShopsStore();
  const { characters, fetchCharacters } = useCharactersStore();

  const [characterId, setCharacterId] = useState<string | null>(null);

  useLiveFetch(DEMO_GAME_ID, 'shops', fetchShops);

  useEffect(() => {
    fetchCharacters(DEMO_GAME_ID);
  }, [fetchCharacters]);

  useEffect(() => {
    if (!characterId && characters.length > 0) setCharacterId(characters[0].id);
  }, [characters, characterId]);

  const characterOptions = characters.map((c) => ({ value: c.id, label: `${c.name} (${c.playerName})` }));
  const visibleShops = shops.filter((s) => {
    const share = s.shares.find((sh) => sh.characterId === characterId);
    const state = shareState(share);
    return state === 'visible' || state === 'locked';
  });

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

        {visibleShops.map((shop) => (
          <div key={shop.id} style={{ marginBottom: 14 }}>
            <div className="monster-name">{shop.name}</div>
            {shop.items.map((item) => (
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
            {shop.items.length === 0 && <p className="hint" style={{ margin: 0 }}>Nothing for sale yet.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
