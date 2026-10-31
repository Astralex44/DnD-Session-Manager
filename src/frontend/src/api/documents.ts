import { API_BASE_URL, apiClient } from './client.ts';
import { uploadForm as upload } from '../lib/upload.ts';
import type { GameDocument, DocumentShare, DocumentType } from '../types/document.ts';

// Route shape matches DocumentsController on the backend: /api/games/{gameId}/documents
export const documentsApi = {
  list: (gameId: string) => apiClient.get<GameDocument[]>(`/games/${gameId}/documents`),

  get: (gameId: string, documentId: string) => apiClient.get<GameDocument>(`/games/${gameId}/documents/${documentId}`),

  create: (gameId: string, name: string, type: DocumentType, file: File) => {
    const form = new FormData();
    form.set('Name', name);
    form.set('Type', type);
    form.set('File', file);
    return upload<GameDocument>(`/games/${gameId}/documents`, 'POST', form);
  },

  update: (gameId: string, documentId: string, name: string, file: File | null) => {
    const form = new FormData();
    form.set('Name', name);
    if (file) form.set('File', file);
    return upload<GameDocument>(`/games/${gameId}/documents/${documentId}`, 'PUT', form);
  },

  remove: (gameId: string, documentId: string) => apiClient.delete<void>(`/games/${gameId}/documents/${documentId}`),

  setShare: (gameId: string, documentId: string, characterId: string, hidden: boolean, locked: boolean) =>
    apiClient.put<DocumentShare>(`/games/${gameId}/documents/${documentId}/shares/${characterId}`, { hidden, locked }),

  removeShare: (gameId: string, documentId: string, characterId: string) =>
    apiClient.delete<void>(`/games/${gameId}/documents/${documentId}/shares/${characterId}`),

  // DM: share with every character in the game at once / remove every share.
  shareWithAll: (gameId: string, documentId: string) =>
    apiClient.put<void>(`/games/${gameId}/documents/${documentId}/shares`, {}),

  removeAllShares: (gameId: string, documentId: string) =>
    apiClient.delete<void>(`/games/${gameId}/documents/${documentId}/shares`),

  fileUrl: (fileUrl: string) => `${API_BASE_URL.replace(/\/api$/, '')}${fileUrl}`,

  // DM: hide every unlocked map share for every player (FA-01 "end of session").
  endSession: (gameId: string) => apiClient.post<{ hidden: number }>(`/games/${gameId}/documents/end-session`, {}),
};
