import { create } from 'zustand';
import { charactersApi } from '../api/characters.ts';
import { ApiError } from '../api/client.ts';
import type {
  Character,
  CharacterDetail,
  CreateAttackInput,
  CreateCharacterInput,
  CreateItemInput,
  CreateLevelSheetInput,
  CreateSpellInput,
  RemoveLevelSheetResult,
  UpdateCharacterInput,
  UpsertSpellcastingInput,
  UpsertSpellSlotInput,
} from '../types/character.ts';

interface CharactersState {
  characters: Character[];
  current: CharacterDetail | null;
  isLoading: boolean;
  error: string | null;

  fetchCharacters: (gameId: string) => Promise<void>;
  fetchCharacter: (gameId: string, characterId: string) => Promise<void>;
  createCharacter: (gameId: string, input: CreateCharacterInput) => Promise<Character | null>;
  updateCharacter: (gameId: string, characterId: string, input: UpdateCharacterInput) => Promise<boolean>;
  setCharacterStatus: (gameId: string, characterId: string, status: string) => Promise<void>;
  deleteCharacter: (gameId: string, characterId: string) => Promise<boolean>;

  setSkillProficiency: (gameId: string, characterId: string, skillId: string, proficient: boolean) => Promise<void>;
  setSaveProficiency: (gameId: string, characterId: string, saveId: string, proficient: boolean) => Promise<void>;

  addAttack: (gameId: string, characterId: string, input: CreateAttackInput) => Promise<void>;
  updateAttack: (gameId: string, characterId: string, attackId: string, input: CreateAttackInput) => Promise<void>;
  removeAttack: (gameId: string, characterId: string, attackId: string) => Promise<void>;

  addItem: (gameId: string, characterId: string, input: CreateItemInput) => Promise<void>;
  updateItem: (gameId: string, characterId: string, itemId: string, input: CreateItemInput) => Promise<void>;
  removeItem: (gameId: string, characterId: string, itemId: string) => Promise<void>;

  createLevelSheet: (gameId: string, characterId: string, input: CreateLevelSheetInput) => Promise<void>;
  setActiveLevelSheet: (gameId: string, characterId: string, levelSheetId: string) => Promise<void>;
  updateHpMax: (gameId: string, characterId: string, levelSheetId: string, hpMax: number) => Promise<void>;
  removeLevelSheet: (gameId: string, characterId: string, levelSheetId: string) => Promise<RemoveLevelSheetResult>;

  upsertSpellcasting: (gameId: string, characterId: string, levelSheetId: string, input: UpsertSpellcastingInput) => Promise<void>;
  addSpell: (gameId: string, characterId: string, levelSheetId: string, input: CreateSpellInput) => Promise<void>;
  setSpellPrepared: (gameId: string, characterId: string, levelSheetId: string, spellId: string, prepared: boolean) => Promise<void>;
  removeSpell: (gameId: string, characterId: string, levelSheetId: string, spellId: string) => Promise<void>;

  upsertSpellSlot: (gameId: string, characterId: string, levelSheetId: string, input: UpsertSpellSlotInput) => Promise<void>;
  removeSpellSlot: (gameId: string, characterId: string, levelSheetId: string, slotId: string) => Promise<void>;
}

