import { API_BASE_URL, apiClient } from './client.ts';
import { accessCodeHeaders, getStoredCode } from '../lib/accessLock.ts';
import type {
  Attack,
  Character,
  CharacterDetail,
  CreateAttackInput,
  CreateCharacterInput,
  CreateItemInput,
  CreateLevelSheetInput,
  CreateSpellInput,
  Item,
  LevelSheetDetail,
  RemoveLevelSheetResult,
  Save,
  Skill,
  Spell,
  Spellcasting,
  SpellSlot,
  UpdateCharacterInput,
  UpsertSpellcastingInput,
  UpsertSpellSlotInput,
} from '../types/character.ts';

// Route shape matches CharactersController on the backend:
// /api/games/{gameId}/characters
export const charactersApi = {
  list: (gameId: string) => apiClient.get<Character[]>(`/games/${gameId}/characters`),

  get: (gameId: string, characterId: string) =>
    apiClient.get<CharacterDetail>(`/games/${gameId}/characters/${characterId}`, accessCodeHeaders('Character', characterId)),

  create: (gameId: string, input: CreateCharacterInput) =>
    apiClient.post<Character>(`/games/${gameId}/characters`, input),

  update: (gameId: string, characterId: string, input: UpdateCharacterInput) =>
    apiClient.patch<CharacterDetail>(`/games/${gameId}/characters/${characterId}`, input, accessCodeHeaders('Character', characterId)),

  setStatus: (gameId: string, characterId: string, status: string) =>
    apiClient.patch<Character>(`/games/${gameId}/characters/${characterId}/status`, { status }),

  remove: (gameId: string, characterId: string) =>
    apiClient.delete<void>(`/games/${gameId}/characters/${characterId}`, accessCodeHeaders('Character', characterId)),

  // Plain <a href> download, can't attach a header — the code (when set)
  // rides along as a query param instead, which the backend also accepts.
  pdfUrl: (gameId: string, characterId: string) => {
    const code = getStoredCode('Character', characterId);
    const suffix = code ? `?code=${encodeURIComponent(code)}` : '';
    return `${API_BASE_URL}/games/${gameId}/characters/${characterId}/pdf${suffix}`;
  },

  setSkillProficiency: (gameId: string, characterId: string, skillId: string, proficient: boolean) =>
    apiClient.patch<Skill>(`/games/${gameId}/characters/${characterId}/skills/${skillId}`, { proficient }),

  setSaveProficiency: (gameId: string, characterId: string, saveId: string, proficient: boolean) =>
    apiClient.patch<Save>(`/games/${gameId}/characters/${characterId}/saves/${saveId}`, { proficient }),

  addAttack: (gameId: string, characterId: string, input: CreateAttackInput) =>
    apiClient.post<Attack>(`/games/${gameId}/characters/${characterId}/attacks`, input),

  updateAttack: (gameId: string, characterId: string, attackId: string, input: CreateAttackInput) =>
    apiClient.put<Attack>(`/games/${gameId}/characters/${characterId}/attacks/${attackId}`, input),

  removeAttack: (gameId: string, characterId: string, attackId: string) =>
    apiClient.delete<void>(`/games/${gameId}/characters/${characterId}/attacks/${attackId}`),

  addItem: (gameId: string, characterId: string, input: CreateItemInput) =>
    apiClient.post<Item>(`/games/${gameId}/characters/${characterId}/items`, input),

  updateItem: (gameId: string, characterId: string, itemId: string, input: CreateItemInput) =>
    apiClient.put<Item>(`/games/${gameId}/characters/${characterId}/items/${itemId}`, input),

  removeItem: (gameId: string, characterId: string, itemId: string) =>
    apiClient.delete<void>(`/games/${gameId}/characters/${characterId}/items/${itemId}`),

  createLevelSheet: (gameId: string, characterId: string, input: CreateLevelSheetInput) =>
    apiClient.post<LevelSheetDetail>(`/games/${gameId}/characters/${characterId}/level-sheets`, input),

  setActiveLevelSheet: (gameId: string, characterId: string, levelSheetId: string) =>
    apiClient.patch<CharacterDetail>(`/games/${gameId}/characters/${characterId}/active-level-sheet`, {
      levelSheetId,
    }),

  updateHpMax: (gameId: string, characterId: string, levelSheetId: string, hpMax: number) =>
    apiClient.patch<LevelSheetDetail>(
      `/games/${gameId}/characters/${characterId}/level-sheets/${levelSheetId}/hp-max`,
      { hpMax },
    ),

  removeLevelSheet: (gameId: string, characterId: string, levelSheetId: string) =>
    apiClient.delete<RemoveLevelSheetResult>(`/games/${gameId}/characters/${characterId}/level-sheets/${levelSheetId}`),

  upsertSpellcasting: (gameId: string, characterId: string, levelSheetId: string, input: UpsertSpellcastingInput) =>
    apiClient.put<Spellcasting>(
      `/games/${gameId}/characters/${characterId}/level-sheets/${levelSheetId}/spellcasting`,
      input,
    ),

  addSpell: (gameId: string, characterId: string, levelSheetId: string, input: CreateSpellInput) =>
    apiClient.post<Spell>(`/games/${gameId}/characters/${characterId}/level-sheets/${levelSheetId}/spells`, input),

  setSpellPrepared: (gameId: string, characterId: string, levelSheetId: string, spellId: string, prepared: boolean) =>
    apiClient.patch<Spell>(
      `/games/${gameId}/characters/${characterId}/level-sheets/${levelSheetId}/spells/${spellId}`,
      { proficient: prepared },
    ),

  removeSpell: (gameId: string, characterId: string, levelSheetId: string, spellId: string) =>
    apiClient.delete<void>(
      `/games/${gameId}/characters/${characterId}/level-sheets/${levelSheetId}/spells/${spellId}`,
    ),

  upsertSpellSlot: (gameId: string, characterId: string, levelSheetId: string, input: UpsertSpellSlotInput) =>
    apiClient.put<SpellSlot>(
      `/games/${gameId}/characters/${characterId}/level-sheets/${levelSheetId}/spell-slots`,
      input,
    ),

  removeSpellSlot: (gameId: string, characterId: string, levelSheetId: string, slotId: string) =>
    apiClient.delete<void>(
      `/games/${gameId}/characters/${characterId}/level-sheets/${levelSheetId}/spell-slots/${slotId}`,
    ),
};
