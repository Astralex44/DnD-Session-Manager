import { apiClient } from './client.ts';
import type { Initiative, CreateInitiativeEntryInput } from '../types/initiative.ts';

// Route shape matches InitiativeController: /api/games/{gameId}/initiative
export const initiativeApi = {
  get: (gameId: string) => apiClient.get<Initiative>(`/games/${gameId}/initiative`),

  addEntry: (gameId: string, input: CreateInitiativeEntryInput) =>
    apiClient.post<Initiative>(`/games/${gameId}/initiative/entries`, input),

  removeEntry: (gameId: string, entryId: string) =>
    apiClient.delete<Initiative>(`/games/${gameId}/initiative/entries/${entryId}`),

  next: (gameId: string) => apiClient.post<Initiative>(`/games/${gameId}/initiative/next`, {}),

  clear: (gameId: string) => apiClient.post<Initiative>(`/games/${gameId}/initiative/clear`, {}),
};
