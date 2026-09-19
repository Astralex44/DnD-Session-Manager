import { create } from 'zustand';
import { documentsApi } from '../api/documents.ts';
import { ApiError } from '../api/client.ts';
import type { GameDocument, DocumentType } from '../types/document.ts';

interface DocumentsState {
  documents: GameDocument[];
  isLoading: boolean;
  error: string | null;

  fetchDocuments: (gameId: string) => Promise<void>;
  createDocument: (gameId: string, name: string, type: DocumentType, file: File) => Promise<boolean>;
  updateDocument: (gameId: string, documentId: string, name: string, file: File | null) => Promise<boolean>;
  removeDocument: (gameId: string, documentId: string) => Promise<void>;
  setShare: (gameId: string, documentId: string, characterId: string, hidden: boolean, locked: boolean) => Promise<void>;
  removeShare: (gameId: string, documentId: string, characterId: string) => Promise<void>;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => {
  async function refetch(gameId: string) {
    try {
      const documents = await documentsApi.list(gameId);
      set({ documents });
    } catch (err) {
      set({ error: describeError(err) });
    }
  }

  return {
    documents: [],
    isLoading: false,
    error: null,

    fetchDocuments: async (gameId) => {
      set({ isLoading: true, error: null });
      try {
        const documents = await documentsApi.list(gameId);
        set({ documents, isLoading: false });
      } catch (err) {
        set({ error: describeError(err), isLoading: false });
      }
    },

    createDocument: async (gameId, name, type, file) => {
      try {
        const created = await documentsApi.create(gameId, name, type, file);
        set({ documents: [...get().documents, created] });
        return true;
      } catch (err) {
        set({ error: describeError(err) });
        return false;
      }
    },

    updateDocument: async (gameId, documentId, name, file) => {
      try {
        const updated = await documentsApi.update(gameId, documentId, name, file);
        set({ documents: get().documents.map((d) => (d.id === documentId ? updated : d)) });
        return true;
      } catch (err) {
        set({ error: describeError(err) });
        return false;
      }
    },

    removeDocument: async (gameId, documentId) => {
      try {
        await documentsApi.remove(gameId, documentId);
        set({ documents: get().documents.filter((d) => d.id !== documentId) });
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    setShare: async (gameId, documentId, characterId, hidden, locked) => {
      try {
        await documentsApi.setShare(gameId, documentId, characterId, hidden, locked);
        await refetch(gameId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },

    removeShare: async (gameId, documentId, characterId) => {
      try {
        await documentsApi.removeShare(gameId, documentId, characterId);
        await refetch(gameId);
      } catch (err) {
        set({ error: describeError(err) });
      }
    },
  };
});

function describeError(err: unknown): string {
  if (err instanceof ApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}
