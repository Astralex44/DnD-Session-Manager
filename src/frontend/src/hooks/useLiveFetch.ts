import { useEffect } from 'react';
import { onGameEvent } from '../lib/realtime.ts';

const FALLBACK_POLL_MS = 20000;

// Fetches once on mount, then stays fresh via SignalR push (lib/realtime.ts)
// the instant the backend broadcasts `eventName` for this game, with a slow
// fallback poll as a safety net for whenever the hub connection is down.
// `fetchFn` must be a stable reference across renders (a Zustand store
// action, not an inline closure) — otherwise this resubscribes every render.
export function useLiveFetch(gameId: string, eventName: string, fetchFn: (gameId: string) => void): void {
  useEffect(() => {
    fetchFn(gameId);
    const unsubscribe = onGameEvent(gameId, eventName, () => fetchFn(gameId));
    const interval = setInterval(() => fetchFn(gameId), FALLBACK_POLL_MS);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [gameId, eventName, fetchFn]);
}
