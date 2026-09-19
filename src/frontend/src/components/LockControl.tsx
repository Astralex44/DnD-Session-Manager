import { useEffect, useState } from 'react';
import { locksApi } from '../api/locks.ts';
import { setStoredCode } from '../lib/accessLock.ts';
import { useToastStore } from '../store/toastStore.ts';
import type { ResourceType } from '../types/accessLock.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

interface LockControlProps {
  resourceType: ResourceType;
  resourceKey: string;
}

// Small header/toolbar control to set a protection code for the first time,
// or change an existing one — sits next to AccessGate (which enforces entry)
// rather than inside it, since you view this resource unlocked already to
// see this control at all.
export function LockControl({ resourceType, resourceKey }: LockControlProps) {
  const [locked, setLocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    if (!resourceKey) return;
    locksApi.status(DEMO_GAME_ID, resourceType, resourceKey).then((s) => setLocked(s.locked));
  }, [resourceType, resourceKey]);

  async function handleSubmit() {
    setError(null);
    const result = await locksApi.setCode(DEMO_GAME_ID, resourceType, resourceKey, newCode, locked ? currentCode : undefined);
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong.');
      return;
    }
    setStoredCode(resourceType, resourceKey, newCode);
    setLocked(true);
    setOpen(false);
    setCurrentCode('');
    setNewCode('');
    showToast(locked ? 'Code updated.' : 'Protected with a code.', 'success');
  }

  return (
    <div className="lock-control no-print">
      <button className="btn-ghost" onClick={() => setOpen((o) => !o)}>
        {locked ? '🔒 Protected' : '🔓 Set a code'}
      </button>
      {open && (
        <div className="lock-control-popover">
          {locked && (
            <input
              type="password" placeholder="Current code" value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
            />
          )}
          <input
            type="password" placeholder="New code (min. 4 characters)" value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          {error && <p className="lock-gate-error">{error}</p>}
          <div className="form-actions">
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button onClick={handleSubmit} disabled={newCode.trim().length < 4 || (locked && !currentCode)}>
              {locked ? 'Update' : 'Protect'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
