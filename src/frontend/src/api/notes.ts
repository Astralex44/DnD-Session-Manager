import { apiClient } from './client.ts';
import { accessCodeHeaders } from '../lib/accessLock.ts';
import type { Note } from '../types/note.ts';

// Route shape matches NotesController on the backend: /api/games/{gameId}/notes/{owner}
export const notesApi = {
  list: (gameId: string, owner: string) =>
    apiClient.get<Note[]>(`/games/${gameId}/notes/${encodeURIComponent(owner)}`, accessCodeHeaders('NotesOwner', owner)),

  create: (gameId: string, owner: string, title: string, text: string) =>
    apiClient.post<Note>(`/games/${gameId}/notes/${encodeURIComponent(owner)}`, { title, text }, accessCodeHeaders('NotesOwner', owner)),

  update: (gameId: string, owner: string, noteId: string, title: string, text: string) =>
    apiClient.put<Note>(`/games/${gameId}/notes/${encodeURIComponent(owner)}/${noteId}`, { title, text }, accessCodeHeaders('NotesOwner', owner)),

  remove: (gameId: string, owner: string, noteId: string) =>
    apiClient.delete<void>(`/games/${gameId}/notes/${encodeURIComponent(owner)}/${noteId}`, accessCodeHeaders('NotesOwner', owner)),
};
