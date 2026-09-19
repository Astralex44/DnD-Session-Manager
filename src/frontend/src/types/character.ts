export interface Character {
  id: string;
  gameId: string;
  name: string;
  race: string;
  class: string;
  playerName: string;
  status: string;
  hpCurrent: number;
  hpMax: number | null;
  armorClass: number;
  activeLevelSheetId: string | null;
  level: number | null;
}

export interface Skill {
  id: string;
  skillName: string;
  proficient: boolean;
}

export interface Save {
  id: string;
  ability: string;
  proficient: boolean;
}

export interface Attack {
  id: string;
  name: string;
  atkBonus: string;
  damageType: string;
}

export interface Item {
  id: string;
  category: string;
  name: string;
  quantity: number;
  weight: number;
  description: string;
}

export interface Spellcasting {
  id: string;
  class: string;
  ability: string;
  spellSaveDc: number;
  spellAttackBonus: number;
}

export interface Spell {
  id: string;
  level: number;
  name: string;
  prepared: boolean;
  description: string | null;
  isHomebrew: boolean;
}

export interface SpellSlot {
  id: string;
  level: number;
  total: number;
  expended: number;
}

export interface LevelSheetSummary {
  id: string;
  level: number;
  hpMax: number;
}

export interface LevelSheetDetail {
  id: string;
  level: number;
  hpMax: number;
  proficiencyBonus: number;
  createdAt: string;
  spellcasting: Spellcasting | null;
  spells: Spell[];
  spellSlots: SpellSlot[];
}

export interface RemoveLevelSheetResult {
  success: boolean;
  error: string | null;
  character: CharacterDetail | null;
}

export interface CharacterDetail {
  id: string;
  gameId: string;
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  playerName: string;
  experiencePoints: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  inspiration: boolean;
  armorClass: number;
  initiative: number;
  speed: number;
  hpCurrent: number;
  hpTemporary: number;
  hitDiceTotal: string;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  passivePerception: number;
  otherProficiencies: string;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  backstory: string;
  appearance: string;
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
  alliesOrganizations: string;
  additionalFeatures: string;
  featuresTraits: string;
  treasure: string;
  status: string;
  activeLevelSheetId: string | null;
  levelSheets: LevelSheetSummary[];
  activeLevelSheet: LevelSheetDetail | null;
  skills: Skill[];
  saves: Save[];
  attacks: Attack[];
  items: Item[];
}

export interface CreateCharacterInput {
  name: string;
  race: string;
  class: string;
  playerName: string;
  background: string;
  alignment: string;
  experiencePoints: number;
  level: number;
  hpMax: number;
  armorClass: number;
  speed: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencyBonus: number;
}

export type UpdateCharacterInput = Omit<
  CharacterDetail,
  'id' | 'gameId' | 'activeLevelSheetId' | 'levelSheets' | 'activeLevelSheet' | 'skills' | 'saves' | 'attacks' | 'items'
>;

export interface CreateAttackInput {
  name: string;
  atkBonus: string;
  damageType: string;
}

export interface CreateItemInput {
  category: string;
  name: string;
  quantity: number;
  weight: number;
  description: string;
}

export interface CreateLevelSheetInput {
  level: number;
  hpToAdd: number;
  proficiencyBonus: number;
  makeActive: boolean;
}

export interface UpsertSpellcastingInput {
  class: string;
  ability: string;
  spellSaveDc: number;
  spellAttackBonus: number;
}

export interface CreateSpellInput {
  level: number;
  name: string;
  prepared: boolean;
  description: string | null;
  isHomebrew: boolean;
}

export interface UpsertSpellSlotInput {
  level: number;
  total: number;
  expended: number;
}

export const SKILL_NAMES = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History',
  'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception',
  'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival',
] as const;

export const ABILITIES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'] as const;
