import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CustomSelect } from '../components/CustomSelect.tsx';
import { NumberInput } from '../components/NumberInput.tsx';
import { useCharactersStore } from '../store/charactersStore.ts';
import { ABILITIES, SKILL_NAMES } from '../types/character.ts';
import type { CreateAttackInput } from '../types/character.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
];

const SKILL_ABILITY: Record<string, string> = {
  Acrobatics: 'Dexterity', 'Animal Handling': 'Wisdom', Arcana: 'Intelligence', Athletics: 'Strength',
  Deception: 'Charisma', History: 'Intelligence', Insight: 'Wisdom', Intimidation: 'Charisma',
  Investigation: 'Intelligence', Medicine: 'Wisdom', Nature: 'Intelligence', Perception: 'Wisdom',
  Performance: 'Charisma', Persuasion: 'Charisma', Religion: 'Intelligence',
  'Sleight of Hand': 'Dexterity', Stealth: 'Dexterity', Survival: 'Wisdom',
};

// House rule (confirmed with the DM, deviates from RAW): above 10, standard
// 5e pairing (every 2 points = +1). Below 10, a full -1 per point instead of
// per 2 — low stats hurt more at this table. 9=-1, 8=-2, 7=-3, 6=-4, etc.
function modifier(score: number): number {
  return score >= 10 ? Math.floor((score - 10) / 2) : score - 10;
}
function fmtMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

interface SpellDraft {
  name: string;
  level: number;
  isHomebrew: boolean;
  description: string;
}

const STEPS = ['Basics', 'Abilities', 'Skills & Saves', 'Equipment', 'Features', 'Attacks', 'Magic', 'Personality'];

