import { create } from 'zustand';
import { notesApi } from '../api/notes.ts';
import { ApiError } from '../api/client.ts';
import type { Note } from '../types/note.ts';

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;

  fetchNotes: (gameId: string, owner: string) => Promise<void>;
  createNote: (gameId: string, owner: string, title: string, text: string) => Promise<Note | null>;
  updateNote: (gameId: string, owner: string, noteId: string, title: string, text: string) => Promise<boolean>;
  removeNote: (gameId: string, owner: string, noteId: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async (gameId, owner) => {
    set({ isLoading: true, error: null });
    try {
      const notes = await notesApi.list(gameId, owner);
      set({ notes, isLoading: false });
    } catch (err) {
      set({ error: describeError(err), isLoading: false });
    }
  },

  createNote: async (gameId, owner, title, text) => {
    try {
      const created = await notesApi.create(gameId, owner, title, text);
      set({ notes: [created, ...get().notes] });
      return created;
    } catch (err) {
      set({ error: describeError(err) });
      return null;
    }
  },

  updateNote: async (gameId, owner, noteId, title, text) => {
    try {
      const updated = await notesApi.update(gameId, owner, noteId, title, text);
      set({ notes: get().notes.map((n) => (n.id === noteId ? updated : n)) });
      return true;
    } catch (err) {
      set({ error: describeError(err) });
      return false;
    }
  },

  removeNote: async (gameId, owner, noteId) => {
    try {
      await notesApi.remove(gameId, owner, noteId);
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
