import { useState } from 'react';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { documentsApi } from '../api/documents.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useDocumentsStore } from '../store/documentsStore.ts';
import { shareState } from '../types/document.ts';
import type { GameDocument } from '../types/document.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

function isImage(fileUrl: string): boolean {
  return /\.(png|jpe?g|webp)$/i.test(fileUrl);
}

type DotState = 'none' | 'partial' | 'full';

function dotState(doc: GameDocument, characterCount: number): DotState {
  const shared = doc.shares.filter((s) => !s.hidden).length;
  if (shared === 0) return 'none';
  return shared >= characterCount ? 'full' : 'partial';
}

// DM-only — FA-01, live per Board mockup's own Map panel (share-dot + popover
// on each thumbnail). Sharing here is a live-session action, same as Shop's
// share editor moving from Manage to Board once Board existed (see
// feedback_manage_vs_board_actions) — Documents kept a share editor in
// Manage too (its own explicit, scoped exception), so DM edits from either
// page reach the same DocumentShare rows and both stay in sync live.
export function MapDmPanel() {
  const { documents, fetchDocuments, setShare, removeShare } = useDocumentsStore();
  const { characters, fetchCharacters } = useCharactersStore();

  const [shareTargetId, setShareTargetId] = useState<string | null>(null);

  useLiveFetch(DEMO_GAME_ID, 'documents', fetchDocuments);
  useLiveFetch(DEMO_GAME_ID, 'characters', fetchCharacters);

  const maps = documents.filter((d) => d.type === 'Map');
  // Derived from the live list (not a captured snapshot) so the share
  // checkboxes stay correct after a toggle refetches, or a push from
  // elsewhere updates this same document while the modal is open.
  const shareTarget = maps.find((d) => d.id === shareTargetId) ?? null;

  function isShared(doc: GameDocument, characterId: string): boolean {
    const share = doc.shares.find((s) => s.characterId === characterId);
    return shareState(share) !== 'none';
  }

  function toggleShare(doc: GameDocument, characterId: string, checked: boolean) {
    if (checked) {
      setShare(DEMO_GAME_ID, doc.id, characterId, false, false);
    } else {
      removeShare(DEMO_GAME_ID, doc.id, characterId);
    }
  }

  return (
    <div className="panel span-2">
      <div className="panel-header"><h3>Maps</h3></div>
      <div className="panel-body">
        {maps.length === 0 && <p className="hint" style={{ margin: 0 }}>No maps uploaded yet — add some in Manage → Documents.</p>}
        <div className="map-grid">
          {maps.map((doc) => {
            const state = dotState(doc, characters.length);
            return (
              <div key={doc.id} className="map-thumb" onClick={() => setShareTargetId(doc.id)}>
                {isImage(doc.fileUrl)
                  ? <img src={documentsApi.fileUrl(doc.fileUrl)} alt={doc.name} />
                  : <div className="map-thumb-icon">📄</div>}
                <span className={`share-dot ${state}`} title={`Sharing: ${state}`} />
                <span className="map-label">{doc.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {shareTarget && (
        <div className="dialog-overlay" onClick={() => setShareTargetId(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share: {shareTarget.name}</h3>
              <span className="modal-close" onClick={() => setShareTargetId(null)}>✕</span>
            </div>
            {isImage(shareTarget.fileUrl) && (
              <img className="map-preview" src={documentsApi.fileUrl(shareTarget.fileUrl)} alt={shareTarget.name} />
            )}
            <p className="hint" style={{ marginTop: 12, marginBottom: 4 }}>Visible to:</p>
            <div className="map-share-list">
              {characters.length === 0 && <p className="hint" style={{ margin: 0 }}>No characters yet.</p>}
              {characters.map((c) => (
                <label key={c.id}>
                  <input
                    type="checkbox"
                    checked={isShared(shareTarget, c.id)}
                    onChange={(e) => toggleShare(shareTarget, c.id, e.target.checked)}
                  />
                  {c.name} ({c.playerName})
                </label>
              ))}
            </div>
            <div className="form-actions" style={{ marginTop: 18 }}>
              <button onClick={() => setShareTargetId(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
