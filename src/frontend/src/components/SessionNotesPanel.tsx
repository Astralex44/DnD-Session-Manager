import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DraftEditor } from './DraftEditor.tsx';
import { CustomSelect } from './CustomSelect.tsx';
import { useGameId } from '../store/authStore.ts';
import { useSessionsStore } from '../store/sessionsStore.ts';
import { useToastStore } from '../store/toastStore.ts';
import type { Session } from '../types/session.ts';

// The session you're about to play (or playing): the earliest one scheduled
// from today on, else the highest-numbered one. Just a default — the DM can
// switch to any session in the panel.
function currentSession(sessions: Session[]): Session | null {
  if (sessions.length === 0) return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcoming = sessions
    .filter((s) => s.scheduledAt && new Date(s.scheduledAt) >= startOfToday)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());
  return upcoming[0] ?? [...sessions].sort((a, b) => b.number - a.number)[0];
}

// FA-13, DM only: the prep notes written in Manage → Sessions, at hand on the
// Board during play — and editable right here, so something decided mid-
// session can go straight into them.
export function SessionNotesPanel() {
  const gameId = useGameId();
  const { sessions, fetchSessions, updateSession } = useSessionsStore();
  const showToast = useToastStore((s) => s.showToast);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions(gameId);
  }, [gameId, fetchSessions]);

  const selected = sessions.find((s) => s.id === sessionId) ?? currentSession(sessions);

  async function handleSave(notes: string) {
    if (!selected) return;
    const ok = await updateSession(gameId, selected.id, { title: selected.title, scheduledAt: selected.scheduledAt, notes });
    showToast(ok ? 'Saved.' : 'Failed to save.', ok ? 'success' : 'error');
  }

  return (
    <div className="panel span-2">
      <div className="panel-header"><h3>Session Notes</h3></div>
      <div className="panel-body">
        {!selected ? (
          <p className="hint" style={{ margin: 0 }}>
            No sessions yet — create one in <Link to="/manage/sessions">Manage → Sessions</Link>.
          </p>
        ) : (
          <>
            <div className="field" style={{ maxWidth: 320 }}>
              <CustomSelect
                value={selected.id}
                onChange={setSessionId}
                options={[...sessions].sort((a, b) => b.number - a.number).map((s) => ({
                  value: s.id,
                  label: `Session ${s.number}${s.title ? ` — ${s.title}` : ''}`,
                }))}
              />
            </div>
            <DraftEditor
              key={`${selected.id}-${selected.notes}`}
              initial={selected.notes}
              placeholder="Your prep for this session — beats, NPCs, what to remember."
              onSave={handleSave}
            />
          </>
        )}
      </div>
    </div>
  );
}
