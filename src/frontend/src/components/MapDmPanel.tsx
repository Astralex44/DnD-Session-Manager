import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { useToastStore } from '../store/toastStore.ts';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { documentsApi } from '../api/documents.ts';
import { FileThumb } from './FileThumb.tsx';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useDocumentsStore } from '../store/documentsStore.ts';
import { shareState } from '../types/document.ts';
import type { GameDocument } from '../types/document.ts';
import { useGameId } from '../store/authStore.ts';


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
  const gameId = useGameId();
  const { documents, fetchDocuments, setShare, removeShare } = useDocumentsStore();
  const { characters, fetchCharacters } = useCharactersStore();

  const [shareTargetId, setShareTargetId] = useState<string | null>(null);
  const [confirmEndSession, setConfirmEndSession] = useState(false);
  const showToast = useToastStore((t) => t.showToast);

  // FA-01: at the end of a session every map is hidden again for players —
  // except the ones a player locked. An explicit action, not a "session is
  // live" flag (the Board is a cockpit, not a gate). Players can still
  // unhide a map themselves.
  async function handleEndSession() {
    setConfirmEndSession(false);
    try {
      const { hidden } = await documentsApi.endSession(gameId);
      showToast(hidden === 0 ? 'No visible unlocked maps to hide.' : `Hid ${hidden} map ${hidden === 1 ? 'share' : 'shares'} for the players.`, 'success');
      fetchDocuments(gameId);
    } catch {
      showToast('Failed to end the session.', 'error');
    }
  }

  useLiveFetch(gameId, 'documents', fetchDocuments);
  useLiveFetch(gameId, 'characters', fetchCharacters);

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
      setShare(gameId, doc.id, characterId, false, false);
    } else {
      removeShare(gameId, doc.id, characterId);
    }
  }

  return (
    <div className="panel span-2">
      <div className="panel-header">
        <h3>Maps</h3>
        <button className="panel-header-btn" onClick={() => setConfirmEndSession(true)} title="Hide every unlocked map for all players">
          End session
        </button>
      </div>
      {confirmEndSession && (
        <ConfirmDialog
          title="End the session?"
          message="Every map you shared gets hidden again for the players — except the ones a player locked. Nothing is unshared: players can unhide a map themselves, and you can share again any time."
          confirmLabel="Hide maps"
          onConfirm={handleEndSession}
          onCancel={() => setConfirmEndSession(false)}
        />
      )}
      <div className="panel-body">
        {maps.length === 0 && <p className="hint" style={{ margin: 0 }}>No maps uploaded yet — add some in Manage → Documents.</p>}
        <div className="map-grid">
          {maps.map((doc) => {
            const state = dotState(doc, characters.length);
            return (
              <div key={doc.id} className="map-thumb" onClick={() => setShareTargetId(doc.id)}>
                <FileThumb url={documentsApi.fileUrl(doc.fileUrl)} alt={doc.name} />
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
