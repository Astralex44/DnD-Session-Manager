import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';

// Wraps the whole app shell: loads /api/auth/me once, then either renders the
// app (with `me` guaranteed for useMe/useGameId) or sends the person to the
// login page with a returnUrl back to where they were heading.
export function RequireAuth() {
  const { status, load } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (status === 'loading') load();
  }, [status, load]);

  if (status === 'loading') return <div className="auth-loading">Loading…</div>;
  if (status === 'anonymous') {
    const returnUrl = location.pathname + location.search;
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }
  return <Outlet />;
}
