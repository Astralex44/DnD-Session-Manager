import { useEffect, useState } from 'react';
import { AutoResizeTextarea } from '../components/AutoResizeTextarea.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { CustomSelect } from '../components/CustomSelect.tsx';
import { useToastStore } from '../store/toastStore.ts';
import { NumberInput } from '../components/NumberInput.tsx';
import { useCurrencyStore } from '../store/currencyStore.ts';
import { useShopsStore } from '../store/shopStore.ts';
import {
  ALL_LOCATIONS, groupByCategory, locationFilterOptions, matchesLocation, shareState, shopLocations, SHOP_ITEM_CATEGORIES,
} from '../types/shop.ts';
import { formatWeight } from '../lib/dnd.ts';
import type { CreateShopItemInput, Shop, ShopItem, ShopSaleMode } from '../types/shop.ts';
import { useGameId } from '../store/authStore.ts';


// The explanation lives in the dropdown itself (shown under each option in
// the open menu), not as extra text in the item form.
const SALE_MODE_OPTIONS: { value: ShopSaleMode; label: string; description: string }[] = [
  { value: 'SharedStock', label: 'Shared Stock', description: 'One stock for everyone — once it runs out, nobody can buy more.' },
  { value: 'PerPlayerLimited', label: 'Per Player Limited', description: 'Each character buys on their own, up to a limit — no shared counter.' },
];

const LOCATION_LIST_ID = 'shop-location-suggestions';

const CATEGORY_OPTIONS = SHOP_ITEM_CATEGORIES.map((c) => ({ value: c, label: c }));

const EMPTY_ITEM_FORM: CreateShopItemInput = {
  name: '', description: '', icon: '', category: 'Miscellaneous', weight: 0,
  saleMode: 'SharedStock', stockQuantity: 1, maxPerCharacter: null, prices: [],
};

interface ItemModalTarget {
  shopId: string;
  item: ShopItem | null;
}

