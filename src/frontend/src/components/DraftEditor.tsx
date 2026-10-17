import { useState } from 'react';
import { AutoResizeTextarea } from './AutoResizeTextarea.tsx';

interface DraftEditorProps {
  initial: string;
  placeholder?: string;
  onSave: (text: string) => void;
}

// A textarea with its own unsaved draft and a Save button. Give it a key that
// changes with the saved content (e.g. `${id}-${updatedAt}`) so switching to
// another page/session — or a save landing — starts a fresh draft, without
// syncing state in an effect.
export function DraftEditor({ initial, placeholder, onSave }: DraftEditorProps) {
  const [draft, setDraft] = useState(initial);
  return (
    <>
      <AutoResizeTextarea
        className="board-notes-text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
      />
      <div className="panel-actions">
        <button onClick={() => onSave(draft)} disabled={draft === initial}>Save</button>
      </div>
    </>
  );
}
