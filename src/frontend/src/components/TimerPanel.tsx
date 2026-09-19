import { useEffect, useState } from 'react';
import { NumberInput } from './NumberInput.tsx';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { useTimersStore } from '../store/timersStore.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

function formatRemaining(endsAt: string, now: number): string {
  const remaining = Math.max(0, Math.round((new Date(endsAt).getTime() - now) / 1000));
  const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

// DM-only per the mockup — not shown in the player Board view. Live via
// SignalR push (see lib/realtime.ts / hooks/useLiveFetch.ts).
export function TimerPanel() {
  const { timers, fetchTimers, createTimer, removeTimer } = useTimersStore();
  const [label, setLabel] = useState('');
  const [duration, setDuration] = useState(60);
  const [now, setNow] = useState(() => Date.now());

  useLiveFetch(DEMO_GAME_ID, 'timers', fetchTimers);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  async function handleAdd() {
    if (!label.trim()) return;
    await createTimer(DEMO_GAME_ID, { label: label.trim(), durationSeconds: duration });
    setLabel('');
    setDuration(60);
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Timer</h3>
      </div>
      <div className="panel-body">
        {timers.length === 0 && <p className="hint" style={{ margin: 0 }}>No timers running.</p>}
        {timers.map((timer) => (
          <div key={timer.id} className="timer-row">
            <span>{timer.label}</span>
            <span className="timer-time">{formatRemaining(timer.endsAt, now)}</span>
            <button className="row-remove" onClick={() => removeTimer(DEMO_GAME_ID, timer.id)}>✕</button>
          </div>
        ))}

        <div className="timer-add-row">
          <input
            type="text" placeholder="Label" value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div className="timer-add-meta">
          <NumberInput value={duration} onChange={setDuration} min={1} />
          <span className="hint" style={{ margin: 0 }}>seconds</span>
        </div>
        <button className="add-btn" style={{ marginTop: 8 }} onClick={handleAdd}>+ Start Timer</button>
      </div>
    </div>
  );
}
