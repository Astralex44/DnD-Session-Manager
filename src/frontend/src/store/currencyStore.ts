import { create } from 'zustand';
import { currencyApi } from '../api/currency.ts';
import { ApiError } from '../api/client.ts';
import type { CharacterCurrency, CurrencyDenomination, UpsertCurrencyDenominationInput } from '../types/currency.ts';

interface CurrencyState {
  denominations: CurrencyDenomination[];
  wallets: Record<string, CharacterCurrency[]>;
  isLoading: boolean;
  error: string | null;

  fetchDenominations: (gameId: string) => Promise<void>;
  createDenomination: (gameId: string, input: UpsertCurrencyDenominationInput) => Promise<boolean>;
  updateDenomination: (gameId: string, id: string, input: UpsertCurrencyDenominationInput) => Promise<boolean>;
  removeDenomination: (gameId: string, id: string) => Promise<void>;
  reorderDenominations: (gameId: string, orderedIds: string[]) => Promise<void>;

  fetchWallet: (gameId: string, characterId: string) => Promise<void>;
  setWalletEntry: (gameId: string, characterId: string, denominationId: string, quantity: number) => Promise<boolean>;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  denominations: [],
  wallets: {},
  isLoading: false,
  error: null,

  fetchDenominations: async (gameId) => {
    set({ isLoading: true, error: null });
    try {
      const denominations = await currencyApi.list(gameId);
      set({ denominations, isLoading: false });
    } catch (err) {
      set({ error: describeError(err), isLoading: false });
    }
  },

  createDenomination: async (gameId, input) => {
    try {
      const created = await currencyApi.create(gameId, input);
      set({ denominations: [...get().denominations, created] });
      return true;
    } catch (err) {
      set({ error: describeError(err) });
      return false;
    }
  },

  updateDenomination: async (gameId, id, input) => {
    try {
      const updated = await currencyApi.update(gameId, id, input);
      set({ denominations: get().denominations.map((d) => (d.id === id ? updated : d)) });
      return true;
    } catch (err) {
      set({ error: describeError(err) });
      return false;
    }
  },

  removeDenomination: async (gameId, id) => {
    try {
      await currencyApi.remove(gameId, id);
      set({ denominations: get().denominations.filter((d) => d.id !== id) });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  reorderDenominations: async (gameId, orderedIds) => {
    try {
      const reordered = await currencyApi.reorder(gameId, orderedIds);
      set({ denominations: reordered });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  fetchWallet: async (gameId, characterId) => {
    try {
      const wallet = await currencyApi.getWallet(gameId, characterId);
      set({ wallets: { ...get().wallets, [characterId]: wallet } });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },

  setWalletEntry: async (gameId, characterId, denominationId, quantity) => {
    try {
      await currencyApi.setWalletEntry(gameId, characterId, denominationId, quantity);
      const wallet = await currencyApi.getWallet(gameId, characterId);
      set({ wallets: { ...get().wallets, [characterId]: wallet } });
      return true;
    } catch (err) {
      set({ error: describeError(err) });
      return false;
    }
  },
}));

function describeError(err: unknown): string {
  if (err instanceof ApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}
