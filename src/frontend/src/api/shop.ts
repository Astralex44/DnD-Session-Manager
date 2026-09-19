import { apiClient } from './client.ts';
import type {
  CreatePurchaseInput,
  CreateShopInput,
  CreateShopItemInput,
  Purchase,
  Shop,
  ShopItem,
  UpsertShopShareInput,
} from '../types/shop.ts';

// Route shape matches ShopsController: /api/games/{gameId}/shops
export const shopApi = {
  list: (gameId: string) => apiClient.get<Shop[]>(`/games/${gameId}/shops`),

  get: (gameId: string, shopId: string) => apiClient.get<Shop>(`/games/${gameId}/shops/${shopId}`),

  create: (gameId: string, input: CreateShopInput) => apiClient.post<Shop>(`/games/${gameId}/shops`, input),

  update: (gameId: string, shopId: string, input: CreateShopInput) =>
    apiClient.put<Shop>(`/games/${gameId}/shops/${shopId}`, input),

  remove: (gameId: string, shopId: string) => apiClient.delete<void>(`/games/${gameId}/shops/${shopId}`),

  setShare: (gameId: string, shopId: string, characterId: string, input: UpsertShopShareInput) =>
    apiClient.put(`/games/${gameId}/shops/${shopId}/shares/${characterId}`, input),

  removeShare: (gameId: string, shopId: string, characterId: string) =>
    apiClient.delete<void>(`/games/${gameId}/shops/${shopId}/shares/${characterId}`),

  addItem: (gameId: string, shopId: string, input: CreateShopItemInput) =>
    apiClient.post<ShopItem>(`/games/${gameId}/shops/${shopId}/items`, input),

  updateItem: (gameId: string, shopId: string, itemId: string, input: CreateShopItemInput) =>
    apiClient.put<ShopItem>(`/games/${gameId}/shops/${shopId}/items/${itemId}`, input),

  removeItem: (gameId: string, shopId: string, itemId: string) =>
    apiClient.delete<void>(`/games/${gameId}/shops/${shopId}/items/${itemId}`),

  purchase: (gameId: string, shopId: string, itemId: string, input: CreatePurchaseInput) =>
    apiClient.post<Purchase>(`/games/${gameId}/shops/${shopId}/items/${itemId}/purchases`, input),
};
