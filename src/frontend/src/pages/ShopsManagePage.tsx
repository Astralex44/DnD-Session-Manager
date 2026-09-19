import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { CustomSelect } from '../components/CustomSelect.tsx';
import { NumberInput } from '../components/NumberInput.tsx';
import { useCurrencyStore } from '../store/currencyStore.ts';
import { useShopsStore } from '../store/shopStore.ts';
import { shareState } from '../types/shop.ts';
import type { CreateShopItemInput, Shop, ShopItem, ShopSaleMode } from '../types/shop.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

const SALE_MODE_OPTIONS: { value: ShopSaleMode; label: string }[] = [
  { value: 'SharedStock', label: 'Shared Stock' },
  { value: 'PerPlayerLimited', label: 'Per Player Limited' },
];

const SALE_MODE_HINT: Record<ShopSaleMode, string> = {
  SharedStock: 'All characters share the same stock. Once it runs out, nobody can buy more, regardless of who used it.',
  PerPlayerLimited: 'Each character can buy independently, up to the limit below — no shared counter.',
};

const EMPTY_ITEM_FORM: CreateShopItemInput = {
  name: '', description: '', icon: '', saleMode: 'SharedStock', stockQuantity: 1, maxPerCharacter: null, prices: [],
};

interface ItemModalTarget {
  shopId: string;
  item: ShopItem | null;
}

