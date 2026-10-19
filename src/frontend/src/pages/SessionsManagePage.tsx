import { useEffect, useState } from 'react';
import { AutoResizeTextarea } from '../components/AutoResizeTextarea.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { useSessionsStore } from '../store/sessionsStore.ts';
import type { Session, UpsertSessionInput } from '../types/session.ts';
import { useGameId } from '../store/authStore.ts';


const EMPTY_FORM: UpsertSessionInput = { title: '', scheduledAt: null, notes: '' };

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDateAndTime(dateValue: string, timeValue: string): string | null {
  if (!dateValue) return null;
  return new Date(`${dateValue}T${timeValue || '00:00'}`).toISOString();
}

function formatScheduled(iso: string | null): string {
  if (!iso) return 'no date set yet';
  return `scheduled for ${new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`;
}

export function SessionsManagePage() {
  const gameId = useGameId();
  const { sessions, isLoading, error, fetchSessions, createSession, updateSession, removeSession } = useSessionsStore();

  const [modalTarget, setModalTarget] = useState<Session | 'new' | null>(null);
  const [form, setForm] = useState<UpsertSessionInput>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions(gameId);
  }, [gameId, fetchSessions]);

  function openAddModal() {
    setForm(EMPTY_FORM);
    setModalTarget('new');
  }

  function openEditModal(session: Session) {
    setForm({ title: session.title, scheduledAt: session.scheduledAt, notes: session.notes });
    setModalTarget(session);
  }

  function closeModal() {
    setModalTarget(null);
  }

  async function handleSave() {
    if (!modalTarget) return;
    const ok = modalTarget === 'new'
      ? await createSession(gameId, form)
      : await updateSession(gameId, modalTarget.id, form);
    if (ok) closeModal();
  }

  // Inline like every other Manage page: 'new' opens the create panel at the
  // top, a session opens its edit panel inside its own card. Prep notes get a
  // large field that keeps growing with the text.
  const sessionForm = (isNew: boolean) => (
    <div className={`map-edit-panel${isNew ? ' create-panel' : ''}`}>
      <div className="field">
        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. The Curse of Ravenholt" />
      </div>
      <div className="field-grid" style={{ marginTop: 10 }}>
        <div className="field">
          <label>Date</label>
          <input
            type="date"
            value={toDateInput(form.scheduledAt)}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: fromDateAndTime(e.target.value, toTimeInput(f.scheduledAt)) }))}
          />
        </div>
        <div className="field">
          <label>Time</label>
          <input
            type="time"
            value={toTimeInput(form.scheduledAt)}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: fromDateAndTime(toDateInput(f.scheduledAt), e.target.value) }))}
          />
        </div>
      </div>
      <div className="field full" style={{ marginTop: 10 }}>
        <label>Session Notes (Prep)</label>
        <AutoResizeTextarea
          className="session-notes-field"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Your prep — scenes, NPCs, what to remember. Grows as you write."
        />
      </div>

      <div className="form-actions" style={{ marginTop: 12 }}>
        <button className="btn-ghost" onClick={closeModal}>Cancel</button>
        <button onClick={handleSave}>{isNew ? 'Create Session' : 'Save'}</button>
      </div>
    </div>
  );

  return (
    <div className="sessions-page">
      <div className="section-header">
        <div>
          <h2>Sessions</h2>
          <p className="hint">Title and prepared notes per session.</p>
        </div>
        <button onClick={() => (modalTarget === 'new' ? closeModal() : openAddModal())}>{modalTarget === 'new' ? 'Cancel' : '+ Add Session'}</button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {modalTarget === 'new' && sessionForm(true)}
      {isLoading && <p className="hint">Loading…</p>}

      <div className="card-list">
        {sessions.map((session) => (
          <div key={session.id} className="row-card">
            <div className="row-top">
              <div>
                <div className="row-title">
                  {session.title ? `Session ${session.number} — ${session.title}` : `Session ${session.number}`}
                </div>
                <div className="row-sub">
                  {!session.title && 'no title yet · '}
                  {formatScheduled(session.scheduledAt)}
                </div>
              </div>
              <div className="row-actions">
                <button className="icon-btn" onClick={() => (modalTarget !== 'new' && modalTarget?.id === session.id ? closeModal() : openEditModal(session))}>
                  {modalTarget !== 'new' && modalTarget?.id === session.id ? 'Close' : 'Edit'}
                </button>
                <button className="icon-btn" onClick={() => setDeleteTarget(session)}>Delete</button>
              </div>
            </div>

            {modalTarget !== 'new' && modalTarget?.id === session.id
              ? sessionForm(false)
              : session.notes && <div className="session-notes-preview">{session.notes}</div>}
          </div>
        ))}
      </div>

      {!isLoading && sessions.length === 0 && <p className="hint">No sessions yet.</p>}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this session?"
          message={`This permanently deletes "Session ${deleteTarget.number}${deleteTarget.title ? ` — ${deleteTarget.title}` : ''}" and its notes. This can't be undone.`}
          confirmLabel="Delete Session"
          onConfirm={async () => {
            await removeSession(gameId, deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
