import { useEffect, useState } from 'react';
import { AutoResizeTextarea } from '../components/AutoResizeTextarea.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { CustomSelect } from '../components/CustomSelect.tsx';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useNotesStore } from '../store/notesStore.ts';
import { useSessionsStore } from '../store/sessionsStore.ts';
import { useToastStore } from '../store/toastStore.ts';
import type { Note } from '../types/note.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';
const DM_OWNER = 'DM';

export function NotesPage() {
  const { notes, isLoading, error, fetchNotes, createNote, updateNote, removeNote } = useNotesStore();
  const { characters, fetchCharacters } = useCharactersStore();
  const { sessions, fetchSessions } = useSessionsStore();
  const showToast = useToastStore((s) => s.showToast);

  const [owner, setOwner] = useState(DM_OWNER);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  useEffect(() => {
    fetchCharacters(DEMO_GAME_ID);
    fetchSessions(DEMO_GAME_ID);
  }, [fetchCharacters, fetchSessions]);

  useEffect(() => {
    setActiveNoteId(null);
    fetchNotes(DEMO_GAME_ID, owner);
  }, [owner, fetchNotes]);

  useEffect(() => {
    if (activeNoteId === null && notes.length > 0) setActiveNoteId(notes[0].id);
  }, [notes, activeNoteId]);

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  useEffect(() => {
    setTitle(activeNote?.title ?? '');
    setText(activeNote?.text ?? '');
  }, [activeNote]);

  const players = [...new Set(characters.map((c) => c.playerName).filter(Boolean))];
  const ownerOptions = [
    { value: DM_OWNER, label: 'DM' },
    ...players.map((p) => ({ value: p, label: p })),
    // Notes about a character (not a person) — the DM's running notebook on
    // that PC, not gated to any one session. Reuses the same owner concept:
    // a character's name is just another bucket key, same as "DM" or a
    // player's name — no schema change needed for this.
    ...characters.map((c) => ({ value: c.name, label: c.name, group: 'Characters' })),
  ];
  const pageOptions = notes.map((n) => ({ value: n.id, label: n.title || 'Untitled' }));

  function defaultTitle(): string {
    if (sessions.length === 0) return 'Session 1';
    const latest = Math.max(...sessions.map((s) => s.number));
    return `Session ${latest}`;
  }

  async function handleNewPage() {
    const created = await createNote(DEMO_GAME_ID, owner, defaultTitle(), '');
    if (created) setActiveNoteId(created.id);
  }

  const isDirty = !!activeNote && (title !== activeNote.title || text !== activeNote.text);

  async function handleSave() {
    if (!activeNote || !isDirty) return;
    const ok = await updateNote(DEMO_GAME_ID, owner, activeNote.id, title.trim() || 'Untitled', text);
    showToast(ok ? 'Saved.' : 'Failed to save.', ok ? 'success' : 'error');
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await removeNote(DEMO_GAME_ID, owner, deleteTarget.id);
    if (activeNoteId === deleteTarget.id) setActiveNoteId(null);
    setDeleteTarget(null);
  }

  return (
    <div className="notes-page">
      <h2>Notes</h2>
      <p className="hint">
        Private — never shared with anyone else at the table. "DM" and player entries are that person's own
        notebook; a character entry is the DM's running notes on that PC, not tied to any one session.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="notes-toolbar">
        <div className="field" style={{ width: 200 }}>
          <label>Viewing notes for</label>
          <CustomSelect value={owner} onChange={setOwner} options={ownerOptions} />
        </div>
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
    </div>
  );
}
