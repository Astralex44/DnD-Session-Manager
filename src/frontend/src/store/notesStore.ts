import { create } from 'zustand';
import { notesApi } from '../api/notes.ts';
import { ApiError } from '../api/client.ts';
import type { Note } from '../types/note.ts';

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;

  // aboutCharacterId: null = your own notebook; a character id = the DM's
  // notebook on that character.
  fetchNotes: (gameId: string, aboutCharacterId: string | null) => Promise<void>;
  createNote: (gameId: string, aboutCharacterId: string | null, title: string, text: string) => Promise<Note | null>;
  updateNote: (gameId: string, noteId: string, title: string, text: string) => Promise<boolean>;
  removeNote: (gameId: string, noteId: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async (gameId, aboutCharacterId) => {
    set({ isLoading: true, error: null });
    try {
      const notes = await notesApi.list(gameId, aboutCharacterId);
      set({ notes, isLoading: false });
    } catch (err) {
      set({ error: describeError(err), isLoading: false });
    }
  },

  createNote: async (gameId, aboutCharacterId, title, text) => {
    try {
      const created = await notesApi.create(gameId, aboutCharacterId, title, text);
      set({ notes: [created, ...get().notes] });
      return created;
    } catch (err) {
      set({ error: describeError(err) });
      return null;
    }
  },

  updateNote: async (gameId, noteId, title, text) => {
    try {
      const updated = await notesApi.update(gameId, noteId, title, text);
      set({ notes: get().notes.map((n) => (n.id === noteId ? updated : n)) });
      return true;
    } catch (err) {
      set({ error: describeError(err) });
      return false;
    }
  },

  removeNote: async (gameId, noteId) => {
    try {
      await notesApi.remove(gameId, noteId);
      set({ notes: get().notes.filter((n) => n.id !== noteId) });
    } catch (err) {
      set({ error: describeError(err) });
    }
  },
}));

function describeError(err: unknown): string {
  if (err instanceof ApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}
