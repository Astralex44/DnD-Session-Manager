import { create } from 'zustand';
import { initiativeApi } from '../api/initiative.ts';
import { ApiError } from '../api/client.ts';
import type { Initiative, CreateInitiativeEntryInput } from '../types/initiative.ts';

interface InitiativeState {
  initiative: Initiative;
  error: string | null;

  fetchInitiative: (gameId: string) => Promise<void>;
  addEntry: (gameId: string, input: CreateInitiativeEntryInput) => Promise<void>;
  removeEntry: (gameId: string, entryId: string) => Promise<void>;
  nextTurn: (gameId: string) => Promise<void>;
  clear: (gameId: string) => Promise<void>;
}

export const useInitiativeStore = create<InitiativeState>((set) => ({
  initiative: { round: 1, entries: [] },
  error: null,

  fetchInitiative: async (gameId) => {
    try {
      const initiative = await initiativeApi.get(gameId);
      set({ initiative });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  addEntry: async (gameId, input) => {
    try {
      const initiative = await initiativeApi.addEntry(gameId, input);
      set({ initiative });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  removeEntry: async (gameId, entryId) => {
    try {
      const initiative = await initiativeApi.removeEntry(gameId, entryId);
      set({ initiative });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  nextTurn: async (gameId) => {
    try {
      const initiative = await initiativeApi.next(gameId);
      set({ initiative });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  clear: async (gameId) => {
    try {
      const initiative = await initiativeApi.clear(gameId);
      set({ initiative });
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
