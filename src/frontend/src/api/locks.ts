import { apiClient } from './client.ts';
import type { AccessCodeResult, AccessLockStatus, ResourceType } from '../types/accessLock.ts';

// Route shape matches AccessLocksController: /api/games/{gameId}/locks/{resourceType}/{resourceKey}
export const locksApi = {
  status: (gameId: string, resourceType: ResourceType, resourceKey: string) =>
    apiClient.get<AccessLockStatus>(`/games/${gameId}/locks/${resourceType}/${encodeURIComponent(resourceKey)}`),

  setCode: (gameId: string, resourceType: ResourceType, resourceKey: string, newCode: string, currentCode?: string) =>
    apiClient.post<AccessCodeResult>(`/games/${gameId}/locks/${resourceType}/${encodeURIComponent(resourceKey)}/set`, { newCode, currentCode }),

  verify: (gameId: string, resourceType: ResourceType, resourceKey: string, code: string) =>
    apiClient.post<AccessCodeResult>(`/games/${gameId}/locks/${resourceType}/${encodeURIComponent(resourceKey)}/verify`, { code }),
};
