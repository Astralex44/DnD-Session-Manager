import { create } from 'zustand';
import { quotesApi } from '../api/quotes.ts';
import { ApiError } from '../api/client.ts';
import type { Quote, CreateQuoteInput } from '../types/quote.ts';

interface QuotesState {
  quotes: Quote[];
  isLoading: boolean;
  error: string | null;

  fetchQuotes: (gameId: string) => Promise<void>;
  addQuote: (gameId: string, input: CreateQuoteInput) => Promise<void>;
  toggleShared: (gameId: string, quoteId: string) => Promise<void>;
  setQuoteSession: (gameId: string, quoteId: string, sessionId: string | null) => Promise<void>;
  setQuoteCharacter: (gameId: string, quoteId: string, characterId: string | null) => Promise<void>;
  removeQuote: (gameId: string, quoteId: string) => Promise<void>;
}

export const useQuotesStore = create<QuotesState>((set, get) => ({
  quotes: [],
  isLoading: false,
  error: null,

  fetchQuotes: async (gameId: string) => {
    set({ isLoading: true, error: null });
    try {
      const quotes = await quotesApi.list(gameId);
      set({ quotes, isLoading: false });
    } catch (err) {
      set({ error: describeError(err), isLoading: false });
    }
  },

  addQuote: async (gameId: string, input: CreateQuoteInput) => {
    try {
      const created = await quotesApi.create(gameId, input);
      set({ quotes: [created, ...get().quotes] });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  toggleShared: async (gameId: string, quoteId: string) => {
    // optimistic update, reverted if the request fails
    const previous = get().quotes;
    set({
      quotes: previous.map((q) => (q.id === quoteId ? { ...q, isShared: !q.isShared } : q)),
    });
    try {
      await quotesApi.toggleShared(gameId, quoteId);
    } catch (err) {
      set({ quotes: previous, error: describeError(err) });
    }
  },

  setQuoteSession: async (gameId: string, quoteId: string, sessionId: string | null) => {
    const previous = get().quotes;
    try {
      const updated = await quotesApi.setSession(gameId, quoteId, sessionId);
      set({ quotes: previous.map((q) => (q.id === quoteId ? updated : q)) });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  setQuoteCharacter: async (gameId: string, quoteId: string, characterId: string | null) => {
    const previous = get().quotes;
    try {
      const updated = await quotesApi.setCharacter(gameId, quoteId, characterId);
      set({ quotes: previous.map((q) => (q.id === quoteId ? updated : q)) });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  removeQuote: async (gameId: string, quoteId: string) => {
    const previous = get().quotes;
    set({ quotes: previous.filter((q) => q.id !== quoteId) });
    try {
      await quotesApi.remove(gameId, quoteId);
    } catch (err) {
      set({ quotes: previous, error: describeError(err) });
    }
  },
}));

function describeError(err: unknown): string {
  if (err instanceof ApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}
