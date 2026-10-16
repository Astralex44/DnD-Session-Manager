import { apiClient } from './client.ts';
import type { Note } from '../types/note.ts';

// Route shape matches NotesController: /api/games/{gameId}/notes. Always the
// logged-in person's own notes; aboutCharacterId (DM only) selects the DM's
// notebook on that character instead of their personal one.
function query(aboutCharacterId: string | null) {
  return aboutCharacterId ? `?aboutCharacterId=${aboutCharacterId}` : '';
}

export const notesApi = {
  list: (gameId: string, aboutCharacterId: string | null) =>
    apiClient.get<Note[]>(`/games/${gameId}/notes${query(aboutCharacterId)}`),

  create: (gameId: string, aboutCharacterId: string | null, title: string, text: string) =>
    apiClient.post<Note>(`/games/${gameId}/notes${query(aboutCharacterId)}`, { title, text }),

  update: (gameId: string, noteId: string, title: string, text: string) =>
    apiClient.put<Note>(`/games/${gameId}/notes/${noteId}`, { title, text }),

  remove: (gameId: string, noteId: string) =>
    apiClient.delete<void>(`/games/${gameId}/notes/${noteId}`),
};
