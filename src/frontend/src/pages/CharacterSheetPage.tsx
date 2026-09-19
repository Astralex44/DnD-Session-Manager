import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { charactersApi } from '../api/characters.ts';
import { AccessGate } from '../components/AccessGate.tsx';
import { AutoResizeTextarea } from '../components/AutoResizeTextarea.tsx';
import { LockControl } from '../components/LockControl.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { CustomSelect } from '../components/CustomSelect.tsx';
import { NumberInput } from '../components/NumberInput.tsx';
import { ABILITY_SHORT, fmtMod, modifier, toUpdateCharacterInput } from '../lib/dnd.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useCurrencyStore } from '../store/currencyStore.ts';
import { useToastStore } from '../store/toastStore.ts';
import type { CharacterCurrency } from '../types/currency.ts';
import type {
  CreateAttackInput,
  CreateItemInput,
  CreateLevelSheetInput,
  CreateSpellInput,
  UpdateCharacterInput,
  UpsertSpellcastingInput,
} from '../types/character.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

const SKILL_ABILITY: Record<string, string> = {
  Acrobatics: 'Dexterity',
  'Animal Handling': 'Wisdom',
  Arcana: 'Intelligence',
  Athletics: 'Strength',
  Deception: 'Charisma',
  History: 'Intelligence',
  Insight: 'Wisdom',
  Intimidation: 'Charisma',
  Investigation: 'Intelligence',
  Medicine: 'Wisdom',
  Nature: 'Intelligence',
  Perception: 'Wisdom',
  Performance: 'Charisma',
  Persuasion: 'Charisma',
  Religion: 'Intelligence',
  'Sleight of Hand': 'Dexterity',
  Stealth: 'Dexterity',
  Survival: 'Wisdom',
};

// Standard 5e proficiency-bonus-by-level table: +2 at 1-4, +3 at 5-8, ... +6 at 17-20.
function proficiencyBonusForLevel(level: number): number {
  return 2 + Math.floor((level - 1) / 4);
}

// Stable reference so `wallets[characterId] ?? EMPTY_WALLET` doesn't hand the
// wallet-loading effect a fresh array identity on every render before the
// real wallet has been fetched, which would otherwise re-trigger it forever.
const EMPTY_WALLET: CharacterCurrency[] = [];

// AccessLock-gated at the top level (see components/AccessGate.tsx) — the
// content component below never mounts, so never fetches, until the code
// (if this sheet has one set) is verified.
export function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>();
  const characterId = id ?? '';

  return (
    <AccessGate resourceType="Character" resourceKey={characterId} label="this character sheet">
      <CharacterSheetContent characterId={characterId} />
    </AccessGate>
  );
}

