import { API_BASE_URL, apiClient, ApiError } from './client.ts';
import type { GameDocument, DocumentShare, DocumentType } from '../types/document.ts';

async function upload<T>(path: string, method: 'POST' | 'PUT', form: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body: form,
    credentials: 'include',
  });
  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body || response.statusText);
  }
  return response.json() as Promise<T>;
}

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

  fileUrl: (fileUrl: string) => `${API_BASE_URL.replace(/\/api$/, '')}${fileUrl}`,
};
