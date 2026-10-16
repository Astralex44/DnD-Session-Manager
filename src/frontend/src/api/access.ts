import { apiClient } from './client.ts';
import type { GameAccessList, GameInvite } from '../types/auth.ts';

// Route shape matches GameAccessListController: /api/games/{gameId}/access (DM only)
export const accessApi = {
  get: (gameId: string) => apiClient.get<GameAccessList>(`/games/${gameId}/access`),
  invite: (gameId: string, discordHandle: string) =>
    apiClient.post<GameInvite>(`/games/${gameId}/access/invites`, { discordHandle }),
  removeInvite: (gameId: string, inviteId: string) =>
    apiClient.delete<void>(`/games/${gameId}/access/invites/${inviteId}`),
  removeMember: (gameId: string, memberId: string) =>
    apiClient.delete<void>(`/games/${gameId}/access/members/${memberId}`),
};