function CharacterSheetContent({ characterId }: { characterId: string }) {
  const navigate = useNavigate();
  const {
    current, isLoading, error,
    fetchCharacter, updateCharacter, setSkillProficiency, setSaveProficiency,
    addAttack, updateAttack, removeAttack, addItem, updateItem, removeItem,
    createLevelSheet, setActiveLevelSheet, updateHpMax, removeLevelSheet,
    upsertSpellcasting, addSpell, setSpellPrepared, removeSpell,
    upsertSpellSlot, deleteCharacter,
  } = useCharactersStore();
  const { denominations, wallets, fetchDenominations, fetchWallet, setWalletEntry } = useCurrencyStore();
  const wallet = wallets[characterId] ?? EMPTY_WALLET;
  const showToast = useToastStore((s) => s.showToast);

  const [form, setForm] = useState<UpdateCharacterInput | null>(null);
  const [walletDraft, setWalletDraft] = useState<Record<string, number>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteLevelConfirm, setShowDeleteLevelConfirm] = useState(false);
  const [newAttack, setNewAttack] = useState<CreateAttackInput>({ name: '', atkBonus: '', damageType: '' });
  const [newItem, setNewItem] = useState<CreateItemInput>({ category: '', name: '', quantity: 1, weight: 0, description: '' });
  const [itemQtyDrafts, setItemQtyDrafts] = useState<Record<string, number>>({});
  const [newSpell, setNewSpell] = useState<CreateSpellInput>({ level: 0, name: '', prepared: false, description: '', isHomebrew: false });
  const [openSpellId, setOpenSpellId] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpForm, setLevelUpForm] = useState<CreateLevelSheetInput | null>(null);
  const [hitDieRoll, setHitDieRoll] = useState(0);
  const [spellcastingForm, setSpellcastingForm] = useState<UpsertSpellcastingInput | null>(null);
  const [showSpellcastingForm, setShowSpellcastingForm] = useState(false);

  useEffect(() => {
    if (characterId) fetchCharacter(DEMO_GAME_ID, characterId);
  }, [characterId, fetchCharacter]);

  useEffect(() => {
    fetchDenominations(DEMO_GAME_ID);
    if (characterId) fetchWallet(DEMO_GAME_ID, characterId);
  }, [characterId, fetchDenominations, fetchWallet]);

  useEffect(() => {
    if (current) setForm(toUpdateCharacterInput(current));
  }, [current]);

  useEffect(() => {
    setWalletDraft(Object.fromEntries(wallet.map((w) => [w.denominationId, w.quantity])));
  }, [wallet]);

  if (isLoading || !current || !form) {
    return (
      <div>
        <Link className="back-link" to="/characters">‹ Back</Link>
        {error && <div className="error-banner">{error}</div>}
        {isLoading && <p className="hint">Loading…</p>}
      </div>
    );
  }

  const sheet = current.activeLevelSheet;

  function updateField<K extends keyof UpdateCharacterInput>(key: K, value: UpdateCharacterInput[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function isFormDirty(candidate: UpdateCharacterInput | null): boolean {
    if (!candidate || !current) return false;
    return JSON.stringify(candidate) !== JSON.stringify(toUpdateCharacterInput(current));
  }

  function isWalletDirty(): boolean {
    return denominations.some((d) => (walletDraft[d.id] ?? 0) !== (wallet.find((w) => w.denominationId === d.id)?.quantity ?? 0));
  }

  // Fires on blur of any field in Basics/Combat/Abilities/Personality — saves
  // only what actually changed, and only if something did, so tabbing through
  // untouched fields never triggers a request.
  async function handleSave() {
    if (!isFormDirty(form) && !isWalletDirty()) return;
    let ok = form ? await updateCharacter(DEMO_GAME_ID, characterId, form) : true;
    for (const denomination of denominations) {
      const draftValue = walletDraft[denomination.id] ?? 0;
      const savedValue = wallet.find((w) => w.denominationId === denomination.id)?.quantity ?? 0;
      if (draftValue !== savedValue) {
        ok = (await setWalletEntry(DEMO_GAME_ID, characterId, denomination.id, draftValue)) && ok;
      }
    }
    showToast(ok ? 'Saved.' : 'Failed to save.', ok ? 'success' : 'error');
  }

  // For click-driven fields (toggle dots, dropdowns) that never fire a blur
  // event of their own — save right away rather than waiting on one.
  function updateFieldAndSave<K extends keyof UpdateCharacterInput>(key: K, value: UpdateCharacterInput[K]) {
    if (!form) return;
    const updated = { ...form, [key]: value };
    setForm(updated);
    if (!isFormDirty(updated)) return;
    updateCharacter(DEMO_GAME_ID, characterId, updated).then((ok) => {
      showToast(ok ? 'Saved.' : 'Failed to save.', ok ? 'success' : 'error');
    });
  }

  async function handleDelete() {
    const ok = await deleteCharacter(DEMO_GAME_ID, characterId);
    setShowDeleteConfirm(false);
    if (ok) navigate('/characters');
  }

  async function handleDeleteLevel() {
    if (!sheet) return;
    const result = await removeLevelSheet(DEMO_GAME_ID, characterId, sheet.id);
    setShowDeleteLevelConfirm(false);
    showToast(result.success ? 'Level deleted.' : (result.error ?? 'Failed to delete level.'), result.success ? 'success' : 'error');
  }

  function startLevelUp() {
    if (!sheet) return;
    const newLevel = sheet.level + 1;
    setHitDieRoll(0);
    setLevelUpForm({
      level: newLevel,
      hpToAdd: 0,
      proficiencyBonus: proficiencyBonusForLevel(newLevel),
      makeActive: true,
    });
    setShowLevelUp(true);
  }

  async function handleLevelUp() {
    if (levelUpForm && form) {
      const conMod = modifier(form.constitution);
      const hpToAdd = conMod + levelUpForm.proficiencyBonus + hitDieRoll;
      await createLevelSheet(DEMO_GAME_ID, characterId, { ...levelUpForm, hpToAdd });
      setShowLevelUp(false);
    }
  }

  function startSpellcastingForm() {
    setSpellcastingForm(
      sheet?.spellcasting ?? { class: current?.class ?? '', ability: 'Intelligence', spellSaveDc: 8, spellAttackBonus: 0 },
    );
    setShowSpellcastingForm(true);
  }

  async function handleSaveSpellcasting() {
    if (spellcastingForm && sheet) {
      await upsertSpellcasting(DEMO_GAME_ID, characterId, sheet.id, spellcastingForm);
      setShowSpellcastingForm(false);
    }
  }

  async function handleAddAttackRow() {
    if (!newAttack.name.trim()) return;
    await addAttack(DEMO_GAME_ID, characterId, newAttack);
    setNewAttack({ name: '', atkBonus: '', damageType: '' });
  }

  async function handleAddItemRow() {
    if (!newItem.name.trim()) return;
    await addItem(DEMO_GAME_ID, characterId, newItem);
    setNewItem({ category: '', name: '', quantity: 1, weight: 0, description: '' });
  }

  async function handleAddSpellRow() {
    if (!newSpell.name.trim() || !sheet) return;
    await addSpell(DEMO_GAME_ID, characterId, sheet.id, newSpell);
    setNewSpell({ level: 0, name: '', prepared: false, description: '', isHomebrew: false });
  }

  function handleHpMaxBlur(value: number) {
    if (!sheet || value === sheet.hpMax) return;
    updateHpMax(DEMO_GAME_ID, characterId, sheet.id, value);
  }

  function onEnter(fn: () => void) {
    return (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fn();
      }
    };
  }

  return (
    <div className="character-sheet-page">
      <div className="sheet-header">
        <div>
          <h2>{current.name}</h2>
          <p className="hint">
            {current.race} {current.class}
            {sheet ? ` · Level ${sheet.level}` : ''} · {current.playerName || 'Unassigned'}
          </p>
        </div>
        <div className="header-actions">
          {current.levelSheets.length > 0 && (
            <div className="level-sheet-picker no-print">
              <CustomSelect
                value={current.activeLevelSheetId}
                onChange={(v) => setActiveLevelSheet(DEMO_GAME_ID, characterId, v)}
                options={current.levelSheets.map((s) => ({ value: s.id, label: `Level ${s.level} (HP ${s.hpMax})` }))}
              />
            </div>
          )}
          <LockControl resourceType="Character" resourceKey={characterId} />
          <button className="btn-ghost no-print" onClick={startLevelUp}>+ Level Up</button>
          <a
            className="btn-ghost no-print"
            href={charactersApi.pdfUrl(DEMO_GAME_ID, characterId)}
            target="_blank"
            rel="noreferrer"
          >
            Download PDF
          </a>
          <Link className="back-link no-print" to="/characters">‹ Back</Link>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="sheet-section box" onBlur={handleSave}>
        <h3 className="section-title">Basics</h3>
        <div className="basics-grid">
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => updateField('name', e.target.value)} /></div>
          <div className="field"><label>Race</label><input value={form.race} onChange={(e) => updateField('race', e.target.value)} /></div>
          <div className="field"><label>Class</label><input value={form.class} onChange={(e) => updateField('class', e.target.value)} /></div>
          <div className="field"><label>Player</label><input value={form.playerName} onChange={(e) => updateField('playerName', e.target.value)} /></div>
          <div className="field"><label>Background</label><input value={form.background} onChange={(e) => updateField('background', e.target.value)} /></div>
          <div className="field"><label>Alignment</label><input value={form.alignment} onChange={(e) => updateField('alignment', e.target.value)} /></div>
          <div className="field"><label>Experience</label><NumberInput value={form.experiencePoints} onChange={(v) => updateField('experiencePoints', v)} /></div>
          <div className="field">
            <label>Status</label>
            <CustomSelect
              value={form.status}
              onChange={(v) => updateFieldAndSave('status', v)}
              options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'dead', label: 'Dead' }]}
            />
          </div>
          <div className="field">
            <label>Inspiration</label>
            <span className={`prof-dot${form.inspiration ? ' on' : ''}`} onClick={() => updateFieldAndSave('inspiration', !form.inspiration)} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Coin Purse
          </label>
          {denominations.length === 0 ? (
            <p className="hint" style={{ margin: 0 }}>No currencies set up for this game yet.</p>
          ) : (
            <>
              <div className="wallet-row">
                {denominations.map((d) => (
                  <label key={d.id} className="coin-pill">
                    <span className="coin-dot" style={{ background: d.color }} />
                    <NumberInput
                      min={0}
                      value={walletDraft[d.id] ?? 0}
                      onChange={(v) => setWalletDraft((w) => ({ ...w, [d.id]: v }))}
                    />
                    <span className="coin-abbr">{d.abbreviation}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="sheet-section box" onBlur={handleSave}>
        <h3 className="section-title">Combat</h3>
        <div className="combat-row">
          <div className="stat-box"><label>Armor Class</label><NumberInput value={form.armorClass} onChange={(v) => updateField('armorClass', v)} /></div>
          <div className="stat-box"><label>Initiative</label><NumberInput value={form.initiative} onChange={(v) => updateField('initiative', v)} /></div>
          <div className="stat-box"><label>Speed</label><NumberInput value={form.speed} onChange={(v) => updateField('speed', v)} /></div>
          <div className="stat-box"><label>Passive Perception</label><NumberInput value={form.passivePerception} onChange={(v) => updateField('passivePerception', v)} /></div>
        </div>

        <div className="hp-block">
          <div className="hp-max-row">
            <span>Hit Point Maximum</span>
            <input
              key={`${sheet?.id}-${sheet?.hpMax}`}
              type="number"
              defaultValue={sheet?.hpMax ?? 0}
              disabled={!sheet}
              onBlur={(e) => handleHpMaxBlur(Number(e.target.value))}
            />
          </div>
          <NumberInput className="hp-current-input" value={form.hpCurrent} onChange={(v) => updateField('hpCurrent', v)} />
          <label>Current Hit Points</label>
        </div>

        <div className="hp-block temp">
          <NumberInput className="hp-current-input" value={form.hpTemporary} onChange={(v) => updateField('hpTemporary', v)} />
          <label>Temporary Hit Points</label>
        </div>

        <div className="combat-bottom-row">
          <div className="hit-dice-box">
            <span className="hd-total-label">Total</span>
            <input value={form.hitDiceTotal} onChange={(e) => updateField('hitDiceTotal', e.target.value)} />
            <label>Hit Dice</label>
          </div>
          <div className="death-saves-box">
            <div className="death-saves">
              <div className="group">
                Successes
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`prof-dot${form.deathSaveSuccesses > i ? ' on' : ''}`}
                    onClick={() => updateFieldAndSave('deathSaveSuccesses', form.deathSaveSuccesses > i ? i : i + 1)}
                  />
                ))}
              </div>
              <div className="group">
                Failures
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`prof-dot fail${form.deathSaveFailures > i ? ' on' : ''}`}
                    onClick={() => updateFieldAndSave('deathSaveFailures', form.deathSaveFailures > i ? i : i + 1)}
                  />
                ))}
              </div>
            </div>
            <span className="ds-label">Death Saves</span>
          </div>
        </div>
      </div>

      <div className="sheet-section box" onBlur={handleSave}>
        <h3 className="section-title">Abilities, Saves &amp; Skills</h3>
        <p className="hint" style={{ marginTop: -4 }}>
          House rule: below 10, modifiers drop 1 per point instead of 1 per 2 (9=−1, 8=−2, 7=−3…). Standard 5e above 10.
        </p>
        <div className="abc-columns">
          <div>
            <div className="ability-block">
              <span className="ab-name">{ABILITY_SHORT.Strength}</span>
              <NumberInput className="ab-score-input" value={form.strength} onChange={(v) => updateField('strength', v)} />
              <span className="ab-mod">{fmtMod(modifier(form.strength))}</span>
            </div>
            <div className="ability-block">
              <span className="ab-name">{ABILITY_SHORT.Dexterity}</span>
              <NumberInput className="ab-score-input" value={form.dexterity} onChange={(v) => updateField('dexterity', v)} />
              <span className="ab-mod">{fmtMod(modifier(form.dexterity))}</span>
            </div>
            <div className="ability-block">
              <span className="ab-name">{ABILITY_SHORT.Constitution}</span>
              <NumberInput className="ab-score-input" value={form.constitution} onChange={(v) => updateField('constitution', v)} />
              <span className="ab-mod">{fmtMod(modifier(form.constitution))}</span>
            </div>
            <div className="ability-block">
              <span className="ab-name">{ABILITY_SHORT.Intelligence}</span>
              <NumberInput className="ab-score-input" value={form.intelligence} onChange={(v) => updateField('intelligence', v)} />
              <span className="ab-mod">{fmtMod(modifier(form.intelligence))}</span>
            </div>
            <div className="ability-block">
              <span className="ab-name">{ABILITY_SHORT.Wisdom}</span>
              <NumberInput className="ab-score-input" value={form.wisdom} onChange={(v) => updateField('wisdom', v)} />
              <span className="ab-mod">{fmtMod(modifier(form.wisdom))}</span>
            </div>
            <div className="ability-block">
              <span className="ab-name">{ABILITY_SHORT.Charisma}</span>
              <NumberInput className="ab-score-input" value={form.charisma} onChange={(v) => updateField('charisma', v)} />
              <span className="ab-mod">{fmtMod(modifier(form.charisma))}</span>
            </div>
          </div>

          <div>
            <p className="subhead">Saving Throws</p>
            {current.saves.map((save) => {
              const score = (form as unknown as Record<string, number>)[save.ability.toLowerCase()] ?? 10;
              const mod = modifier(score) + (save.proficient && sheet ? sheet.proficiencyBonus : 0);
              return (
                <div key={save.id} className="list-row">
                  <span
                    className={`prof-dot${save.proficient ? ' on' : ''}`}
                    onClick={() => setSaveProficiency(DEMO_GAME_ID, characterId, save.id, !save.proficient)}
                  />
                  <span className="row-name">{save.ability}</span>
                  <span className="row-mod">{fmtMod(mod)}</span>
                </div>
              );
            })}
          </div>

          <div>
            <p className="subhead">Skills</p>
            {current.skills.map((skill) => {
              const ability = SKILL_ABILITY[skill.skillName] ?? 'Strength';
              const score = (form as unknown as Record<string, number>)[ability.toLowerCase()] ?? 10;
              const mod = modifier(score) + (skill.proficient && sheet ? sheet.proficiencyBonus : 0);
              return (
                <div key={skill.id} className="list-row">
                  <span
                    className={`prof-dot${skill.proficient ? ' on' : ''}`}
                    onClick={() => setSkillProficiency(DEMO_GAME_ID, characterId, skill.id, !skill.proficient)}
                  />
                  <span className="row-name">{skill.skillName}</span>
                  <span className="row-mod">{fmtMod(mod)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showLevelUp && levelUpForm && (
        <div className="dialog-overlay" onClick={() => setShowLevelUp(false)}>
          <div className="dialog-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Level Up</h3>
              <span className="modal-close" onClick={() => setShowLevelUp(false)}>✕</span>
            </div>
            <div className="field-grid">
              <div className="field">
                <label>New Level</label>
                <NumberInput
                  value={levelUpForm.level}
                  onChange={(level) => {
                    setLevelUpForm({ ...levelUpForm, level, proficiencyBonus: proficiencyBonusForLevel(level) });
                  }}
                />
              </div>
              <div className="field"><label>Hit Dice Roll</label><NumberInput value={hitDieRoll} onChange={setHitDieRoll} /></div>
              <div className="field full"><span className="hint" style={{ margin: 0 }}>Roll your Hit Die and enter the result — Constitution modifier and Proficiency Bonus are added automatically. Ability scores are edited directly above, any time, not just on level-up.</span></div>
              <div className="calc-box"><label>Hit Dice</label><div className="val">{form.hitDiceTotal || '—'}</div></div>
              <div className="calc-box"><label>Constitution Modifier</label><div className="val">{fmtMod(modifier(form.constitution))}</div></div>
              <div className="calc-box"><label>Proficiency Bonus</label><div className="val">{fmtMod(levelUpForm.proficiencyBonus)}</div></div>
              <div className="calc-box"><label>HP to Add</label><div className="val">{hitDieRoll + modifier(form.constitution) + levelUpForm.proficiencyBonus}</div></div>
            </div>
            <div className="form-actions" style={{ marginTop: 16 }}>
              <button className="btn-ghost" onClick={() => setShowLevelUp(false)}>Cancel</button>
              <button onClick={handleLevelUp}>Confirm Level Up</button>
            </div>
          </div>
        </div>
      )}

      <div className="sheet-section box">
        <h3 className="section-title">Attacks</h3>
        <table className="attack-table">
          <colgroup>
            <col />
            <col className="col-bonus" />
            <col />
            <col className="col-remove" />
          </colgroup>
          <thead><tr><th>Name</th><th>Atk Bonus</th><th>Damage</th><th></th></tr></thead>
          <tbody>
            {current.attacks.map((a) => (
              <tr key={a.id}>
                <td>
                  <input
                    defaultValue={a.name}
                    onBlur={(e) => e.target.value !== a.name && updateAttack(DEMO_GAME_ID, characterId, a.id, { name: e.target.value, atkBonus: a.atkBonus, damageType: a.damageType })}
                  />
                </td>
                <td>
                  <input
                    defaultValue={a.atkBonus}
                    onBlur={(e) => e.target.value !== a.atkBonus && updateAttack(DEMO_GAME_ID, characterId, a.id, { name: a.name, atkBonus: e.target.value, damageType: a.damageType })}
                  />
                </td>
                <td>
                  <input
                    defaultValue={a.damageType}
                    onBlur={(e) => e.target.value !== a.damageType && updateAttack(DEMO_GAME_ID, characterId, a.id, { name: a.name, atkBonus: a.atkBonus, damageType: e.target.value })}
                  />
                </td>
                <td><button className="row-remove" onClick={() => removeAttack(DEMO_GAME_ID, characterId, a.id)}>✕</button></td>
              </tr>
            ))}
            <tr className="attack-add-row">
              <td><input placeholder="Name" value={newAttack.name} onChange={(e) => setNewAttack({ ...newAttack, name: e.target.value })} onKeyDown={onEnter(() => void handleAddAttackRow())} /></td>
              <td><input placeholder="Atk Bonus" value={newAttack.atkBonus} onChange={(e) => setNewAttack({ ...newAttack, atkBonus: e.target.value })} onKeyDown={onEnter(() => void handleAddAttackRow())} /></td>
              <td><input placeholder="Damage" value={newAttack.damageType} onChange={(e) => setNewAttack({ ...newAttack, damageType: e.target.value })} onKeyDown={onEnter(() => void handleAddAttackRow())} /></td>
              <td><button className="row-remove" onClick={handleAddAttackRow}>+</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="sheet-section box">
        <h3 className="section-title">Equipment</h3>
        <div className="item-list">
          {current.items.map((item) => {
            const qty = itemQtyDrafts[item.id] ?? item.quantity;
            const commitItem = (patch: Partial<CreateItemInput>) =>
              updateItem(DEMO_GAME_ID, characterId, item.id, {
                category: item.category, name: item.name, quantity: item.quantity, weight: item.weight,
                description: item.description, ...patch,
              });
            return (
              <div key={item.id} className="item-row">
                <NumberInput
                  className="item-qty" min={1} value={qty}
                  onChange={(v) => setItemQtyDrafts((d) => ({ ...d, [item.id]: v }))}
                  onBlur={() => qty !== item.quantity && commitItem({ quantity: qty })}
                />
                <span className="item-qty-x">×</span>
                <input
                  className="item-name" defaultValue={item.name}
                  onBlur={(e) => e.target.value !== item.name && commitItem({ name: e.target.value })}
                />
                <input
                  className="item-category" placeholder="Category" defaultValue={item.category}
                  onBlur={(e) => e.target.value !== item.category && commitItem({ category: e.target.value })}
                />
                <button className="row-remove" onClick={() => removeItem(DEMO_GAME_ID, characterId, item.id)}>✕</button>
              </div>
            );
          })}
        </div>
        <div className="add-row">
          <input placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} onKeyDown={onEnter(() => void handleAddItemRow())} />
          <input placeholder="Category" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} onKeyDown={onEnter(() => void handleAddItemRow())} />
          <NumberInput className="item-qty" min={1} value={newItem.quantity} onChange={(v) => setNewItem({ ...newItem, quantity: v })} onKeyDown={onEnter(() => void handleAddItemRow())} />
          <button onClick={handleAddItemRow}>+ Add</button>
        </div>
      </div>

      {sheet && (
        <div className={`sheet-section box${sheet.spellcasting ? ' print-page-start' : ' no-print'}`}>
          <h3 className="section-title">Spellcasting</h3>
          {sheet.spellcasting ? (
            <div className="calc-row">
              <div className="calc-box"><label>Class</label><div className="val">{sheet.spellcasting.class}</div></div>
              <div className="calc-box"><label>Save DC</label><div className="val">{sheet.spellcasting.spellSaveDc}</div></div>
              <div className="calc-box"><label>Attack Bonus</label><div className="val">{fmtMod(sheet.spellcasting.spellAttackBonus)}</div></div>
            </div>
          ) : (
            <p className="hint">No spellcasting set for this level sheet.</p>
          )}
          <button className="add-btn" onClick={startSpellcastingForm}>
            {sheet.spellcasting ? 'Edit Spellcasting' : '+ Add Spellcasting'}
          </button>

          {showSpellcastingForm && spellcastingForm && (
            <div className="level-up-form">
              <div className="field"><label>Class</label><input value={spellcastingForm.class} onChange={(e) => setSpellcastingForm({ ...spellcastingForm, class: e.target.value })} /></div>
              <div className="field">
                <label>Ability</label>
                <CustomSelect
                  value={spellcastingForm.ability}
                  onChange={(v) => setSpellcastingForm({ ...spellcastingForm, ability: v })}
                  options={['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'].map((a) => ({ value: a, label: a }))}
                />
              </div>
              <div className="field"><label>Save DC</label><NumberInput value={spellcastingForm.spellSaveDc} onChange={(v) => setSpellcastingForm({ ...spellcastingForm, spellSaveDc: v })} /></div>
              <div className="field"><label>Attack Bonus</label><NumberInput value={spellcastingForm.spellAttackBonus} onChange={(v) => setSpellcastingForm({ ...spellcastingForm, spellAttackBonus: v })} /></div>
              <div className="form-actions">
                <button className="btn-ghost" onClick={() => setShowSpellcastingForm(false)}>Cancel</button>
                <button onClick={handleSaveSpellcasting}>Save</button>
              </div>
            </div>
          )}

          <p className="subhead">Spells</p>
          {sheet.spells.map((spell) => (
            <div key={spell.id}>
              <div className="spell-row">
                <span
                  className={`prof-dot${spell.prepared ? ' on' : ''}`}
                  onClick={() => setSpellPrepared(DEMO_GAME_ID, characterId, sheet.id, spell.id, !spell.prepared)}
                />
                <span
                  className={`spell-name${spell.isHomebrew ? ' homebrew' : ''}`}
                  onClick={() => spell.isHomebrew && setOpenSpellId(openSpellId === spell.id ? null : spell.id)}
                >
                  Lv{spell.level} {spell.name}
                </span>
                <button className="row-remove" onClick={() => removeSpell(DEMO_GAME_ID, characterId, sheet.id, spell.id)}>✕</button>
              </div>
              {spell.isHomebrew && openSpellId === spell.id && (
                <div className="spell-desc">{spell.description || 'No description.'}</div>
              )}
            </div>
          ))}
          <div className="add-row">
            <NumberInput min={0} max={9} style={{ maxWidth: 60 }} value={newSpell.level} onChange={(v) => setNewSpell({ ...newSpell, level: v })} onKeyDown={onEnter(() => void handleAddSpellRow())} />
            <input placeholder="Spell name" value={newSpell.name} onChange={(e) => setNewSpell({ ...newSpell, name: e.target.value })} onKeyDown={onEnter(() => void handleAddSpellRow())} />
            <label className="homebrew-check" style={{ margin: 0 }}>
              <input type="checkbox" checked={newSpell.isHomebrew} onChange={(e) => setNewSpell({ ...newSpell, isHomebrew: e.target.checked })} />
              Homebrew
            </label>
            <button onClick={handleAddSpellRow}>+ Add</button>
          </div>
          {newSpell.isHomebrew && (
            <div className="field full" style={{ marginTop: 8 }}>
              <label>Homebrew Description</label>
              <textarea value={newSpell.description ?? ''} onChange={(e) => setNewSpell({ ...newSpell, description: e.target.value })} />
            </div>
          )}

          <p className="subhead">Spell Slots</p>
          <div className="calc-row">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
              const slot = sheet.spellSlots.find((s) => s.level === level);
              if (!slot && level > (Math.max(0, ...sheet.spellSlots.map((s) => s.level)) + 1)) return null;
              return (
                <div key={level} className="calc-box">
                  <label>Level {level}</label>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    <NumberInput
                      min={0} className="spell-slot-input"
                      value={slot?.expended ?? 0}
                      onChange={(v) => upsertSpellSlot(DEMO_GAME_ID, characterId, sheet.id, { level, total: slot?.total ?? 0, expended: v })}
                    />
                    /
                    <NumberInput
                      min={0} className="spell-slot-input"
                      value={slot?.total ?? 0}
                      onChange={(v) => upsertSpellSlot(DEMO_GAME_ID, characterId, sheet.id, { level, total: v, expended: slot?.expended ?? 0 })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="sheet-section box print-page-start" onBlur={handleSave}>
        <h3 className="section-title">Personality &amp; Backstory</h3>
        <div className="personality-grid">
          <div className="field"><label>Personality Traits</label><AutoResizeTextarea value={form.personalityTraits} onChange={(e) => updateField('personalityTraits', e.target.value)} /></div>
          <div className="field"><label>Ideals</label><AutoResizeTextarea value={form.ideals} onChange={(e) => updateField('ideals', e.target.value)} /></div>
          <div className="field"><label>Bonds</label><AutoResizeTextarea value={form.bonds} onChange={(e) => updateField('bonds', e.target.value)} /></div>
          <div className="field"><label>Flaws</label><AutoResizeTextarea value={form.flaws} onChange={(e) => updateField('flaws', e.target.value)} /></div>
        </div>
        <div className="field full" style={{ marginTop: 12 }}>
          <label>Backstory</label>
          <AutoResizeTextarea value={form.backstory} onChange={(e) => updateField('backstory', e.target.value)} />
        </div>
        <div className="field full" style={{ marginTop: 12 }}>
          <label>Appearance</label>
          <AutoResizeTextarea value={form.appearance} onChange={(e) => updateField('appearance', e.target.value)} />
        </div>
        <p className="subhead">Physical Details</p>
        <div className="basics-grid">
          <div className="field"><label>Age</label><input value={form.age} onChange={(e) => updateField('age', e.target.value)} /></div>
          <div className="field"><label>Height</label><input value={form.height} onChange={(e) => updateField('height', e.target.value)} /></div>
          <div className="field"><label>Weight</label><input value={form.weight} onChange={(e) => updateField('weight', e.target.value)} /></div>
          <div className="field"><label>Eyes</label><input value={form.eyes} onChange={(e) => updateField('eyes', e.target.value)} /></div>
          <div className="field"><label>Skin</label><input value={form.skin} onChange={(e) => updateField('skin', e.target.value)} /></div>
          <div className="field"><label>Hair</label><input value={form.hair} onChange={(e) => updateField('hair', e.target.value)} /></div>
        </div>
        <div className="field full" style={{ marginTop: 12 }}>
          <label>Other Proficiencies &amp; Languages</label>
          <AutoResizeTextarea value={form.otherProficiencies} onChange={(e) => updateField('otherProficiencies', e.target.value)} />
        </div>
        <div className="field full" style={{ marginTop: 12 }}>
          <label>Allies &amp; Organizations</label>
          <AutoResizeTextarea value={form.alliesOrganizations} onChange={(e) => updateField('alliesOrganizations', e.target.value)} />
        </div>
        <div className="field full" style={{ marginTop: 12 }}>
          <label>Features &amp; Traits</label>
          <AutoResizeTextarea value={form.featuresTraits} onChange={(e) => updateField('featuresTraits', e.target.value)} />
        </div>
        <div className="field full" style={{ marginTop: 12 }}>
          <label>Additional Features</label>
          <AutoResizeTextarea value={form.additionalFeatures} onChange={(e) => updateField('additionalFeatures', e.target.value)} />
        </div>
        <div className="field full" style={{ marginTop: 12 }}>
          <label>Treasure</label>
          <AutoResizeTextarea value={form.treasure} onChange={(e) => updateField('treasure', e.target.value)} placeholder="Notable valuables — not tracked as inventory" />
        </div>
      </div>

      <div className="sheet-section box danger-zone no-print">
        <h3 className="section-title">Danger Zone</h3>
        <div className="danger-zone-row">
          <p className="hint" style={{ margin: 0 }}>
            {sheet
              ? `Permanently deletes Level ${sheet.level} — spells, spellcasting and spell slots on that level. Falls back to the previous level.`
              : 'No active level to delete.'}
          </p>
          <button
            className="btn-danger"
            disabled={!sheet || current.levelSheets.length <= 1}
            onClick={() => setShowDeleteLevelConfirm(true)}
          >
            Delete Current Level
          </button>
        </div>
        <div className="danger-zone-row">
          <p className="hint" style={{ margin: 0 }}>
            Permanently deletes {current.name} and everything on their sheet — level history, inventory, spells,
            all of it. This can't be undone.
          </p>
          <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>Delete Character</button>
        </div>
      </div>

      {showDeleteLevelConfirm && sheet && (
        <ConfirmDialog
          title="Delete this level?"
          message={`This permanently deletes Level ${sheet.level} and its spells, spellcasting, and spell slots. The active level falls back to the previous one. This can't be undone.`}
          confirmLabel="Delete Level"
          onConfirm={handleDeleteLevel}
          onCancel={() => setShowDeleteLevelConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete this character?"
          message={`This permanently deletes ${current.name} and everything on their sheet — level history, inventory, spells, all of it. This can't be undone.`}
          confirmLabel="Delete Character"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
