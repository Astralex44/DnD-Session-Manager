import { API_BASE_URL, apiClient } from './client.ts';
import { uploadForm as upload } from '../lib/upload.ts';
import type { Monster } from '../types/monster.ts';

// Route shape matches MonstersController: /api/games/{gameId}/monsters
export const monstersApi = {
  list: (gameId: string) => apiClient.get<Monster[]>(`/games/${gameId}/monsters`),

  create: (gameId: string, name: string, defaultHp: number, file: File) => {
    const form = new FormData();
    form.set('Name', name);
    form.set('DefaultHp', String(defaultHp));
    form.set('File', file);
    return upload<Monster>(`/games/${gameId}/monsters`, 'POST', form);
  },

  update: (gameId: string, monsterId: string, name: string, defaultHp: number, file: File | null) => {
    const form = new FormData();
    form.set('Name', name);
    form.set('DefaultHp', String(defaultHp));
    if (file) form.set('File', file);
    return upload<Monster>(`/games/${gameId}/monsters/${monsterId}`, 'PUT', form);
  },

  remove: (gameId: string, monsterId: string) => apiClient.delete<void>(`/games/${gameId}/monsters/${monsterId}`),

  fileUrl: (fileUrl: string) => `${API_BASE_URL.replace(/\/api$/, '')}${fileUrl}`,
};
