import { useEffect, useState } from 'react';
import { AutoResizeTextarea } from '../components/AutoResizeTextarea.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { CustomSelect } from '../components/CustomSelect.tsx';
import { useGameId, useIsDm } from '../store/authStore.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useNotesStore } from '../store/notesStore.ts';
import { useSessionsStore } from '../store/sessionsStore.ts';
import { useToastStore } from '../store/toastStore.ts';
import type { Note } from '../types/note.ts';

const MY_NOTES = '';

// Your own notebook, always private — nobody else can read it, the DM
// included. The DM additionally keeps a running notebook on each player
// character ("Notes on Amber"), which is still only the DM's.
export function NotesPage() {
  const gameId = useGameId();
  const isDm = useIsDm();
  const { characters, fetchCharacters } = useCharactersStore();
  const [notebook, setNotebook] = useState(MY_NOTES);

  useEffect(() => {
    if (isDm) fetchCharacters(gameId);
  }, [isDm, gameId, fetchCharacters]);

  const notebookOptions = [
    { value: MY_NOTES, label: 'My notes' },
    ...characters.map((c) => ({ value: c.id, label: `Notes on ${c.name}`, group: 'Characters' })),
  ];

  return (
    <div className="notes-page">
      <h2>Notes</h2>
      <p className="hint">
        Private — only you can read these, the DM included.
        {isDm && ' "Notes on …" is your running notebook on that character, not tied to any one session.'}
      </p>

      {isDm && (
        <div className="notes-toolbar">
          <div className="field" style={{ width: 220 }}>
            <label>Notebook</label>
            <CustomSelect value={notebook} onChange={setNotebook} options={notebookOptions} />
          </div>
        </div>
      )}

      <NotebookPanel key={notebook} aboutCharacterId={notebook || null} />
    </div>
  );
}

// key={notebook} on the parent remounts this per notebook, so activeNoteId,
// title and text never carry over from the previous one.
function NotebookPanel({ aboutCharacterId }: { aboutCharacterId: string | null }) {
  const gameId = useGameId();
  const { notes, isLoading, error, fetchNotes, createNote, updateNote, removeNote } = useNotesStore();
  const { sessions, fetchSessions } = useSessionsStore();
  const showToast = useToastStore((s) => s.showToast);

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  useEffect(() => {
    fetchSessions(gameId);
  }, [gameId, fetchSessions]);

  useEffect(() => {
    fetchNotes(gameId, aboutCharacterId);
  }, [gameId, aboutCharacterId, fetchNotes]);

  // Re-pick whenever the active page isn't in the current list — not just
  // when nothing is picked. Right after switching notebooks the shared store
  // still holds the previous notebook's pages for a moment, and a page picked
  // from those would otherwise stay selected (showing nothing) once the new
  // notebook's pages arrive.
  useEffect(() => {
    if (notes.length > 0 && !notes.some((n) => n.id === activeNoteId)) setActiveNoteId(notes[0].id);
  }, [notes, activeNoteId]);

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  useEffect(() => {
    setTitle(activeNote?.title ?? '');
    setText(activeNote?.text ?? '');
  }, [activeNote]);

  const pageOptions = notes.map((n) => ({ value: n.id, label: n.title || 'Untitled' }));

  function defaultTitle(): string {
    if (sessions.length === 0) return 'Session 1';
    const latest = Math.max(...sessions.map((s) => s.number));
    return `Session ${latest}`;
  }

  async function handleNewPage() {
    const created = await createNote(gameId, aboutCharacterId, defaultTitle(), '');
    if (created) setActiveNoteId(created.id);
  }

  const isDirty = !!activeNote && (title !== activeNote.title || text !== activeNote.text);

  async function handleSave() {
    if (!activeNote || !isDirty) return;
    const ok = await updateNote(gameId, activeNote.id, title.trim() || 'Untitled', text);
    showToast(ok ? 'Saved.' : 'Failed to save.', ok ? 'success' : 'error');
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await removeNote(gameId, deleteTarget.id);
    if (activeNoteId === deleteTarget.id) setActiveNoteId(null);
    setDeleteTarget(null);
  }

  return (
    <>
      {error && <div className="error-banner">{error}</div>}

      <div className="notes-toolbar" style={{ marginTop: 10 }}>
        {notes.length > 0 && (
          <div className="field" style={{ width: 220 }}>
            <label>Page</label>
            <CustomSelect value={activeNoteId ?? ''} onChange={setActiveNoteId} options={pageOptions} />
          </div>
        )}
        <button className="btn-ghost" onClick={handleNewPage}>+ New Page</button>
      </div>

      {isLoading && <p className="hint">Loading…</p>}

      {!isLoading && notes.length === 0 && (
        <p className="hint">No pages yet — click "+ New Page" to start one.</p>
      )}

      {activeNote && (
        <>
          <div className="field" style={{ marginTop: 14, maxWidth: 400 }}>
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <AutoResizeTextarea
            className="notes-textarea"
            style={{ marginTop: 10 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Jot down whatever you don't want to forget…"
          />

          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <button className="btn-danger" onClick={() => setDeleteTarget(activeNote)}>Delete Page</button>
            <button onClick={handleSave} disabled={!isDirty}>Save</button>
          </div>
        </>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this page?"
          message={`This permanently deletes "${deleteTarget.title || 'Untitled'}". This can't be undone.`}
          confirmLabel="Delete Page"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