export function ShopsManagePage() {
  const gameId = useGameId();
  const {
    shops, isLoading, error,
    fetchShops, createShop, updateShop, removeShop, addItem, updateItem, removeItem, setSaleModeForAll
  } = useShopsStore();
  const showToast = useToastStore((t) => t.showToast);

  // FA-11: one sale mode for every item in the shop (written onto each item).
  // Only offered while editing the shop, and confirmed first — it overwrites
  // each item's own setting.
  const [saleModeAll, setSaleModeAll] = useState<{ shop: Shop; mode: ShopSaleMode } | null>(null);
  async function applySaleModeForAll() {
    if (!saleModeAll) return;
    const { shop, mode } = saleModeAll;
    setSaleModeAll(null);
    const ok = await setSaleModeForAll(gameId, shop.id, mode);
    const label = SALE_MODE_OPTIONS.find((o) => o.value === mode)?.label ?? mode;
    showToast(ok ? `All items in ${shop.name}: ${label}.` : 'Failed to update the shop.', ok ? 'success' : 'error');
  }
  const { denominations, fetchDenominations } = useCurrencyStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState(ALL_LOCATIONS);
  const [deleteTarget, setDeleteTarget] = useState<Shop | null>(null);

  const [itemModal, setItemModal] = useState<ItemModalTarget | null>(null);
  const [itemForm, setItemForm] = useState<CreateShopItemInput>(EMPTY_ITEM_FORM);

  useEffect(() => {
    fetchShops(gameId);
    fetchDenominations(gameId);
  }, [gameId, fetchShops, fetchDenominations]);

  async function handleCreate() {
    if (!newName.trim()) return;
    const ok = await createShop(gameId, { name: newName.trim(), description: newDescription, location: newLocation.trim() });
    if (ok) {
      setNewName('');
      setNewDescription('');
      setNewLocation('');
      setShowCreate(false);
    }
  }

  function startEdit(shop: Shop) {
    setEditingId(shop.id);
    setEditName(shop.name);
    setEditDescription(shop.description);
    setEditLocation(shop.location);
  }

  async function handleSaveEdit(shop: Shop) {
    if (!editName.trim()) return;
    const ok = await updateShop(gameId, shop.id, { name: editName.trim(), description: editDescription, location: editLocation.trim() });
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
      category: item.category,
      weight: item.weight,
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
      ? await updateItem(gameId, itemModal.shopId, itemModal.item.id, itemForm)
      : await addItem(gameId, itemModal.shopId, itemForm);
    if (ok) closeItemModal();
  }

  async function handleDeleteItem() {
    if (!itemModal?.item) return;
    await removeItem(gameId, itemModal.shopId, itemModal.item.id);
    closeItemModal();
  }

  // Search matches name or location; the dropdown narrows to one location.
  const query = search.trim().toLowerCase();
  const visibleShops = shops.filter((shop) =>
    matchesLocation(shop, locationFilter)
    && (!query || shop.name.toLowerCase().includes(query) || shop.location.toLowerCase().includes(query)));

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
        <div className="map-edit-panel create-panel">
          <div className="field">
            <label>Shop Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. The Weary Traveler" />
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label>Location</label>
            <input list={LOCATION_LIST_ID} value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. Waterdeep, Dock Ward" />
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label>Description</label>
            <AutoResizeTextarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Optional flavor text" />
          </div>
          <div className="form-actions" style={{ marginTop: 12 }}>
            <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button onClick={handleCreate}>Create Shop</button>
          </div>
        </div>
      )}

      {isLoading && <p className="hint">Loading…</p>}

      {/* Suggestions for the Location fields: every location already in use,
          so one place isn't spelled two ways. */}
      <datalist id={LOCATION_LIST_ID}>
        {shopLocations(shops).map((l) => <option key={l} value={l} />)}
      </datalist>

      {shops.length > 0 && (
        <div className="shop-filters">
          <div className="field">
            <label>Search</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Shop name or location" />
          </div>
          <div className="field">
            <label>Location</label>
            <CustomSelect value={locationFilter} onChange={setLocationFilter} options={locationFilterOptions(shops)} />
          </div>
        </div>
      )}
      {shops.length > 0 && visibleShops.length === 0 && <p className="hint">No shops match.</p>}

      <div className="card-list">
        {visibleShops.map((shop) => {
          return (
          <div key={shop.id} className="row-card">
            <div className="row-top">
              <div>
                <div className="row-title">{shop.name}</div>
                {shop.location && <div className="shop-location">📍 {shop.location}</div>}
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
                {groupByCategory(shop.items).flatMap(({ category, items }) => [
                  <tr key={`cat-${category}`} className="shop-cat-row"><td colSpan={5}>{category}</td></tr>,
                  ...items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.name}
                      {item.weight > 0 && <span className="item-weight-note">{formatWeight(item.weight)}</span>}
                    </td>
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
                  )),
                ])}
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
                  <label>Location</label>
                  <input list={LOCATION_LIST_ID} value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="e.g. Waterdeep, Dock Ward" />
                </div>
                <div className="field" style={{ marginTop: 10 }}>
                  <label>Description</label>
                  <AutoResizeTextarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                </div>
                {shop.items.length > 0 && (
                  <div className="field" style={{ marginTop: 10 }}>
                    <label>Sale mode for all items</label>
                    <div className="sale-mode-all">
                      <CustomSelect
                        value=""
                        placeholder="Set all items to…"
                        onChange={(v) => setSaleModeAll({ shop, mode: v as ShopSaleMode })}
                        options={SALE_MODE_OPTIONS}
                      />
                    </div>
                    <p className="hint warn" style={{ margin: '6px 0 0' }}>
                      Overwrites the sale mode of all {shop.items.length} {shop.items.length === 1 ? 'item' : 'items'} in this shop — each item's own setting is lost.
                    </p>
                  </div>
                )}
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
              <AutoResizeTextarea value={itemForm.description} onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional flavor text" />
            </div>
            <div className="item-form-pair">
              <div className="field">
                <label>Category</label>
                <CustomSelect
                  value={itemForm.category}
                  onChange={(v) => setItemForm((f) => ({ ...f, category: v }))}
                  options={CATEGORY_OPTIONS}
                />
              </div>
              <div className="field">
                <label>Weight (lb)</label>
                <NumberInput
                  min={0} step={0.1}
                  value={itemForm.weight}
                  onChange={(v) => setItemForm((f) => ({ ...f, weight: Math.max(0, v) }))}
                />
              </div>
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

      {saleModeAll && (
        <ConfirmDialog
          title={`Change all items in ${saleModeAll.shop.name}?`}
          message={`All ${saleModeAll.shop.items.length} items become "${SALE_MODE_OPTIONS.find((o) => o.value === saleModeAll.mode)?.label}". Each item's own sale mode is overwritten${saleModeAll.mode === 'PerPlayerLimited' ? ' (items without a limit get 1 per character)' : ''}.`}
          confirmLabel="Change all items"
          onConfirm={applySaleModeForAll}
          onCancel={() => setSaleModeAll(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this shop?"
          message={`This permanently deletes "${deleteTarget.name}", its items, and its sharing settings. This can't be undone.`}
          confirmLabel="Delete Shop"
          onConfirm={async () => {
            await removeShop(gameId, deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
