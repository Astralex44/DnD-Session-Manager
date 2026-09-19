import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { useSessionsStore } from '../store/sessionsStore.ts';
import type { Session, UpsertSessionInput } from '../types/session.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

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
  const { sessions, isLoading, error, fetchSessions, createSession, updateSession, removeSession } = useSessionsStore();

  const [modalTarget, setModalTarget] = useState<Session | 'new' | null>(null);
  const [form, setForm] = useState<UpsertSessionInput>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions(DEMO_GAME_ID);
  }, [fetchSessions]);

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
      ? await createSession(DEMO_GAME_ID, form)
      : await updateSession(DEMO_GAME_ID, modalTarget.id, form);
    if (ok) closeModal();
  }

  return (
    <div className="sessions-page">
      <div className="section-header">
        <div>
          <h2>Sessions</h2>
          <p className="hint">Title and prepared notes per session.</p>
        </div>
        <button onClick={openAddModal}>+ Add Session</button>
      </div>

      {error && <div className="error-banner">{error}</div>}
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
                <button className="icon-btn" onClick={() => openEditModal(session)}>Edit</button>
                <button className="icon-btn" onClick={() => setDeleteTarget(session)}>Delete</button>
              </div>
            </div>

            {session.notes && <div className="session-notes-preview">{session.notes}</div>}
          </div>
        ))}
      </div>

      {!isLoading && sessions.length === 0 && <p className="hint">No sessions yet.</p>}

      {modalTarget && (
        <div className="dialog-overlay" onClick={closeModal}>
          <div className="dialog-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalTarget === 'new' ? 'Add Session' : 'Edit Session'}</h3>
              <span className="modal-close" onClick={closeModal}>✕</span>
            </div>

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
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>

            <div className="form-actions" style={{ marginTop: 16 }}>
              <button className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this session?"
          message={`This permanently deletes "Session ${deleteTarget.number}${deleteTarget.title ? ` — ${deleteTarget.title}` : ''}" and its notes. This can't be undone.`}
          confirmLabel="Delete Session"
          onConfirm={async () => {
            await removeSession(DEMO_GAME_ID, deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
