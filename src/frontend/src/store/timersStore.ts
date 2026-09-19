import { create } from 'zustand';
import { timersApi } from '../api/timers.ts';
import { ApiError } from '../api/client.ts';
import type { GameTimer, CreateTimerInput } from '../types/timer.ts';

interface TimersState {
  timers: GameTimer[];
  error: string | null;

  fetchTimers: (gameId: string) => Promise<void>;
  createTimer: (gameId: string, input: CreateTimerInput) => Promise<void>;
  removeTimer: (gameId: string, timerId: string) => Promise<void>;
}

export const useTimersStore = create<TimersState>((set, get) => ({
  timers: [],
  error: null,

  fetchTimers: async (gameId) => {
    try {
      const timers = await timersApi.list(gameId);
      set({ timers });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  createTimer: async (gameId, input) => {
    try {
      const created = await timersApi.create(gameId, input);
      set({ timers: [...get().timers, created] });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  removeTimer: async (gameId, timerId) => {
    try {
      await timersApi.remove(gameId, timerId);
      set({ timers: get().timers.filter((t) => t.id !== timerId) });
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
