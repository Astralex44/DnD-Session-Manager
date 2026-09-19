import { create } from 'zustand';
import { monstersApi } from '../api/monsters.ts';
import { ApiError } from '../api/client.ts';
import type { Monster } from '../types/monster.ts';

interface MonstersState {
  monsters: Monster[];
  isLoading: boolean;
  error: string | null;

  fetchMonsters: (gameId: string) => Promise<void>;
  createMonster: (gameId: string, name: string, defaultHp: number, file: File) => Promise<boolean>;
  updateMonster: (gameId: string, monsterId: string, name: string, defaultHp: number, file: File | null) => Promise<boolean>;
  removeMonster: (gameId: string, monsterId: string) => Promise<void>;
}

export const useMonstersStore = create<MonstersState>((set, get) => ({
  monsters: [],
  isLoading: false,
  error: null,

  fetchMonsters: async (gameId) => {
    set({ isLoading: true, error: null });
    try {
      const monsters = await monstersApi.list(gameId);
      set({ monsters, isLoading: false });
    } catch (err) {
      set({ error: describeError(err), isLoading: false });
    }
  },

  createMonster: async (gameId, name, defaultHp, file) => {
    try {
      const created = await monstersApi.create(gameId, name, defaultHp, file);
      set({ monsters: [...get().monsters, created] });
      return true;
    } catch (err) {
      set({ error: describeError(err) });
      return false;
    }
  },

  updateMonster: async (gameId, monsterId, name, defaultHp, file) => {
    try {
      const updated = await monstersApi.update(gameId, monsterId, name, defaultHp, file);
      set({ monsters: get().monsters.map((m) => (m.id === monsterId ? updated : m)) });
      return true;
    } catch (err) {
      set({ error: describeError(err) });
      return false;
    }
  },

  removeMonster: async (gameId, monsterId) => {
    try {
      await monstersApi.remove(gameId, monsterId);
      set({ monsters: get().monsters.filter((m) => m.id !== monsterId) });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },
}));

function describeError(err: unknown): string {
  if (err instanceof ApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}
