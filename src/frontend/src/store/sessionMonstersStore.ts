import { create } from 'zustand';
import { sessionMonstersApi } from '../api/sessionMonsters.ts';
import { ApiError } from '../api/client.ts';
import type { CreateSessionMonsterInput, SessionMonster } from '../types/sessionMonster.ts';

interface SessionMonstersState {
  monsters: SessionMonster[];
  error: string | null;

  fetchMonsters: (gameId: string) => Promise<void>;
  addMonster: (gameId: string, input: CreateSessionMonsterInput) => Promise<boolean>;
  updateHp: (gameId: string, id: string, hpCurrent: number) => Promise<void>;
  removeMonster: (gameId: string, id: string) => Promise<void>;
  clear: (gameId: string) => Promise<void>;
}

export const useSessionMonstersStore = create<SessionMonstersState>((set, get) => ({
  monsters: [],
  error: null,

  fetchMonsters: async (gameId) => {
    try {
      const monsters = await sessionMonstersApi.list(gameId);
      set({ monsters });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  addMonster: async (gameId, input) => {
    try {
      const monster = await sessionMonstersApi.add(gameId, input);
      set({ monsters: [...get().monsters, monster] });
      return true;
    } catch (err) {
      set({ error: describeError(err) });
      return false;
    }
  },

  updateHp: async (gameId, id, hpCurrent) => {
    try {
      const monster = await sessionMonstersApi.updateHp(gameId, id, hpCurrent);
      set({ monsters: get().monsters.map((m) => (m.id === id ? monster : m)) });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  removeMonster: async (gameId, id) => {
    try {
      await sessionMonstersApi.remove(gameId, id);
      set({ monsters: get().monsters.filter((m) => m.id !== id) });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  clear: async (gameId) => {
    try {
      await sessionMonstersApi.clear(gameId);
      set({ monsters: [] });
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
