import { useEffect, useState } from 'react';
import { documentsApi } from '../api/documents.ts';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { CustomSelect } from '../components/CustomSelect.tsx';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useDocumentsStore } from '../store/documentsStore.ts';
import { shareState } from '../types/document.ts';
import type { DocumentType, GameDocument } from '../types/document.ts';
import type { Character } from '../types/character.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';
const NO_TARGET = '__none__';

function isImage(fileUrl: string): boolean {
  return /\.(png|jpe?g|webp)$/i.test(fileUrl);
}

interface DocumentSectionProps {
  type: DocumentType;
  title: string;
  glyph: string;
  accept: string;
  hint: string;
  documents: GameDocument[];
  characters: Character[];
}

function DocumentSection({ type, title, glyph, accept, hint, documents, characters }: DocumentSectionProps) {
  const { isLoading, createDocument, updateDocument, removeDocument, setShare, removeShare } = useDocumentsStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GameDocument | null>(null);

  const [shareTarget, setShareTarget] = useState<Record<string, string>>({});

  async function handleCreate() {
    if (!newName.trim() || !newFile) return;
    const ok = await createDocument(DEMO_GAME_ID, newName.trim(), type, newFile);
    if (ok) {
      setNewName('');
      setNewFile(null);
      setShowCreate(false);
    }
  }

  function startEdit(doc: GameDocument) {
    setEditingId(doc.id);
    setEditName(doc.name);
    setEditFile(null);
  }

  async function handleSaveEdit(doc: GameDocument) {
    if (!editName.trim()) return;
    const ok = await updateDocument(DEMO_GAME_ID, doc.id, editName.trim(), editFile);
    if (ok) setEditingId(null);
  }

  return (
    <div className="sheet-section box" style={{ marginTop: 18 }}>
      <h3 className="section-title">{title}</h3>
      <p className="hint">{hint}</p>

      <div className="upload-zone" onClick={() => setShowCreate((s) => !s)}>
        <span className="glyph">{glyph}</span>
        {showCreate ? 'Cancel upload' : `Click to upload a ${title.toLowerCase().replace(/s$/, '')} (${accept.replace(/\./g, '').toUpperCase()})`}
      </div>

      {showCreate && (
        <div className="map-edit-panel">
          <div className="field">
            <label>Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Throne Room" />
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label>File</label>
            <input type="file" accept={accept} onChange={(e) => setNewFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="form-actions" style={{ marginTop: 12 }}>
            <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button onClick={handleCreate}>Upload</button>
          </div>
        </div>
      )}

      {isLoading && <p className="hint">Loading…</p>}

      <div className="card-list">
        {documents.map((doc) => {
          const sharedIds = new Set(doc.shares.map((s) => s.characterId));
          const shareableCharacters = characters.filter((c) => !sharedIds.has(c.id));
          const shareOptions = [
            { value: NO_TARGET, label: 'Share with…' },
            ...shareableCharacters.map((c) => ({ value: c.id, label: `${c.name} (${c.playerName})` })),
          ];

          return (
            <div key={doc.id} className="row-card">
              <div className="row-top">
                <div>
                  <div className="row-title">{doc.name}</div>
                  <div className="row-sub">
                    {doc.originalFileName} · uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="row-actions">
                  {!isImage(doc.fileUrl) && (
                    <a className="icon-btn" href={documentsApi.fileUrl(doc.fileUrl)} target="_blank" rel="noreferrer">Open</a>
                  )}
                  <button className="icon-btn" onClick={() => (editingId === doc.id ? setEditingId(null) : startEdit(doc))}>
                    {editingId === doc.id ? 'Close' : 'Edit'}
                  </button>
                  <button className="icon-btn" onClick={() => setDeleteTarget(doc)}>Delete</button>
                </div>
              </div>

              <div className="chip-row">
                {doc.shares.length === 0 && <span className="chip">Not shared with anyone yet</span>}
                {doc.shares.map((share) => {
                  const state = shareState(share);
                  const chipClass = state === 'visible' ? 'visible' : state === 'hidden' ? 'hidden-chip' : 'locked';
                  return (
                    <span key={share.id} className={`chip ${chipClass} chip-removable`}>
                      {share.characterName}
                      <span className="chip-remove" onClick={() => removeShare(DEMO_GAME_ID, doc.id, share.characterId)}>✕</span>
                    </span>
                  );
                })}
              </div>

              {shareableCharacters.length > 0 && (
                <div className="share-add-row">
                  <div style={{ width: 200 }}>
                    <CustomSelect
                      value={shareTarget[doc.id] ?? NO_TARGET}
                      onChange={(v) => setShareTarget((s) => ({ ...s, [doc.id]: v }))}
                      options={shareOptions}
                    />
                  </div>
                  <button
                    className="btn-ghost"
                    disabled={!shareTarget[doc.id] || shareTarget[doc.id] === NO_TARGET}
                    onClick={() => {
                      const characterId = shareTarget[doc.id];
                      if (!characterId || characterId === NO_TARGET) return;
                      setShare(DEMO_GAME_ID, doc.id, characterId, false, false);
                      setShareTarget((s) => ({ ...s, [doc.id]: NO_TARGET }));
                    }}
                  >
                    Share
                  </button>
                </div>
              )}

              {isImage(doc.fileUrl) && (
                <img className="map-preview" src={documentsApi.fileUrl(doc.fileUrl)} alt={doc.name} />
              )}

              {editingId === doc.id && (
                <div className="map-edit-panel">
                  <div className="field">
                    <label>Name</label>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="field" style={{ marginTop: 10 }}>
                    <label>Replace File (optional)</label>
                    <input type="file" accept={accept} onChange={(e) => setEditFile(e.target.files?.[0] ?? null)} />
                  </div>
                  <div className="form-actions" style={{ marginTop: 12 }}>
                    <button className="btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                    <button onClick={() => handleSaveEdit(doc)}>Save</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isLoading && documents.length === 0 && <p className="hint">No {title.toLowerCase()} yet.</p>}

      {deleteTarget && (
        <ConfirmDialog
          title={`Delete this ${title.toLowerCase().replace(/s$/, '')}?`}
          message={`This permanently deletes "${deleteTarget.name}" and its file, including all sharing settings. This can't be undone.`}
          confirmLabel="Delete"
          onConfirm={async () => {
            await removeDocument(DEMO_GAME_ID, deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export function DocumentsManagePage() {
  const { documents, error, fetchDocuments } = useDocumentsStore();
  const { characters, fetchCharacters } = useCharactersStore();

  useEffect(() => {
    fetchDocuments(DEMO_GAME_ID);
    fetchCharacters(DEMO_GAME_ID);
  }, [fetchDocuments, fetchCharacters]);

  const maps = documents.filter((d) => d.type === 'Map');
  const books = documents.filter((d) => d.type === 'Book');

  return (
    <div className="documents-page">
      <h2>Documents</h2>
      <p className="hint">
        Maps and books — anything shareable as a single file. Sharing is additive: once a character has access,
        they can pass it along to another character too, same as physically handing it over.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <DocumentSection
        type="Map"
        title="Maps"
        glyph="🗺"
        accept=".png,.jpg,.jpeg,.webp,.pdf"
        hint="One map per room — easier to share than cropped sections of one big map."
        documents={maps}
        characters={characters}
      />

      <DocumentSection
        type="Book"
        title="Books"
        glyph="📖"
        accept=".pdf"
        hint="Rulebooks, lore, found tomes — anything a character might pick up and carry."
        documents={books}
        characters={characters}
      />
    </div>
  );
}
