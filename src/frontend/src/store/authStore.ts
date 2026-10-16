import { create } from 'zustand';
import { authApi } from '../api/auth.ts';
import { ApiError } from '../api/client.ts';
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

function describeError(err: unknown): string {
  if (err instanceof ApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}
