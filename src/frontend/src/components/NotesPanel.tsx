import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DraftEditor } from './DraftEditor.tsx';
import { CustomSelect } from './CustomSelect.tsx';
import { useGameId } from '../store/authStore.ts';
import { useNotesStore } from '../store/notesStore.ts';
import { useToastStore } from '../store/toastStore.ts';

// FA-08 on the Board (Pflichtenheft 8.3, both roles): your own private
// notebook, compact — pick a page, write, save. Creating many pages,
// renaming and deleting stay on the Notes page.
interface NotesPanelProps {
  // Across the whole Board row (the player Board's last row).
  fullWidth?: boolean;
}

export function NotesPanel({ fullWidth }: NotesPanelProps) {
  const gameId = useGameId();
  const { notes, fetchNotes, createNote, updateNote } = useNotesStore();
  const showToast = useToastStore((s) => s.showToast);
  const [pageId, setPageId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes(gameId, null);
  }, [gameId, fetchNotes]);

  // Same rule as the Notes page: re-pick when the chosen page isn't in the
  // current list (e.g. the store still held another notebook a moment ago).
  const page = notes.find((n) => n.id === pageId) ?? notes[0] ?? null;

  async function handleSave(text: string) {
    if (!page) return;
    const ok = await updateNote(gameId, page.id, page.title, text);
    showToast(ok ? 'Saved.' : 'Failed to save.', ok ? 'success' : 'error');
  }

  async function handleNewPage() {
    const created = await createNote(gameId, null, 'Board notes', '');
    if (created) setPageId(created.id);
  }

  return (
    <div className={`panel${fullWidth ? ' span-full' : ''}`}>
      <div className="panel-header">
        <h3>My Notes</h3>
        <Link className="panel-header-link" to="/notes">All pages ›</Link>
      </div>
      <div className="panel-body">
        <p className="hint" style={{ margin: '0 0 8px' }}>Only you can read these.</p>
        {page ? (
          <>
            {notes.length > 1 && (
              <div className="field">
                <CustomSelect value={page.id} onChange={setPageId} options={notes.map((n) => ({ value: n.id, label: n.title || 'Untitled' }))} />
              </div>
            )}
            <DraftEditor key={`${page.id}-${page.updatedAt}`} initial={page.text} onSave={handleSave} />
          </>
        ) : (
          <button className="add-btn" onClick={handleNewPage}>+ Start a page</button>
        )}
      </div>
    </div>
  );
}
