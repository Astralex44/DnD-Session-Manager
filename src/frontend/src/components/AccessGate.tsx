import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { locksApi } from '../api/locks.ts';
import { getStoredCode, setStoredCode } from '../lib/accessLock.ts';
import type { ResourceType } from '../types/accessLock.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';

interface AccessGateProps {
  resourceType: ResourceType;
  resourceKey: string;
  label: string;
  children: ReactNode;
}

type GateState = 'checking' | 'open' | 'locked';

// Blocks its children from ever mounting (so they never fetch) until either
// no code is set for this resource, or the right one has been entered —
// see AccessLock: temporary/simple, not real auth. Re-checks whenever
// resourceKey changes (e.g. the Notes owner picker switching people).
export function AccessGate({ resourceType, resourceKey, label, children }: AccessGateProps) {
  const [state, setState] = useState<GateState>('checking');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!resourceKey) return;
    let cancelled = false;
    setState('checking');
    setCode('');
    setError(null);

    locksApi.status(DEMO_GAME_ID, resourceType, resourceKey)
      .then((status) => {
        if (cancelled) return;
        if (!status.locked) {
          setState('open');
          return;
        }
        setState(getStoredCode(resourceType, resourceKey) ? 'open' : 'locked');
      })
      // A network hiccup shouldn't lock someone out of their own sheet —
      // fail open, same spirit as the rest of this being "simple, not exhaustive".
      .catch(() => setState('open'));

    return () => {
      cancelled = true;
    };
  }, [resourceType, resourceKey]);

  async function handleUnlock() {
    setBusy(true);
    setError(null);
    try {
      const result = await locksApi.verify(DEMO_GAME_ID, resourceType, resourceKey, code);
      if (result.ok) {
        setStoredCode(resourceType, resourceKey, code);
        setState('open');
      } else {
        setError(result.error ?? 'Code is incorrect.');
      }
    } finally {
      setBusy(false);
    }
  }

  if (state === 'checking') return null;
  if (state === 'open') return <>{children}</>;

  return (
    <div className="lock-gate">
      <div className="lock-gate-box">
        <div className="lock-gate-icon">🔒</div>
        <h3>Protected</h3>
        <p className="hint">Enter the code to open {label}.</p>
        <input
          type="password" autoFocus value={code} placeholder="Code"
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !busy && handleUnlock()}
        />
        {error && <p className="lock-gate-error">{error}</p>}
        <button onClick={handleUnlock} disabled={busy || !code}>Unlock</button>
      </div>
    </div>
  );
}