export function CharacterCreateWizardPage() {
  const navigate = useNavigate();
  const {
    createCharacter, fetchCharacter, setSkillProficiency, setSaveProficiency, addItem, addAttack,
    updateCharacter, upsertSpellcasting, addSpell,
  } = useCharactersStore();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1
  const [name, setName] = useState('');
  const [playerName, setPlayerName] = useState('Severin');
  const [race, setRace] = useState('');
  const [charClass, setCharClass] = useState('');
  const [background, setBackground] = useState('');
  const [alignment, setAlignment] = useState('Lawful Good');
  const [level, setLevel] = useState(1);
  const [experiencePoints, setExperiencePoints] = useState(0);
  const [proficiencyBonus, setProficiencyBonus] = useState(2);

  // Step 2
  const [abilities, setAbilities] = useState({ Strength: 10, Dexterity: 10, Constitution: 10, Intelligence: 10, Wisdom: 10, Charisma: 10 });
  const [hpMax, setHpMax] = useState(10);
  const [armorClass, setArmorClass] = useState(10);
  const [otherProficiencies, setOtherProficiencies] = useState('');

  // Step 3
  const [saveProf, setSaveProf] = useState<Record<string, boolean>>(() => Object.fromEntries(ABILITIES.map((a) => [a, false])));
  const [skillProf, setSkillProf] = useState<Record<string, boolean>>(() => Object.fromEntries(SKILL_NAMES.map((s) => [s, false])));
  const [passivePerception, setPassivePerception] = useState(10);

  // Step 4
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  // Step 5
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  // Step 6 (Attacks)
  const [attacks, setAttacks] = useState<CreateAttackInput[]>([]);
  const [newAttack, setNewAttack] = useState<CreateAttackInput>({ name: '', atkBonus: '', damageType: '' });

  // Step 6
  const [hasMagic, setHasMagic] = useState(false);
  const [spellAbility, setSpellAbility] = useState('Charisma');
  const [cantrips, setCantrips] = useState<SpellDraft[]>([]);
  const [newCantrip, setNewCantrip] = useState('');
  const [newCantripHomebrew, setNewCantripHomebrew] = useState(false);
  const [newCantripDesc, setNewCantripDesc] = useState('');
  const [spells, setSpells] = useState<SpellDraft[]>([]);
  const [newSpell, setNewSpell] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState(1);
  const [newSpellHomebrew, setNewSpellHomebrew] = useState(false);
  const [newSpellDesc, setNewSpellDesc] = useState('');

  // Step 7
  const [personalityTraits, setPersonalityTraits] = useState('');
  const [ideals, setIdeals] = useState('');
  const [bonds, setBonds] = useState('');
  const [flaws, setFlaws] = useState('');
  const [backstory, setBackstory] = useState('');
  const [appearance, setAppearance] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [eyes, setEyes] = useState('');
  const [skin, setSkin] = useState('');
  const [hair, setHair] = useState('');
  const [alliesOrganizations, setAlliesOrganizations] = useState('');
  const [additionalFeatures, setAdditionalFeatures] = useState('');
  const [treasure, setTreasure] = useState('');

  const abilityMod = modifier(abilities[spellAbility as keyof typeof abilities]);
  const spellSaveDc = 8 + proficiencyBonus + abilityMod;
  const spellAttackBonus = abilityMod + proficiencyBonus;

  function goStep(n: number) {
    setStep(Math.max(1, Math.min(STEPS.length, n)));
  }

  async function handleSubmit() {
    if (!name.trim() || !charClass.trim()) {
      setErrorMsg('Name and class are required (see Basics).');
      setStep(1);
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const created = await createCharacter(DEMO_GAME_ID, {
        name, race, class: charClass, playerName, background, alignment, experiencePoints,
        level, hpMax, armorClass, speed: 30,
        strength: abilities.Strength, dexterity: abilities.Dexterity, constitution: abilities.Constitution,
        intelligence: abilities.Intelligence, wisdom: abilities.Wisdom, charisma: abilities.Charisma,
        proficiencyBonus,
      });
      if (!created) throw new Error('Character creation failed.');

      await fetchCharacter(DEMO_GAME_ID, created.id);
      const detail = useCharactersStore.getState().current;
      if (!detail) throw new Error('Could not load the newly created character.');

      for (const save of detail.saves) {
        if (saveProf[save.ability]) await setSaveProficiency(DEMO_GAME_ID, created.id, save.id, true);
      }
      for (const skill of detail.skills) {
        if (skillProf[skill.skillName]) await setSkillProficiency(DEMO_GAME_ID, created.id, skill.id, true);
      }
      for (const itemName of items) {
        await addItem(DEMO_GAME_ID, created.id, { category: '', name: itemName, quantity: 1, weight: 0, description: '' });
      }
      for (const attack of attacks) {
        await addAttack(DEMO_GAME_ID, created.id, attack);
      }

      const latest = useCharactersStore.getState().current ?? detail;
      await updateCharacter(DEMO_GAME_ID, created.id, {
        ...latest,
        featuresTraits: features.join('\n'),
        personalityTraits, ideals, bonds, flaws, backstory,
        passivePerception, otherProficiencies,
        appearance, age, height, weight, eyes, skin, hair,
        alliesOrganizations, additionalFeatures, treasure,
      });

      if (hasMagic && detail.activeLevelSheetId) {
        const sheetId = detail.activeLevelSheetId;
        await upsertSpellcasting(DEMO_GAME_ID, created.id, sheetId, {
          class: charClass, ability: spellAbility, spellSaveDc, spellAttackBonus,
        });
        for (const c of cantrips) {
          await addSpell(DEMO_GAME_ID, created.id, sheetId, {
            level: 0, name: c.name, prepared: false, isHomebrew: c.isHomebrew, description: c.isHomebrew ? c.description : null,
          });
        }
        for (const s of spells) {
          await addSpell(DEMO_GAME_ID, created.id, sheetId, {
            level: s.level, name: s.name, prepared: false, isHomebrew: s.isHomebrew, description: s.isHomebrew ? s.description : null,
          });
        }
      }

      navigate(`/character/${created.id}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong creating the character.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (step < STEPS.length) goStep(step + 1);
    else void handleSubmit();
  }

  function handleAddItem() {
    if (!newItem.trim()) return;
    setItems((s) => [...s, newItem.trim()]);
    setNewItem('');
  }

  function handleAddFeature() {
    if (!newFeature.trim()) return;
    setFeatures((s) => [...s, newFeature.trim()]);
    setNewFeature('');
  }

  function handleAddAttack() {
    if (!newAttack.name.trim()) return;
    setAttacks((s) => [...s, newAttack]);
    setNewAttack({ name: '', atkBonus: '', damageType: '' });
  }

  function handleAddCantrip() {
    if (!newCantrip.trim()) return;
    setCantrips((s) => [...s, { name: newCantrip.trim(), level: 0, isHomebrew: newCantripHomebrew, description: newCantripDesc }]);
    setNewCantrip(''); setNewCantripHomebrew(false); setNewCantripDesc('');
  }

  function handleAddSpell() {
    if (!newSpell.trim()) return;
    setSpells((s) => [...s, { name: newSpell.trim(), level: newSpellLevel, isHomebrew: newSpellHomebrew, description: newSpellDesc }]);
    setNewSpell(''); setNewSpellHomebrew(false); setNewSpellDesc('');
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
    <div className="wizard-page">
      <div className="sheet-header">
        <h2>Create New Character</h2>
        <Link className="back-link" to="/characters">‹ Cancel</Link>
      </div>

      <div className="stepper">
        {STEPS.map((label, i) => {
          const n = i + 1;
          return (
            <div
              key={label}
              className={`step-dot${n === step ? ' active' : ''}${n < step ? ' done' : ''}`}
              onClick={() => goStep(n)}
            >
              {n} · {label}
            </div>
          );
        })}
      </div>

      {errorMsg && <div className="error-banner">{errorMsg}</div>}

      {step === 1 && (
        <div className="panel-card">
          <h2>Basics</h2>
          <p className="hint">Based on the official D&amp;D 5e template (FA-02). The only template available for Release 1.</p>
          <div className="field-grid">
            <div className="field"><label>Character Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fenn Ashgrove" /></div>
            <div className="field"><label>Player Name</label><input value={playerName} onChange={(e) => setPlayerName(e.target.value)} /></div>
            <div className="field"><label>Race</label><input value={race} onChange={(e) => setRace(e.target.value)} placeholder="e.g. Halfling" /></div>
            <div className="field"><label>Class</label><input value={charClass} onChange={(e) => setCharClass(e.target.value)} placeholder="e.g. Rogue" /></div>
            <div className="field"><label>Background</label><input value={background} onChange={(e) => setBackground(e.target.value)} placeholder="e.g. Criminal" /></div>
            <div className="field">
              <label>Alignment</label>
              <CustomSelect value={alignment} onChange={setAlignment} options={ALIGNMENTS.map((a) => ({ value: a, label: a }))} />
            </div>
            <div className="field"><label>Starting Level</label><NumberInput min={1} max={20} value={level} onChange={setLevel} /></div>
            <div className="field"><label>Experience Points</label><NumberInput min={0} value={experiencePoints} onChange={setExperiencePoints} /></div>
            <div className="field"><label>Proficiency Bonus</label><NumberInput min={1} max={10} value={proficiencyBonus} onChange={setProficiencyBonus} /></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="panel-card">
          <h2>Abilities</h2>
          <p className="hint">Enter values freely, e.g. via point buy or a rolling method, however you handle it at the table.</p>
          <div className="points-remaining">For reference only, not an enforced rule: ability total currently {Object.values(abilities).reduce((a, b) => a + b, 0)}</div>
          <div className="ability-grid">
            {ABILITIES.map((a) => (
              <div key={a} className="ability-card">
                <label>{a}</label>
                <div className="ability-stepper">
                  <button onClick={() => setAbilities((s) => ({ ...s, [a]: Math.max(3, s[a as keyof typeof s] - 1) }))}>−</button>
                  <span className="val">{abilities[a as keyof typeof abilities]}</span>
                  <button onClick={() => setAbilities((s) => ({ ...s, [a]: Math.min(18, s[a as keyof typeof s] + 1) }))}>+</button>
                </div>
                <div className="ability-card-mod">{fmtMod(modifier(abilities[a as keyof typeof abilities]))}</div>
              </div>
            ))}
          </div>
          <p className="hint" style={{ marginTop: -8 }}>
            House rule: below 10, modifiers drop 1 per point instead of 1 per 2 (9=−1, 8=−2, 7=−3…). Standard 5e above 10.
          </p>
          <div className="field-grid">
            <div className="field"><label>Hit Points Maximum</label><NumberInput min={1} value={hpMax} onChange={setHpMax} /></div>
            <div className="field"><label>Armor Class</label><NumberInput min={1} value={armorClass} onChange={setArmorClass} /></div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="panel-card">
          <h2>Skills &amp; Saving Throws</h2>
          <p className="hint">Mark which saving throws and skills your character is proficient in. Bonuses are calculated automatically.</p>
          <p className="hint">
            House rule: below 10, modifiers drop 1 per point instead of 1 per 2 (9=−1, 8=−2, 7=−3…). Standard 5e above 10.
          </p>
          <div className="saves-skills-columns">
            <div>
              <p className="hint" style={{ marginTop: 0, marginBottom: 8 }}>Saving Throws</p>
              {ABILITIES.map((a) => {
                const mod = modifier(abilities[a as keyof typeof abilities]) + (saveProf[a] ? proficiencyBonus : 0);
                return (
                  <div key={a} className="list-row">
                    <span className={`prof-dot${saveProf[a] ? ' on' : ''}`} onClick={() => setSaveProf((s) => ({ ...s, [a]: !s[a] }))} />
                    <span className="row-name">{a}</span>
                    <span className="row-mod">{fmtMod(mod)}</span>
                  </div>
                );
              })}
            </div>
            <div>
              <p className="hint" style={{ marginTop: 0, marginBottom: 8 }}>Skills</p>
              {SKILL_NAMES.map((skillName) => {
                const ability = SKILL_ABILITY[skillName];
                const mod = modifier(abilities[ability as keyof typeof abilities]) + (skillProf[skillName] ? proficiencyBonus : 0);
                return (
                  <div key={skillName} className="list-row">
                    <span className={`prof-dot${skillProf[skillName] ? ' on' : ''}`} onClick={() => setSkillProf((s) => ({ ...s, [skillName]: !s[skillName] }))} />
                    <span className="row-name">{skillName}</span>
                    <span className="row-mod">{fmtMod(mod)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="field-grid" style={{ marginTop: 18 }}>
            <div className="field">
              <label>Passive Perception</label>
              <NumberInput min={0} value={passivePerception} onChange={setPassivePerception} />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="panel-card">
          <h2>Equipment</h2>
          <p className="hint">Enter starting equipment. No import from a previous character — every new character starts at zero.</p>
          <div className="equip-list">
            {items.map((it, i) => (
              <div key={i} className="equip-row">
                <span>{it}</span>
                <button className="equip-remove" onClick={() => setItems((s) => s.filter((_, idx) => idx !== i))}>✕</button>
              </div>
            ))}
          </div>
          <div className="add-equip-row">
            <input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={onEnter(handleAddItem)} placeholder="Add an item, e.g. Rope (50 ft)" />
            <button onClick={handleAddItem}>+ Add</button>
          </div>
          <p className="hint" style={{ marginTop: 14, marginBottom: 0 }}>
            Starting coin purse isn't set up here yet — the currency &amp; shop system tracks gold/silver/copper
            (etc.) as separate, non-convertible counts and isn't built yet.
          </p>
        </div>
      )}

      {step === 5 && (
        <div className="panel-card">
          <h2>Features</h2>
          <p className="hint">Class and race features, e.g. "Battle Cry" or "Darkvision". Just a simple reference list, no usage/cooldown logic behind it.</p>
          <div className="equip-list">
            {features.map((f, i) => (
              <div key={i} className="equip-row">
                <span>{f}</span>
                <button className="equip-remove" onClick={() => setFeatures((s) => s.filter((_, idx) => idx !== i))}>✕</button>
              </div>
            ))}
          </div>
          <div className="add-equip-row">
            <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={onEnter(handleAddFeature)} placeholder="Add a feature, e.g. Tough" />
            <button onClick={handleAddFeature}>+ Add</button>
          </div>
          <div className="unsure-note">Display only, no usage/cooldown tracking. Whether a feature has been used this session stays the player's own responsibility, same as on a paper sheet.</div>
        </div>
      )}

      {step === 6 && (
        <div className="panel-card">
          <h2>Attacks</h2>
          <p className="hint">Weapon or spell attacks — name, attack bonus, and damage/type.</p>
          <table className="attack-table">
            <colgroup>
              <col />
              <col className="col-bonus" />
              <col />
              <col className="col-remove" />
            </colgroup>
            <thead><tr><th>Name</th><th>Atk Bonus</th><th>Damage / Type</th><th></th></tr></thead>
            <tbody>
              {attacks.map((a, i) => (
                <tr key={i}>
                  <td><input value={a.name} onChange={(e) => setAttacks((s) => s.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} /></td>
                  <td><input value={a.atkBonus} onChange={(e) => setAttacks((s) => s.map((x, idx) => idx === i ? { ...x, atkBonus: e.target.value } : x))} /></td>
                  <td><input value={a.damageType} onChange={(e) => setAttacks((s) => s.map((x, idx) => idx === i ? { ...x, damageType: e.target.value } : x))} /></td>
                  <td><button className="equip-remove" onClick={() => setAttacks((s) => s.filter((_, idx) => idx !== i))}>✕</button></td>
                </tr>
              ))}
              <tr className="attack-add-row">
                <td><input placeholder="Name, e.g. Greatsword" value={newAttack.name} onChange={(e) => setNewAttack({ ...newAttack, name: e.target.value })} onKeyDown={onEnter(handleAddAttack)} /></td>
                <td><input placeholder="e.g. +5" value={newAttack.atkBonus} onChange={(e) => setNewAttack({ ...newAttack, atkBonus: e.target.value })} onKeyDown={onEnter(handleAddAttack)} /></td>
                <td><input placeholder="e.g. 2d6 Slashing" value={newAttack.damageType} onChange={(e) => setNewAttack({ ...newAttack, damageType: e.target.value })} onKeyDown={onEnter(handleAddAttack)} /></td>
                <td><button className="equip-remove" onClick={handleAddAttack}>+</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {step === 7 && (
        <div className="panel-card">
          <h2>Magic</h2>
          <p className="hint">Only fill this in if your character can cast spells. Optional.</p>
          <div className="toggle-row">
            <input type="checkbox" id="hasMagic" checked={hasMagic} onChange={(e) => setHasMagic(e.target.checked)} />
            <label htmlFor="hasMagic">My character can cast spells</label>
          </div>

          {hasMagic && (
            <>
              <div className="field-grid">
                <div className="field">
                  <label>Spellcasting Ability</label>
                  <CustomSelect value={spellAbility} onChange={setSpellAbility} options={ABILITIES.map((a) => ({ value: a, label: a }))} />
                </div>
                <div className="field"><label>Proficiency Bonus</label><NumberInput value={proficiencyBonus} onChange={setProficiencyBonus} /></div>
              </div>
              <div className="ability-grid" style={{ marginTop: 14 }}>
                <div className="ability-card"><label>Ability Modifier</label><div className="val">{fmtMod(abilityMod)}</div></div>
                <div className="ability-card"><label>Spell Save DC</label><div className="val">{spellSaveDc}</div></div>
                <div className="ability-card"><label>Spell Attack Bonus</label><div className="val">{fmtMod(spellAttackBonus)}</div></div>
              </div>

              <p className="hint" style={{ marginTop: 20, marginBottom: 8 }}>Cantrips — unlimited uses, never need to be prepared, no spell slots required</p>
              <div className="equip-list">
                {cantrips.map((c, i) => (
                  <div key={i} className="equip-row">
                    <span className="name-wrap">
                      <span>{c.name}</span>
                      {c.isHomebrew && <span className="homebrew-badge">Homebrew</span>}
                    </span>
                    <button className="equip-remove" onClick={() => setCantrips((s) => s.filter((_, idx) => idx !== i))}>✕</button>
                  </div>
                ))}
              </div>
              <div className="add-equip-row">
                <input value={newCantrip} onChange={(e) => setNewCantrip(e.target.value)} onKeyDown={onEnter(handleAddCantrip)} placeholder="Add a cantrip, e.g. Mage Hand" />
                <button onClick={handleAddCantrip}>+ Add</button>
              </div>
              <label className="homebrew-check">
                <input type="checkbox" checked={newCantripHomebrew} onChange={(e) => setNewCantripHomebrew(e.target.checked)} />
                This is homebrew, not from an official rulebook
              </label>
              {newCantripHomebrew && (
                <div className="homebrew-desc-row">
                  <textarea value={newCantripDesc} onChange={(e) => setNewCantripDesc(e.target.value)} placeholder="Short description of what it does" />
                </div>
              )}

              <p className="hint" style={{ marginTop: 20, marginBottom: 8 }}>Leveled spells — require spell slots, some need to be prepared</p>
              <div className="equip-list">
                {spells.map((s, i) => (
                  <div key={i} className="equip-row">
                    <span className="name-wrap">
                      <span>{s.name} (Level {s.level})</span>
                      {s.isHomebrew && <span className="homebrew-badge">Homebrew</span>}
                    </span>
                    <button className="equip-remove" onClick={() => setSpells((arr) => arr.filter((_, idx) => idx !== i))}>✕</button>
                  </div>
                ))}
              </div>
              <div className="add-equip-row">
                <input value={newSpell} onChange={(e) => setNewSpell(e.target.value)} onKeyDown={onEnter(handleAddSpell)} placeholder="Add a spell, e.g. Magic Missile" />
                <NumberInput min={1} max={9} style={{ maxWidth: 70 }} value={newSpellLevel} onChange={setNewSpellLevel} onKeyDown={onEnter(handleAddSpell)} />
                <button onClick={handleAddSpell}>+ Add</button>
              </div>
              <label className="homebrew-check">
                <input type="checkbox" checked={newSpellHomebrew} onChange={(e) => setNewSpellHomebrew(e.target.checked)} />
                This is homebrew, not from an official rulebook
              </label>
              {newSpellHomebrew && (
                <div className="homebrew-desc-row">
                  <textarea value={newSpellDesc} onChange={(e) => setNewSpellDesc(e.target.value)} placeholder="Short description of what it does" />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {step === 8 && (
        <div className="panel-card">
          <h2>Personality &amp; Background</h2>
          <p className="hint">Optional, but helps the DM weave your character into the story.</p>
          <div className="personality-grid">
            <div className="field"><label>Personality Traits</label><textarea value={personalityTraits} onChange={(e) => setPersonalityTraits(e.target.value)} placeholder="How does your character carry themselves?" /></div>
            <div className="field"><label>Ideals</label><textarea value={ideals} onChange={(e) => setIdeals(e.target.value)} placeholder="What does your character stand for?" /></div>
            <div className="field"><label>Bonds</label><textarea value={bonds} onChange={(e) => setBonds(e.target.value)} placeholder="What ties your character to the world?" /></div>
            <div className="field"><label>Flaws</label><textarea value={flaws} onChange={(e) => setFlaws(e.target.value)} placeholder="What is your character's weakness?" /></div>
          </div>
          <div className="field full" style={{ marginTop: 14 }}>
            <label>Backstory</label>
            <textarea style={{ minHeight: 110 }} value={backstory} onChange={(e) => setBackstory(e.target.value)} placeholder="Where does your character come from, what drives them?" />
          </div>
          <div className="field full" style={{ marginTop: 14 }}>
            <label>Appearance</label>
            <textarea value={appearance} onChange={(e) => setAppearance(e.target.value)} placeholder="What does your character look like?" />
          </div>
          <p className="subhead">Physical Details</p>
          <div className="basics-grid">
            <div className="field"><label>Age</label><input value={age} onChange={(e) => setAge(e.target.value)} /></div>
            <div className="field"><label>Height</label><input value={height} onChange={(e) => setHeight(e.target.value)} /></div>
            <div className="field"><label>Weight</label><input value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
            <div className="field"><label>Eyes</label><input value={eyes} onChange={(e) => setEyes(e.target.value)} /></div>
            <div className="field"><label>Skin</label><input value={skin} onChange={(e) => setSkin(e.target.value)} /></div>
            <div className="field"><label>Hair</label><input value={hair} onChange={(e) => setHair(e.target.value)} /></div>
          </div>
          <div className="field full" style={{ marginTop: 14 }}>
            <label>Other Proficiencies &amp; Languages</label>
            <textarea value={otherProficiencies} onChange={(e) => setOtherProficiencies(e.target.value)} placeholder="e.g. Thieves' Tools, Common, Elvish" />
          </div>
          <div className="field full" style={{ marginTop: 14 }}>
            <label>Allies &amp; Organizations</label>
            <textarea value={alliesOrganizations} onChange={(e) => setAlliesOrganizations(e.target.value)} placeholder="Groups, contacts, or people your character can call on" />
          </div>
          <div className="field full" style={{ marginTop: 14 }}>
            <label>Additional Features</label>
            <textarea value={additionalFeatures} onChange={(e) => setAdditionalFeatures(e.target.value)} placeholder="Anything else worth noting" />
          </div>
          <div className="field full" style={{ marginTop: 14 }}>
            <label>Treasure</label>
            <textarea value={treasure} onChange={(e) => setTreasure(e.target.value)} placeholder="Notable valuables — not tracked as inventory" />
          </div>
        </div>
      )}

      <div className="step-nav">
        <button className={`btn-ghost${step === 1 ? ' invisible' : ''}`} onClick={() => goStep(step - 1)}>‹ Back</button>
        <button className="btn-primary" onClick={handleNext} disabled={submitting}>
          {step === STEPS.length ? (submitting ? 'Creating…' : 'Create Character ✓') : 'Next ›'}
        </button>
      </div>
    </div>
  );
}
