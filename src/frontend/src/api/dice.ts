import { apiClient } from './client.ts';
import type { DiceRoll } from '../types/dice.ts';

// Route shape matches DiceController: /api/games/{gameId}/dice — always the
// logged-in person's own history.
export const diceApi = {
  history: (gameId: string) => apiClient.get<DiceRoll[]>(`/games/${gameId}/dice`),
  roll: (gameId: string, sides: number, count: number, modifier: number) =>
    apiClient.post<DiceRoll>(`/games/${gameId}/dice/roll`, { sides, count, modifier }),
  // forUserId: DM only — the roll goes into that player's history.
  recordPhysical: (gameId: string, expression: string, total: number, forUserId: string | null) =>
    apiClient.post<DiceRoll>(`/games/${gameId}/dice/physical`, { expression, total, forUserId }),
};
