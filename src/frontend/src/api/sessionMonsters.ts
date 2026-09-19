import { apiClient } from './client.ts';
import type { CreateSessionMonsterInput, SessionMonster } from '../types/sessionMonster.ts';

// Route shape matches SessionMonstersController: /api/games/{gameId}/session-monsters
export const sessionMonstersApi = {
  list: (gameId: string) => apiClient.get<SessionMonster[]>(`/games/${gameId}/session-monsters`),

  add: (gameId: string, input: CreateSessionMonsterInput) =>
    apiClient.post<SessionMonster>(`/games/${gameId}/session-monsters`, input),

  updateHp: (gameId: string, id: string, hpCurrent: number) =>
    apiClient.patch<SessionMonster>(`/games/${gameId}/session-monsters/${id}/hp`, { hpCurrent }),

  remove: (gameId: string, id: string) =>
    apiClient.delete<void>(`/games/${gameId}/session-monsters/${id}`),

  clear: (gameId: string) => apiClient.post<void>(`/games/${gameId}/session-monsters/clear`, {}),
};
