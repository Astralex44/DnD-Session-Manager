import { useEffect, useState } from 'react';
import { CustomSelect } from './CustomSelect.tsx';
import { NumberInput } from './NumberInput.tsx';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useCurrencyStore } from '../store/currencyStore.ts';
import { useShopsStore } from '../store/shopStore.ts';
import { useToastStore } from '../store/toastStore.ts';
import { shareState } from '../types/shop.ts';
import type { CreateShopItemPriceInput, ShopItem } from '../types/shop.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';
const NO_TARGET = '__none__';

interface SellTarget {
  shopId: string;
  item: ShopItem;
}

// DM-only: browse shops, control who currently sees each one on their own
// Board (sharing is a live-session action — see feedback_manage_vs_board_actions,
// ShopsManagePage stays read-only-in-Manage), and complete sales. Only the DM
// ever calls the purchase endpoint — and since prices here are often
// negotiated live at the table, the price editor is prefilled from the
// item's configured price but fully overridable for this one sale, reusing
// the same coin-pill pattern as ShopsManagePage.
export function ShopDmPanel() {
  const { shops, fetchShops, purchase, setShare, removeShare } = useShopsStore();
  const { characters, fetchCharacters } = useCharactersStore();
  const { denominations, fetchDenominations } = useCurrencyStore();
  const showToast = useToastStore((s) => s.showToast);

  const [shopId, setShopId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState('');
  const [sellTarget, setSellTarget] = useState<SellTarget | null>(null);
  const [characterId, setCharacterId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [prices, setPrices] = useState<CreateShopItemPriceInput[]>([]);

  useLiveFetch(DEMO_GAME_ID, 'shops', fetchShops);

  useEffect(() => {
    fetchCharacters(DEMO_GAME_ID);
    fetchDenominations(DEMO_GAME_ID);
  }, [fetchCharacters, fetchDenominations]);

  useEffect(() => {
    if (!shopId && shops.length > 0) setShopId(shops[0].id);
  }, [shops, shopId]);

  useEffect(() => {
    setShareTarget(NO_TARGET);
  }, [shopId]);

  const shop = shops.find((s) => s.id === shopId) ?? null;
  const shopOptions = shops.map((s) => ({ value: s.id, label: s.name }));
  const characterOptions = characters.map((c) => ({ value: c.id, label: `${c.name} (${c.playerName})` }));

  const sharedIds = new Set(shop?.shares.map((s) => s.characterId) ?? []);
  const shareableCharacters = characters.filter((c) => !sharedIds.has(c.id));
  const shareOptions = [
    { value: NO_TARGET, label: 'Share with…' },
    ...shareableCharacters.map((c) => ({ value: c.id, label: `${c.name} (${c.playerName})` })),
  ];

  function openSell(item: ShopItem) {
    if (!shop) return;
    setSellTarget({ shopId: shop.id, item });
    setCharacterId(characters[0]?.id ?? '');
    setQuantity(1);
    setPrices(item.prices.map((p) => ({ denominationId: p.denominationId, amount: p.amount })));
  }

  function priceAmountFor(denominationId: string) {
    return prices.find((p) => p.denominationId === denominationId)?.amount ?? 0;
  }

  function setPriceAmount(denominationId: string, amount: number) {
    setPrices((ps) => {
      const others = ps.filter((p) => p.denominationId !== denominationId);
      return amount > 0 ? [...others, { denominationId, amount }] : others;
    });
  }

  async function handleSell() {
    if (!sellTarget || !characterId) return;
    const ok = await purchase(DEMO_GAME_ID, sellTarget.shopId, sellTarget.item.id, {
      characterId,
      quantity,
      overridePrices: prices,
    });
    const message = ok ? 'Sold.' : useShopsStore.getState().purchaseMessage ?? 'Purchase failed.';
    showToast(message, ok ? 'success' : 'error');
    if (ok) setSellTarget(null);
  }

  return (
    <div className="panel">
      <div className="panel-header"><h3>Shop</h3></div>
      <div className="panel-body">
        {shops.length === 0 && <p className="hint" style={{ margin: 0 }}>No shops set up yet.</p>}

        {shops.length > 1 && (
          <div className="field" style={{ marginBottom: 10 }}>
            <label>Shop</label>
            <CustomSelect value={shopId ?? ''} onChange={setShopId} options={shopOptions} />
          </div>
        )}

        {shop && (
          <>
            <div className="chip-row">
              {shop.shares.length === 0 && <span className="chip">Not shared with anyone yet</span>}
              {shop.shares.map((share) => {
                const state = shareState(share);
                const chipClass = state === 'visible' ? 'visible' : state === 'hidden' ? 'hidden-chip' : 'locked';
                return (
                  <span key={share.id} className={`chip ${chipClass} chip-removable`}>
                    {share.characterName}
                    <span className="chip-remove" onClick={() => removeShare(DEMO_GAME_ID, shop.id, share.characterId)}>✕</span>
                  </span>
                );
              })}
            </div>

            {shareableCharacters.length > 0 && (
              <div className="share-add-row">
                <div style={{ width: 200 }}>
                  <CustomSelect value={shareTarget} onChange={setShareTarget} options={shareOptions} />
                </div>
                <button
                  className="btn-ghost"
                  disabled={!shareTarget || shareTarget === NO_TARGET}
                  onClick={() => {
                    if (!shareTarget || shareTarget === NO_TARGET) return;
                    setShare(DEMO_GAME_ID, shop.id, shareTarget, { hidden: false, locked: false });
                    setShareTarget(NO_TARGET);
                  }}
                >
                  Share
                </button>
              </div>
            )}
          </>
        )}

        {shop && shop.items.length === 0 && <p className="hint" style={{ margin: '10px 0 0' }}>No items in this shop.</p>}

        {shop && shop.items.map((item) => (
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
            <button
              className="row-remove"
              style={{ background: 'var(--secondary)', color: 'var(--bg)' }}
              disabled={item.saleMode === 'SharedStock' && item.stockQuantity === 0}
              onClick={() => openSell(item)}
            >
              Sell
            </button>
          </div>
        ))}
      </div>

      {sellTarget && (
        <div className="dialog-overlay" onClick={() => setSellTarget(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sell: {sellTarget.item.name}</h3>
              <span className="modal-close" onClick={() => setSellTarget(null)}>✕</span>
            </div>

            <div className="field">
              <label>Buyer</label>
              <CustomSelect value={characterId} onChange={setCharacterId} options={characterOptions} />
            </div>

            <div className="field" style={{ marginTop: 10 }}>
              <label>Quantity</label>
              <NumberInput min={1} value={quantity} onChange={setQuantity} />
            </div>

            <p className="hint" style={{ marginTop: 14, marginBottom: 6 }}>
              Price for this sale — prefilled from the shop price, adjust if it was negotiated.
            </p>
            <div className="wallet-row">
              {denominations.map((d) => (
                <label key={d.id} className="coin-pill">
                  <span className="coin-dot" style={{ background: d.color }} />
                  <NumberInput min={0} value={priceAmountFor(d.id)} onChange={(v) => setPriceAmount(d.id, v)} />
                  <span className="coin-abbr">{d.abbreviation}</span>
                </label>
              ))}
            </div>

            <div className="form-actions" style={{ marginTop: 18 }}>
              <button className="btn-ghost" onClick={() => setSellTarget(null)}>Cancel</button>
              <button onClick={handleSell} disabled={!characterId || prices.length === 0}>Sell</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