export function ShopsManagePage() {
  const {
    shops, isLoading, error,
    fetchShops, createShop, updateShop, removeShop, addItem, updateItem, removeItem,
  } = useShopsStore();
  const { denominations, fetchDenominations } = useCurrencyStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Shop | null>(null);

  const [itemModal, setItemModal] = useState<ItemModalTarget | null>(null);
  const [itemForm, setItemForm] = useState<CreateShopItemInput>(EMPTY_ITEM_FORM);

  useEffect(() => {
    fetchShops(DEMO_GAME_ID);
    fetchDenominations(DEMO_GAME_ID);
  }, [fetchShops, fetchDenominations]);

  async function handleCreate() {
    if (!newName.trim()) return;
    const ok = await createShop(DEMO_GAME_ID, { name: newName.trim(), description: newDescription });
    if (ok) {
      setNewName('');
      setNewDescription('');
      setShowCreate(false);
    }
  }

  function startEdit(shop: Shop) {
    setEditingId(shop.id);
    setEditName(shop.name);
    setEditDescription(shop.description);
  }

  async function handleSaveEdit(shop: Shop) {
    if (!editName.trim()) return;
    const ok = await updateShop(DEMO_GAME_ID, shop.id, { name: editName.trim(), description: editDescription });
    if (ok) setEditingId(null);
  }

  function openAddItemModal(shopId: string) {
    setItemForm(EMPTY_ITEM_FORM);
    setItemModal({ shopId, item: null });
  }

  function openEditItemModal(shopId: string, item: ShopItem) {
    setItemForm({
      name: item.name,
      description: item.description,
      icon: item.icon,
      saleMode: item.saleMode,
      stockQuantity: item.stockQuantity,
      maxPerCharacter: item.maxPerCharacter,
      prices: item.prices.map((p) => ({ denominationId: p.denominationId, amount: p.amount })),
    });
    setItemModal({ shopId, item });
  }

  function closeItemModal() {
    setItemModal(null);
  }

  function priceAmountFor(denominationId: string) {
    return itemForm.prices.find((p) => p.denominationId === denominationId)?.amount ?? 0;
  }

  function setPriceAmount(denominationId: string, amount: number) {
    setItemForm((f) => {
      const others = f.prices.filter((p) => p.denominationId !== denominationId);
      return { ...f, prices: amount > 0 ? [...others, { denominationId, amount }] : others };
    });
  }

  async function handleSaveItem() {
    if (!itemModal || !itemForm.name.trim() || itemForm.prices.length === 0) return;
    const ok = itemModal.item
      ? await updateItem(DEMO_GAME_ID, itemModal.shopId, itemModal.item.id, itemForm)
      : await addItem(DEMO_GAME_ID, itemModal.shopId, itemForm);
    if (ok) closeItemModal();
  }

  async function handleDeleteItem() {
    if (!itemModal?.item) return;
    await removeItem(DEMO_GAME_ID, itemModal.shopId, itemModal.item.id);
    closeItemModal();
  }

  function qtyLabel(item: ShopItem) {
    return item.saleMode === 'PerPlayerLimited' ? (item.maxPerCharacter ?? '—') : (item.stockQuantity ?? '∞');
  }

  return (
    <div className="shops-page">
      <h2>Shops</h2>
      <p className="hint">
        Prices can span multiple denominations at once (e.g. 2 GP and 5 SP), paid in the exact denomination(s)
        listed — no automatic conversion or substitution. Sharing and buying both happen during the live session
        on the Board, not here — this page is for setting shops up.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="upload-zone" onClick={() => setShowCreate((s) => !s)}>
        <span className="glyph">🛒</span>
        {showCreate ? 'Cancel' : 'Click to create a new shop'}
      </div>

      {showCreate && (
        <div className="map-edit-panel">
          <div className="field">
            <label>Shop Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. The Weary Traveler" />
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label>Description</label>
            <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Optional flavor text" />
          </div>
          <div className="form-actions" style={{ marginTop: 12 }}>
            <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button onClick={handleCreate}>Create Shop</button>
          </div>
        </div>
      )}

      {isLoading && <p className="hint">Loading…</p>}

      <div className="card-list">
        {shops.map((shop) => {
          return (
          <div key={shop.id} className="row-card">
            <div className="row-top">
              <div>
                <div className="row-title">{shop.name}</div>
              </div>
              <div className="row-actions">
                <button onClick={() => openAddItemModal(shop.id)}>+ Item</button>
                <button className="icon-btn" onClick={() => (editingId === shop.id ? setEditingId(null) : startEdit(shop))}>
                  {editingId === shop.id ? 'Close' : 'Edit'}
                </button>
                <button className="icon-btn" onClick={() => setDeleteTarget(shop)}>Delete</button>
              </div>
            </div>

            <div className="chip-row">
              {shop.shares.length === 0 && <span className="chip">Not shared with anyone yet</span>}
              {shop.shares.map((share) => {
                const state = shareState(share);
                const chipClass = state === 'visible' ? 'visible' : state === 'hidden' ? 'hidden-chip' : 'locked';
                return (
                  <span key={share.id} className={`chip ${chipClass}`}>
                    {share.characterName}
                  </span>
                );
              })}
            </div>

            <table className="shop-item-table">
              <colgroup>
                <col />
                <col className="col-price" />
                <col className="col-qty" />
                <col className="col-mode" />
                <col className="col-edit" />
              </colgroup>
              <thead><tr><th>Name</th><th>Price</th><th>Qty</th><th>Mode</th><th></th></tr></thead>
              <tbody>
                {shop.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      {item.prices.length === 0 ? (
                        '—'
                      ) : (
                        <div className="price-pills">
                          {item.prices.map((p) => (
                            <span key={p.denominationId} className="coin-pill-sm">
                              <span className="coin-dot" style={{ background: p.color }} />
                              <span className="coin-amount">{p.amount}</span>
                              <span className="coin-abbr">{p.abbreviation}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>{qtyLabel(item)}</td>
                    <td><span className="mode-chip">{item.saleMode === 'SharedStock' ? 'Shared Stock' : 'Per Player'}</span></td>
                    <td><button className="icon-btn" onClick={() => openEditItemModal(shop.id, item)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shop.items.length === 0 && <p className="hint" style={{ margin: '8px 0 0' }}>No items yet.</p>}

            {editingId === shop.id && (
              <div className="map-edit-panel">
                <div className="field">
                  <label>Shop Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="field" style={{ marginTop: 10 }}>
                  <label>Description</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                </div>
                <div className="form-actions" style={{ marginTop: 12 }}>
                  <button className="btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                  <button onClick={() => handleSaveEdit(shop)}>Save</button>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {!isLoading && shops.length === 0 && <p className="hint">No shops yet.</p>}

      {itemModal && (
        <div className="dialog-overlay" onClick={closeItemModal}>
          <div className="dialog-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{itemModal.item ? 'Edit Item' : 'Add Item'}</h3>
              <span className="modal-close" onClick={closeItemModal}>✕</span>
            </div>

            <div className="field">
              <label>Name</label>
              <input value={itemForm.name} onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Arrows (20 ct.)" />
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label>Description</label>
              <input value={itemForm.description} onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional flavor text" />
            </div>

            <p className="hint" style={{ marginTop: 14, marginBottom: 6 }}>Price (one or more denominations)</p>
            {denominations.length === 0 ? (
              <p className="hint" style={{ margin: 0 }}>No currencies set up for this game yet.</p>
            ) : (
              <div className="wallet-row">
                {denominations.map((d) => (
                  <label key={d.id} className="coin-pill">
                    <span className="coin-dot" style={{ background: d.color }} />
                    <NumberInput
                      min={0}
                      value={priceAmountFor(d.id)}
                      onChange={(v) => setPriceAmount(d.id, v)}
                    />
                    <span className="coin-abbr">{d.abbreviation}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="field" style={{ marginTop: 14 }}>
              <label>Sale Mode</label>
              <CustomSelect
                value={itemForm.saleMode}
                onChange={(v) => setItemForm((f) => ({ ...f, saleMode: v as ShopSaleMode }))}
                options={SALE_MODE_OPTIONS}
              />
            </div>
            <p className="hint" style={{ marginTop: 6, marginBottom: 0 }}>{SALE_MODE_HINT[itemForm.saleMode]}</p>

            {itemForm.saleMode === 'SharedStock' ? (
              <div className="field" style={{ marginTop: 10 }}>
                <label>Stock Quantity</label>
                <input
                  type="number" min={0}
                  value={itemForm.stockQuantity ?? ''}
                  onChange={(e) => setItemForm((f) => ({ ...f, stockQuantity: e.target.value === '' ? null : Number(e.target.value) }))}
                />
              </div>
            ) : (
              <div className="field" style={{ marginTop: 10 }}>
                <label>Max Per Character</label>
                <input
                  type="number" min={1}
                  value={itemForm.maxPerCharacter ?? ''}
                  onChange={(e) => setItemForm((f) => ({ ...f, maxPerCharacter: e.target.value === '' ? null : Number(e.target.value) }))}
                />
              </div>
            )}

            <div className="form-actions" style={{ marginTop: 18 }}>
              {itemModal.item && <button className="btn-danger" style={{ marginRight: 'auto' }} onClick={handleDeleteItem}>Delete Item</button>}
              <button className="btn-ghost" onClick={closeItemModal}>Cancel</button>
              <button onClick={handleSaveItem}>Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this shop?"
          message={`This permanently deletes "${deleteTarget.name}", its items, and its sharing settings. This can't be undone.`}
          confirmLabel="Delete Shop"
          onConfirm={async () => {
            await removeShop(DEMO_GAME_ID, deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
