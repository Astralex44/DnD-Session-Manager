import { useEffect, useState } from 'react';
import { CustomSelect } from './CustomSelect.tsx';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { documentsApi } from '../api/documents.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useDocumentsStore } from '../store/documentsStore.ts';
import type { GameDocument } from '../types/document.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

function isImage(fileUrl: string): boolean {
  return /\.(png|jpe?g|webp)$/i.test(fileUrl);
}

// FA-01, player side — maps the DM shared with this character. "Hide" is a
// per-viewer declutter toggle (the map stays shared, just tucked away here);
// "Lock" marks it worth keeping visible after the session ends — both are
// the player's own edits to the same DocumentShare row the DM's share
// checkbox writes to (see MapDmPanel), same demo-mode identity convention
// as everywhere else pre-Login. Live via SignalR push.
export function MapPlayerPanel() {
  const { documents, fetchDocuments, setShare } = useDocumentsStore();
  const { characters, fetchCharacters } = useCharactersStore();

  const [characterId, setCharacterId] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [viewing, setViewing] = useState<GameDocument | null>(null);

  useLiveFetch(DEMO_GAME_ID, 'documents', fetchDocuments);
  useLiveFetch(DEMO_GAME_ID, 'characters', fetchCharacters);

  useEffect(() => {
    if (!characterId && characters.length > 0) setCharacterId(characters[0].id);
  }, [characters, characterId]);

  const characterOptions = characters.map((c) => ({ value: c.id, label: `${c.name} (${c.playerName})` }));

  // Raw booleans, not the collapsed shareState() tri-state — Hidden and
  // Locked are independent flags here (a map can be both, or either), so the
  // 3-way "none/hidden/locked/visible" helper used elsewhere would swallow
  // "locked AND hidden" into just "locked" and hide it from the hidden bucket.
  const shared = documents
    .filter((d) => d.type === 'Map')
    .map((d) => ({ doc: d, share: d.shares.find((s) => s.characterId === characterId) }))
    .filter((entry): entry is { doc: GameDocument; share: NonNullable<typeof entry.share> } => entry.share !== undefined);

  const visible = shared.filter(({ share }) => !share.hidden);
  const hidden = shared.filter(({ share }) => share.hidden);

  function toggleHidden(doc: GameDocument, currentlyHidden: boolean, locked: boolean) {
    if (!characterId) return;
    setShare(DEMO_GAME_ID, doc.id, characterId, !currentlyHidden, locked);
  }

  function toggleLocked(doc: GameDocument, hidden: boolean, currentlyLocked: boolean) {
    if (!characterId) return;
    setShare(DEMO_GAME_ID, doc.id, characterId, hidden, !currentlyLocked);
  }

  return (
    <div className="panel span-2">
      <div className="panel-header"><h3>Maps</h3></div>
      <div className="panel-body">
        {characterOptions.length > 1 && (
          <div className="field" style={{ marginBottom: 10 }}>
            <label>Viewing as</label>
            <CustomSelect value={characterId ?? ''} onChange={setCharacterId} options={characterOptions} />
          </div>
        )}

        {shared.length === 0 && <p className="hint" style={{ margin: 0 }}>No maps shared with you yet.</p>}

        {visible.length > 0 && (
          <div className="map-grid">
            {visible.map(({ doc, share }) => (
              <div key={doc.id} className="map-thumb" onClick={() => setViewing(doc)}>
                {isImage(doc.fileUrl)
                  ? <img src={documentsApi.fileUrl(doc.fileUrl)} alt={doc.name} />
                  : <div className="map-thumb-icon">📄</div>}
                <div className="map-actions">
                  <button
                    title="Hide"
                    onClick={(e) => { e.stopPropagation(); toggleHidden(doc, false, share.locked); }}
                  >
                    👁
                  </button>
                  <button
                    className={share.locked ? 'on' : ''}
                    title="Lock, stays visible after session ends"
                    onClick={(e) => { e.stopPropagation(); toggleLocked(doc, share.hidden, share.locked); }}
                  >
                    🔒
                  </button>
                </div>
                <span className="map-label">{doc.name}</span>
              </div>
            ))}
          </div>
        )}

        {hidden.length > 0 && (
          <>
            <p className="hint" style={{ marginTop: 10, cursor: 'pointer' }} onClick={() => setShowHidden((s) => !s)}>
              {showHidden ? 'Hide' : 'Show'} hidden maps ({hidden.length}) {showHidden ? '↑' : '↓'}
            </p>
            {showHidden && (
              <div className="map-grid">
                {hidden.map(({ doc, share }) => (
                  <div key={doc.id} className="map-thumb hidden-map" onClick={() => setViewing(doc)}>
                    {isImage(doc.fileUrl)
                      ? <img src={documentsApi.fileUrl(doc.fileUrl)} alt={doc.name} />
                      : <div className="map-thumb-icon">📄</div>}
                    <div className="map-actions">
                      <button
                        title="Unhide"
                        onClick={(e) => { e.stopPropagation(); toggleHidden(doc, true, share.locked); }}
                      >
                        👁
                      </button>
                    </div>
                    <span className="map-label">{doc.name}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {viewing && (
        <div className="dialog-overlay" onClick={() => setViewing(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewing.name}</h3>
              <span className="modal-close" onClick={() => setViewing(null)}>✕</span>
            </div>
            {isImage(viewing.fileUrl)
              ? <img className="map-preview" src={documentsApi.fileUrl(viewing.fileUrl)} alt={viewing.name} />
              : (
                <a className="btn-ghost" href={documentsApi.fileUrl(viewing.fileUrl)} target="_blank" rel="noreferrer">
                  Open PDF →
                </a>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
