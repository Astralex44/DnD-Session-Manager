import { apiClient } from './client.ts';
import type { Quote, CreateQuoteInput } from '../types/quote.ts';

// Route shape matches QuotesController on the backend: /api/games/{gameId}/quotes
export const quotesApi = {
  list: (gameId: string) => apiClient.get<Quote[]>(`/games/${gameId}/quotes`),

  create: (gameId: string, input: CreateQuoteInput) =>
    apiClient.post<Quote>(`/games/${gameId}/quotes`, input),

  toggleShared: (gameId: string, quoteId: string) =>
    apiClient.patch<Quote>(`/games/${gameId}/quotes/${quoteId}/toggle-shared`, {}),

  setSession: (gameId: string, quoteId: string, sessionId: string | null) =>
    apiClient.patch<Quote>(`/games/${gameId}/quotes/${quoteId}/session`, { sessionId }),

  setCharacter: (gameId: string, quoteId: string, characterId: string | null) =>
    apiClient.patch<Quote>(`/games/${gameId}/quotes/${quoteId}/character`, { characterId }),

  remove: (gameId: string, quoteId: string) =>
    apiClient.delete<void>(`/games/${gameId}/quotes/${quoteId}`),
};
