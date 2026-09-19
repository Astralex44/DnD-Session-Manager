import { create } from 'zustand';
import { sessionsApi } from '../api/sessions.ts';
import { ApiError } from '../api/client.ts';
import type { Session, UpsertSessionInput } from '../types/session.ts';

interface SessionsState {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;

  fetchSessions: (gameId: string) => Promise<void>;
  createSession: (gameId: string, input: UpsertSessionInput) => Promise<boolean>;
  updateSession: (gameId: string, sessionId: string, input: UpsertSessionInput) => Promise<boolean>;
  removeSession: (gameId: string, sessionId: string) => Promise<void>;
}

export const useSessionsStore = create<SessionsState>((set, get) => ({
  sessions: [],
  isLoading: false,
  error: null,

  fetchSessions: async (gameId) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await sessionsApi.list(gameId);
      set({ sessions, isLoading: false });
    } catch (err) {
      set({ error: describeError(err), isLoading: false });
    }
  },

  createSession: async (gameId, input) => {
    try {
      const created = await sessionsApi.create(gameId, input);
      set({ sessions: [created, ...get().sessions] });
      return true;
    } catch (err) {
      set({ error: describeError(err) });
      return false;
    }
  },

  updateSession: async (gameId, sessionId, input) => {
    try {
      const updated = await sessionsApi.update(gameId, sessionId, input);
      set({ sessions: get().sessions.map((s) => (s.id === sessionId ? updated : s)) });
      return true;
    } catch (err) {
      set({ error: describeError(err) });
      return false;
    }
  },

  removeSession: async (gameId, sessionId) => {
    try {
      await sessionsApi.remove(gameId, sessionId);
      set({ sessions: get().sessions.filter((s) => s.id !== sessionId) });
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