export const useCharactersStore = create<CharactersState>((set, get) => {
  async function refetch(gameId: string, characterId: string) {
    try {
      const current = await charactersApi.get(gameId, characterId);
      set({ current });
    } catch (err) {
      set({ error: describeError(err) });
    }
  }

  return {
    characters: [],
    current: null,
    isLoading: false,
    error: null,

    fetchCharacters: async (gameId) => {
      set({ isLoading: true, error: null });
      try {
        const characters = await charactersApi.list(gameId);
        set({ characters, isLoading: false });
      } catch (err) {
        set({ error: describeError(err), isLoading: false });
      }
    },

    fetchCharacter: async (gameId, characterId) => {
      set({ isLoading: true, error: null, current: null });
      try {
        const current = await charactersApi.get(gameId, characterId);
        set({ current, isLoading: false });
      } catch (err) {
        set({ error: describeError(err), isLoading: false });
      }
    },

    createCharacter: async (gameId, input) => {
      try {
        const created = await charactersApi.create(gameId, input);
        set({ characters: [...get().characters, created] });
        return created;
      } catch (err) {
        set({ error: describeError(err) });
        return null;
      }
    },

    updateCharacter: async (gameId, characterId, input) => {
      try {
        const current = await charactersApi.update(gameId, characterId, input);
        set({ current });
        return true;
      } catch (err) {
        set({ error: describeError(err) });
        return false;
      }
    },

    setCharacterStatus: async (gameId, characterId, status) => {
      const previous = get().characters;
      set({
        characters: previous.map((c) => (c.id === characterId ? { ...c, status } : c)),
      });
      try {
        await charactersApi.setStatus(gameId, characterId, status);
      } catch (err) {
        set({ characters: previous, error: describeError(err) });
      }
    },

    deleteCharacter: async (gameId, characterId) => {
      try {
        await charactersApi.remove(gameId, characterId);
        set({
          characters: get().characters.filter((c) => c.id !== characterId),
          current: get().current?.id === characterId ? null : get().current,
        });
        return true;
      } catch (err) {
        set({ error: describeError(err) });
        return false;
      }
    },

    setSkillProficiency: async (gameId, characterId, skillId, proficient) => {
      const current = get().current;
      if (!current) return;
      set({
        current: { ...current, skills: current.skills.map((s) => (s.id === skillId ? { ...s, proficient } : s)) },
      });
      try {
        await charactersApi.setSkillProficiency(gameId, characterId, skillId, proficient);
      } catch (err) {
        set({ error: describeError(err) });
        await refetch(gameId, characterId);
      }
    },

    setSaveProficiency: async (gameId, characterId, saveId, proficient) => {
      const current = get().current;
      if (!current) return;
      set({
        current: { ...current, saves: current.saves.map((s) => (s.id === saveId ? { ...s, proficient } : s)) },
      });
      try {
        await charactersApi.setSaveProficiency(gameId, characterId, saveId, proficient);
      } catch (err) {
        set({ error: describeError(err) });
        await refetch(gameId, characterId);
      }
    },

    addAttack: async (gameId, characterId, input) => {
      try {
        await charactersApi.addAttack(gameId, characterId, input);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    updateAttack: async (gameId, characterId, attackId, input) => {
      try {
        await charactersApi.updateAttack(gameId, characterId, attackId, input);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    removeAttack: async (gameId, characterId, attackId) => {
      try {
        await charactersApi.removeAttack(gameId, characterId, attackId);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    addItem: async (gameId, characterId, input) => {
      try {
        await charactersApi.addItem(gameId, characterId, input);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    updateItem: async (gameId, characterId, itemId, input) => {
      try {
        await charactersApi.updateItem(gameId, characterId, itemId, input);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    removeItem: async (gameId, characterId, itemId) => {
      try {
        await charactersApi.removeItem(gameId, characterId, itemId);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    createLevelSheet: async (gameId, characterId, input) => {
      try {
        await charactersApi.createLevelSheet(gameId, characterId, input);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    setActiveLevelSheet: async (gameId, characterId, levelSheetId) => {
      try {
        const current = await charactersApi.setActiveLevelSheet(gameId, characterId, levelSheetId);
        set({ current });
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    updateHpMax: async (gameId, characterId, levelSheetId, hpMax) => {
      try {
        await charactersApi.updateHpMax(gameId, characterId, levelSheetId, hpMax);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    removeLevelSheet: async (gameId, characterId, levelSheetId) => {
      try {
        const result = await charactersApi.removeLevelSheet(gameId, characterId, levelSheetId);
        if (result.character) set({ current: result.character });
        return result;
      } catch (err) {
        if (err instanceof ApiError) {
          try {
            const parsed = JSON.parse(err.message) as RemoveLevelSheetResult;
            if (typeof parsed.success === 'boolean') return parsed;
          } catch {
            // not JSON — fall through to the generic message below
          }
        }
        return { success: false, error: describeError(err), character: null };
      }
    },

    upsertSpellcasting: async (gameId, characterId, levelSheetId, input) => {
      try {
        await charactersApi.upsertSpellcasting(gameId, characterId, levelSheetId, input);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    addSpell: async (gameId, characterId, levelSheetId, input) => {
      try {
        await charactersApi.addSpell(gameId, characterId, levelSheetId, input);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    setSpellPrepared: async (gameId, characterId, levelSheetId, spellId, prepared) => {
      try {
        await charactersApi.setSpellPrepared(gameId, characterId, levelSheetId, spellId, prepared);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    removeSpell: async (gameId, characterId, levelSheetId, spellId) => {
      try {
        await charactersApi.removeSpell(gameId, characterId, levelSheetId, spellId);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    upsertSpellSlot: async (gameId, characterId, levelSheetId, input) => {
      try {
        await charactersApi.upsertSpellSlot(gameId, characterId, levelSheetId, input);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    removeSpellSlot: async (gameId, characterId, levelSheetId, slotId) => {
      try {
        await charactersApi.removeSpellSlot(gameId, characterId, levelSheetId, slotId);
        await refetch(gameId, characterId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },
  };
});

function describeError(err: unknown): string {
  if (err instanceof ApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}
