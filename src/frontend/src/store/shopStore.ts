import { create } from 'zustand';
import { shopApi } from '../api/shop.ts';
import { ApiError } from '../api/client.ts';
import type { CreatePurchaseInput, CreateShopInput, CreateShopItemInput, Shop, UpsertShopShareInput } from '../types/shop.ts';

interface ShopsState {
  shops: Shop[];
  isLoading: boolean;
  error: string | null;
  purchaseMessage: string | null;

  fetchShops: (gameId: string) => Promise<void>;
  createShop: (gameId: string, input: CreateShopInput) => Promise<boolean>;
  updateShop: (gameId: string, shopId: string, input: CreateShopInput) => Promise<boolean>;
  removeShop: (gameId: string, shopId: string) => Promise<void>;
  setShare: (gameId: string, shopId: string, characterId: string, input: UpsertShopShareInput) => Promise<void>;
  removeShare: (gameId: string, shopId: string, characterId: string) => Promise<void>;
  addItem: (gameId: string, shopId: string, input: CreateShopItemInput) => Promise<boolean>;
  updateItem: (gameId: string, shopId: string, itemId: string, input: CreateShopItemInput) => Promise<boolean>;
  removeItem: (gameId: string, shopId: string, itemId: string) => Promise<void>;
  purchase: (gameId: string, shopId: string, itemId: string, input: CreatePurchaseInput) => Promise<boolean>;
  clearPurchaseMessage: () => void;
}

export const useShopsStore = create<ShopsState>((set, get) => {
  async function refetch(gameId: string) {
    try {
      const shops = await shopApi.list(gameId);
      set({ shops });
    } catch (err) {
      set({ error: describeError(err) });
    }
  }

  return {
    shops: [],
    isLoading: false,
    error: null,
    purchaseMessage: null,

    fetchShops: async (gameId) => {
      set({ isLoading: true, error: null });
      try {
        const shops = await shopApi.list(gameId);
        set({ shops, isLoading: false });
      } catch (err) {
        set({ error: describeError(err), isLoading: false });
      }
    },

    createShop: async (gameId, input) => {
      try {
        const created = await shopApi.create(gameId, input);
        set({ shops: [...get().shops, created] });
        return true;
      } catch (err) {
        set({ error: describeError(err) });
        return false;
      }
    },

    updateShop: async (gameId, shopId, input) => {
      try {
        const updated = await shopApi.update(gameId, shopId, input);
        set({ shops: get().shops.map((s) => (s.id === shopId ? updated : s)) });
        return true;
      } catch (err) {
        set({ error: describeError(err) });
        return false;
      }
    },

    removeShop: async (gameId, shopId) => {
      try {
        await shopApi.remove(gameId, shopId);
        set({ shops: get().shops.filter((s) => s.id !== shopId) });
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    setShare: async (gameId, shopId, characterId, input) => {
      try {
        await shopApi.setShare(gameId, shopId, characterId, input);
        await refetch(gameId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    removeShare: async (gameId, shopId, characterId) => {
      try {
        await shopApi.removeShare(gameId, shopId, characterId);
        await refetch(gameId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    addItem: async (gameId, shopId, input) => {
      try {
        await shopApi.addItem(gameId, shopId, input);
        await refetch(gameId);
        return true;
      } catch (err) {
        set({ error: describeError(err) });
        return false;
      }
    },

    updateItem: async (gameId, shopId, itemId, input) => {
      try {
        await shopApi.updateItem(gameId, shopId, itemId, input);
        await refetch(gameId);
        return true;
      } catch (err) {
        set({ error: describeError(err) });
        return false;
      }
    },

    removeItem: async (gameId, shopId, itemId) => {
      try {
        await shopApi.removeItem(gameId, shopId, itemId);
        await refetch(gameId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    purchase: async (gameId, shopId, itemId, input) => {
      try {
        await shopApi.purchase(gameId, shopId, itemId, input);
        await refetch(gameId);
        set({ purchaseMessage: 'Purchase complete.' });
        return true;
      } catch (err) {
        set({ purchaseMessage: describePurchaseError(err) });
        return false;
      }
    },

    clearPurchaseMessage: () => set({ purchaseMessage: null }),
  };
});

function describeError(err: unknown): string {
  if (err instanceof ApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

function describePurchaseError(err: unknown): string {
  if (err instanceof ApiError) {
    try {
      const parsed = JSON.parse(err.message) as { error?: string };
      if (parsed.error) return parsed.error;
    } catch {
      // not JSON — fall through to the raw message
    }
    return err.message;
  }
  return describeError(err);
}
