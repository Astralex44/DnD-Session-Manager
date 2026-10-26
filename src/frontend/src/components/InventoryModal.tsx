import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AutoResizeTextarea } from './AutoResizeTextarea.tsx';
import { NumberInput } from './NumberInput.tsx';
import { formatWeight, sortItems, totalWeight } from '../lib/dnd.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { SHOP_ITEM_CATEGORIES } from '../types/shop.ts';
import type { CreateItemInput, Item } from '../types/character.ts';

const EMPTY_ITEM: CreateItemInput = { category: '', name: '', quantity: 1, weight: 0, description: '' };
const CATEGORY_LIST_ID = 'inventory-category-suggestions';

interface InventoryModalProps {
  gameId: string;
  characterId: string;
  characterName: string;
  items: Item[];
  // Only the owner edits; the DM gets the same view read-only.
  editable: boolean;
  onClose: () => void;
}

// The only place an inventory is edited (Severin, 2026-10-26): the sheet
// lists items read-only and opens this. Cards sit in a grid with a fixed
// min/max width, so a wider window fits more per row instead of stretching
// them. Click a card to edit it on the spot; fields save on blur, like the
// rest of the sheet.
export function InventoryModal({ gameId, characterId, characterName, items, editable, onClose }: InventoryModalProps) {
  const { addItem, updateItem, removeItem } = useCharactersStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<CreateItemInput>(EMPTY_ITEM);

  async function handleAdd() {
    if (!newItem.name.trim()) return;
    await addItem(gameId, characterId, { ...newItem, name: newItem.name.trim(), category: newItem.category.trim() });
    setNewItem(EMPTY_ITEM);
    setAdding(false);
  }

  function onEnter(fn: () => void) {
    return (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') fn();
    };
  }

  const weight = totalWeight(items);

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box inventory-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Inventory — {characterName}</h3>
          <span className="modal-close" onClick={onClose}>✕</span>
        </div>
        <p className="inventory-summary">
          {items.length} {items.length === 1 ? 'item' : 'items'}
          {weight > 0 && <> · total weight <strong>{formatWeight(weight)}</strong></>}
        </p>

        <datalist id={CATEGORY_LIST_ID}>
          {SHOP_ITEM_CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>

        <div className="inventory-grid">
          {sortItems(items).map((item) => editable && editingId === item.id ? (
            <EditItemCard
              key={item.id}
              item={item}
              onSave={(input) => updateItem(gameId, characterId, item.id, input)}
              onRemove={async () => {
                setEditingId(null);
                await removeItem(gameId, characterId, item.id);
              }}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div
              key={item.id}
              className={`inventory-card${editable ? ' clickable' : ''}`}
              onClick={editable ? () => { setEditingId(item.id); setAdding(false); } : undefined}
              title={editable ? 'Click to edit' : undefined}
            >
              <div className="inv-card-top">
                <span className="inv-name">{item.name}</span>
                <span className="inv-qty">×{item.quantity}</span>
              </div>
              {item.category && <span className="inv-category">{item.category}</span>}
              {item.weight > 0 && (
                <span className="inv-weight">
                  {formatWeight(item.weight)}{item.quantity > 1 && ` each · ${formatWeight(item.weight * item.quantity)}`}
                </span>
              )}
              {item.description && <p className="inv-desc" title={item.description}>{item.description}</p>}
            </div>
          ))}

          {editable && (adding ? (
            <div className="inventory-card editing">
              <div className="field">
                <label>Name</label>
                <input autoFocus value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} onKeyDown={onEnter(() => void handleAdd())} placeholder="e.g. Rope (50 ft)" />
              </div>
              <div className="inv-edit-pair">
                <div className="field">
                  <label>Qty</label>
                  <NumberInput min={1} value={newItem.quantity} onChange={(v) => setNewItem({ ...newItem, quantity: v })} onKeyDown={onEnter(() => void handleAdd())} />
                </div>
                <div className="field">
                  <label>Weight (lb)</label>
                  <NumberInput min={0} step={0.1} value={newItem.weight} onChange={(v) => setNewItem({ ...newItem, weight: Math.max(0, v) })} onKeyDown={onEnter(() => void handleAdd())} />
                </div>
              </div>
              <div className="field">
                <label>Category</label>
                <input list={CATEGORY_LIST_ID} value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} onKeyDown={onEnter(() => void handleAdd())} />
              </div>
              <div className="field">
                <label>Description</label>
                <AutoResizeTextarea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
              </div>
              <div className="inv-card-actions">
                <button className="btn-ghost" onClick={() => { setAdding(false); setNewItem(EMPTY_ITEM); }}>Cancel</button>
                <button onClick={() => void handleAdd()}>Add</button>
              </div>
            </div>
          ) : (
            <button className="inventory-card add-card" onClick={() => { setAdding(true); setEditingId(null); }}>
              + New item
            </button>
          ))}
        </div>

        {items.length === 0 && !editable && <p className="hint" style={{ margin: 0 }}>No items.</p>}
      </div>
    </div>
  );
}

interface EditItemCardProps {
  item: Item;
  onSave: (input: CreateItemInput) => Promise<void>;
  onRemove: () => Promise<void>;
  onDone: () => void;
}

function EditItemCard({ item, onSave, onRemove, onDone }: EditItemCardProps) {
  const [draft, setDraft] = useState<CreateItemInput>({
    category: item.category, name: item.name, quantity: item.quantity, weight: item.weight, description: item.description,
  });

  // Blur-to-save: commit the whole draft whenever a field is left changed.
  function commit() {
    const changed = draft.name.trim() !== item.name || draft.category.trim() !== item.category
      || draft.quantity !== item.quantity || draft.weight !== item.weight || draft.description !== item.description;
    if (!changed || !draft.name.trim()) return;
    void onSave({ ...draft, name: draft.name.trim(), category: draft.category.trim() });
  }

  return (
    <div className="inventory-card editing" onBlur={commit}>
      <div className="field">
        <label>Name</label>
        <input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      </div>
      <div className="inv-edit-pair">
        <div className="field">
          <label>Qty</label>
          <NumberInput min={1} value={draft.quantity} onChange={(v) => setDraft({ ...draft, quantity: v })} />
        </div>
        <div className="field">
          <label>Weight (lb)</label>
          <NumberInput min={0} step={0.1} value={draft.weight} onChange={(v) => setDraft({ ...draft, weight: Math.max(0, v) })} />
        </div>
      </div>
      <div className="field">
        <label>Category</label>
        <input list={CATEGORY_LIST_ID} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
      </div>
      <div className="field">
        <label>Description</label>
        <AutoResizeTextarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      </div>
      <div className="inv-card-actions">
        <button className="btn-danger" onClick={() => void onRemove()}>Delete</button>
        <button onClick={() => { commit(); onDone(); }}>Done</button>
      </div>
    </div>
  );
}
