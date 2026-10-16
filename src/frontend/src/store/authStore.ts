import { create } from 'zustand';
import { authApi } from '../api/auth.ts';
import { ApiError, onAuthFailure } from '../api/client.ts';
import type { Me } from '../types/auth.ts';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  me: Me | null;
  status: AuthStatus;
  error: string | null;
  load: () => Promise<void>;
  logout: () => Promise<void>;
}

// Who's logged in. Loaded once by RequireAuth before any page mounts, so
// everything inside the app shell can rely on `me` being set.
export const useAuthStore = create<AuthState>((set) => ({
  me: null,
  status: 'loading',
  error: null,

  load: async () => {
    set({ status: 'loading', error: null });
    try {
      const me = await authApi.me();
      set({ me, status: 'authenticated' });
    } catch (err) {
      // 401 is the normal "not logged in"; anything else (API down) is shown
      // on the login page instead of looping.
      const error = err instanceof ApiError && err.status === 401 ? null : describeError(err);
      set({ me: null, status: 'anonymous', error });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ me: null, status: 'anonymous', error: null });
    }
  },
}));

// Only valid inside the logged-in shell (RequireAuth guarantees `me`).
export function useMe() {
  const me = useAuthStore((s) => s.me);
  if (!me) throw new Error('useMe() used outside the logged-in app shell');
  return me;
}

export const useGameId = () => useMe().gameId;
export const useIsDm = () => useMe().role === 'Dm';

// 401 anywhere: the session is gone — drop to anonymous so RequireAuth sends
// the person to /login right away. 403: usually just "not allowed to do
// that", but also what a player the DM removed gets everywhere — so ask
// /auth/me once, which answers 401 once there's no membership. /auth/me's own
// failures are handled by load(), never here, so this can't loop.
function dropSession() {
  if (useAuthStore.getState().status === 'authenticated') {
    useAuthStore.setState({ me: null, status: 'anonymous', error: null });
  }
}

onAuthFailure((status, path) => {
  if (path === '/auth/me' || useAuthStore.getState().status !== 'authenticated') return;
  if (status === 401) {
    dropSession();
    return;
  }
  authApi.me().catch((err) => {
    if (err instanceof ApiError && err.status === 401) dropSession();
  });
});

function describeError(err: unknown): string {
  if (err instanceof ApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}
