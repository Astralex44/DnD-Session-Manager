import { apiClient } from './client.ts';
import type { Session, UpsertSessionInput } from '../types/session.ts';

// Route shape matches SessionsController: /api/games/{gameId}/sessions
export const sessionsApi = {
  list: (gameId: string) => apiClient.get<Session[]>(`/games/${gameId}/sessions`),

  create: (gameId: string, input: UpsertSessionInput) =>
    apiClient.post<Session>(`/games/${gameId}/sessions`, input),

  update: (gameId: string, sessionId: string, input: UpsertSessionInput) =>
    apiClient.put<Session>(`/games/${gameId}/sessions/${sessionId}`, input),

  remove: (gameId: string, sessionId: string) => apiClient.delete<void>(`/games/${gameId}/sessions/${sessionId}`),
};
