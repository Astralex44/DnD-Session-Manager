import { apiClient } from './client.ts';
import type { CharacterCurrency, CurrencyDenomination, UpsertCurrencyDenominationInput } from '../types/currency.ts';

// Route shape matches CurrencyController: /api/games/{gameId}/currency-denominations
// and the wallet endpoints nested under CharactersController: .../characters/{id}/currency
export const currencyApi = {
  list: (gameId: string) => apiClient.get<CurrencyDenomination[]>(`/games/${gameId}/currency-denominations`),

  create: (gameId: string, input: UpsertCurrencyDenominationInput) =>
    apiClient.post<CurrencyDenomination>(`/games/${gameId}/currency-denominations`, input),

  update: (gameId: string, id: string, input: UpsertCurrencyDenominationInput) =>
    apiClient.put<CurrencyDenomination>(`/games/${gameId}/currency-denominations/${id}`, input),

  remove: (gameId: string, id: string) => apiClient.delete<void>(`/games/${gameId}/currency-denominations/${id}`),
  // Where the coin is still used — shop prices block deleting it, coins in purses are lost with it.
  usage: (gameId: string, id: string) =>
    apiClient.get<{ shopItems: { shop: string; item: string }[]; charactersHolding: number; totalHeld: number }>(`/games/${gameId}/currency-denominations/${id}/usage`),

  reorder: (gameId: string, orderedIds: string[]) =>
    apiClient.put<CurrencyDenomination[]>(`/games/${gameId}/currency-denominations/reorder`, { orderedIds }),

  getWallet: (gameId: string, characterId: string) =>
    apiClient.get<CharacterCurrency[]>(`/games/${gameId}/characters/${characterId}/currency`),

  setWalletEntry: (gameId: string, characterId: string, denominationId: string, quantity: number) =>
    apiClient.put<CharacterCurrency>(`/games/${gameId}/characters/${characterId}/currency/${denominationId}`, { quantity }),
};
