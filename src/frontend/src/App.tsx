import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { CharacterOverviewPage } from './pages/CharacterOverviewPage.tsx';
import { CharacterCreateWizardPage } from './pages/CharacterCreateWizardPage.tsx';
import { CharacterSheetPage } from './pages/CharacterSheetPage.tsx';
import { HelpPage } from './pages/HelpPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { NotInvitedPage } from './pages/NotInvitedPage.tsx';
import { NotesPage } from './pages/NotesPage.tsx';
import { PlayersPage } from './pages/PlayersPage.tsx';
import { useAuthStore, useIsDm, useMe } from './store/authStore.ts';

// Alpha scope (2026-09-19): this first public release is Characters + Notes
// + Help only. Dashboard, Board, and /manage/* are fully built and still in
// git history (see the commit before this one) but aren't ready for real
// players yet, so their nav links, routes, and the ManageLayout shell were
// pulled rather than left reachable — bring them back with a revert once
// they're ready for a real release, don't reintroduce them piecemeal here.
// Players (the DM's access list) is the exception: login can't work without
// it, so it ships with login itself.
const ALPHA_HOME = '/characters';

// Logged-in shell: /characters, /character/:id, /notes, /help, and /players
// for the DM.
function MainLayout() {
  const location = useLocation();
  const isDm = useIsDm();

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <span className="glyph">⚔</span>
          <h1>DnD Session Manager</h1>
          <span className="alpha-badge" title="Early test release — see Help for what's covered so far">Alpha</span>
        </div>
        <UserMenu />
      </header>

      <div className="layout">
        <nav className="sidebar">
          <Link className={`nav-item${location.pathname.startsWith('/characters') || location.pathname.startsWith('/character/') ? ' active' : ''}`} to="/characters">
            <span className="glyph">♟</span> Characters
          </Link>
          <Link className={`nav-item${location.pathname.startsWith('/notes') ? ' active' : ''}`} to="/notes">
            <span className="glyph">✎</span> Notes
          </Link>
          {isDm && (
            <Link className={`nav-item${location.pathname.startsWith('/players') ? ' active' : ''}`} to="/players">
              <span className="glyph">☷</span> Players
            </Link>
          )}
          <Link className={`nav-item${location.pathname.startsWith('/help') ? ' active' : ''}`} to="/help">
            <span className="glyph">❔</span> Help
          </Link>
        </nav>

        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}

function UserMenu() {
  const me = useMe();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="user-menu">
      {me.avatarUrl && <img className="user-avatar" src={me.avatarUrl} alt="" />}
      <span className="user-name">{me.username}</span>
      {me.role === 'Dm' && <span className="role-badge">DM</span>}
      <button className="btn-set-active" onClick={handleLogout}>Log out</button>
    </div>
  );
}

// DM-only route: players who type the URL get bounced home rather than a
// page full of 403s.
function DmOnly() {
  return useIsDm() ? <Outlet /> : <Navigate to={ALPHA_HOME} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/not-invited" element={<NotInvitedPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to={ALPHA_HOME} replace />} />
            <Route path="/characters" element={<CharacterOverviewPage />} />
            <Route path="/characters/new" element={<CharacterCreateWizardPage />} />
            <Route path="/character/:id" element={<CharacterSheetPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route element={<DmOnly />}>
              <Route path="/players" element={<PlayersPage />} />
            </Route>
            <Route path="/help" element={<HelpPage />} />
            <Route path="*" element={<Navigate to={ALPHA_HOME} replace />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
