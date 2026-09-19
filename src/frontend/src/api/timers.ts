import { apiClient } from './client.ts';
import type { GameTimer, CreateTimerInput } from '../types/timer.ts';

// Route shape matches GameTimersController: /api/games/{gameId}/timers
export const timersApi = {
  list: (gameId: string) => apiClient.get<GameTimer[]>(`/games/${gameId}/timers`),

  create: (gameId: string, input: CreateTimerInput) =>
    apiClient.post<GameTimer>(`/games/${gameId}/timers`, input),

  remove: (gameId: string, timerId: string) =>
    apiClient.delete<void>(`/games/${gameId}/timers/${timerId}`),
};
