import { create } from 'zustand';
import { diceApi } from '../api/dice.ts';
import type { DiceRoll } from '../types/dice.ts';

interface DiceState {
  history: DiceRoll[];
  fetchHistory: (gameId: string) => Promise<void>;
  roll: (gameId: string, sides: number, count: number, modifier: number) => Promise<void>;
  recordPhysical: (gameId: string, expression: string, total: number, forUserId: string | null) => Promise<boolean>;
  clearHistory: (gameId: string) => Promise<void>;
  removeRoll: (gameId: string, rollId: string) => Promise<void>;
}

// The logged-in person's own last 5 rolls (FA-06, always private). Refetched
// on the "dice" live event, so a roll the DM enters for you appears at once.
export const useDiceStore = create<DiceState>((set, get) => ({
  history: [],

  fetchHistory: async (gameId) => {
    try {
      set({ history: await diceApi.history(gameId) });
    } catch {
      // Keep the last known history; the live event or fallback poll retries.
    }
  },

  roll: async (gameId, sides, count, modifier) => {
    const rolled = await diceApi.roll(gameId, sides, count, modifier);
    set({ history: [rolled, ...get().history].slice(0, 5) });
  },

  recordPhysical: async (gameId, expression, total, forUserId) => {
    try {
      const recorded = await diceApi.recordPhysical(gameId, expression, total, forUserId);
      if (!forUserId) set({ history: [recorded, ...get().history].slice(0, 5) });
      return true;
    } catch {
      return false;
    }
  },

  clearHistory: async (gameId) => {
    await diceApi.clear(gameId);
    set({ history: [] });
  },

  removeRoll: async (gameId, rollId) => {
    await diceApi.remove(gameId, rollId);
    set({ history: get().history.filter((r) => r.id !== rollId) });
  },
}));
