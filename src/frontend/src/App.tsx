import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { BoardPage } from './pages/BoardPage.tsx';
import { CharacterOverviewPage } from './pages/CharacterOverviewPage.tsx';
import { CharacterCreateWizardPage } from './pages/CharacterCreateWizardPage.tsx';
import { CharacterSheetPage } from './pages/CharacterSheetPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { DocumentsManagePage } from './pages/DocumentsManagePage.tsx';
import { HelpPage } from './pages/HelpPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { MonstersManagePage } from './pages/MonstersManagePage.tsx';
import { NotInvitedPage } from './pages/NotInvitedPage.tsx';
import { NotesPage } from './pages/NotesPage.tsx';
import { PlayersPage } from './pages/PlayersPage.tsx';
import { QuotesPage } from './pages/QuotesPage.tsx';
import { SessionsManagePage } from './pages/SessionsManagePage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { ShopsManagePage } from './pages/ShopsManagePage.tsx';
import { useAuthStore, useIsDm, useMe } from './store/authStore.ts';

// Two shells (see the routing table in the vault's Architecture note):
// MainLayout for everyone — Dashboard, Characters, Board, Notes, Help — and
// ManageLayout, the DM's setup area under /manage with its own header and
// sidebar (matching docs/mockups/DnD_Tool_Manage_Mockup.html). /manage is
// DM-only here (DmOnly) and on the server (GameDm policy).
function MainLayout() {
  const location = useLocation();
  const isDm = useIsDm();

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <span className="glyph">⚔</span>
          <h1>DnD Session Manager</h1>
          <span className="alpha-badge" title="Early test release">Alpha</span>
        </div>
        <UserMenu />
      </header>

      <div className="layout">
        <nav className="sidebar">
          <Link className={`nav-item${location.pathname === '/' ? ' active' : ''}`} to="/">
            <span className="glyph">⌂</span> Dashboard
          </Link>
          <Link className={`nav-item${location.pathname.startsWith('/characters') || location.pathname.startsWith('/character/') ? ' active' : ''}`} to="/characters">
            <span className="glyph">♟</span> Characters
          </Link>
          <Link className={`nav-item${location.pathname.startsWith('/board') ? ' active' : ''}`} to="/board">
            <span className="glyph">⚔</span> Board
          </Link>
          <Link className={`nav-item${location.pathname.startsWith('/notes') ? ' active' : ''}`} to="/notes">
            <span className="glyph">✎</span> Notes
          </Link>
          {isDm && (
            <Link className="nav-item" to="/manage/documents">
              <span className="glyph">☰</span> Manage
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

function ManageLayout() {
  const location = useLocation();
  const item = (path: string, glyph: string, label: string) => (
    <Link className={`nav-item${location.pathname.startsWith(path) ? ' active' : ''}`} to={path}>
      <span className="glyph">{glyph}</span> {label}
    </Link>
  );

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <span className="glyph">⚔</span>
          <h1>DnD Session Manager</h1>
          <span className="sub">— Management</span>
        </div>
        <div className="manage-header-right">
          <Link className="back-link" to="/board">‹ Back to Board</Link>
          <UserMenu />
        </div>
      </header>

      <div className="layout">
        <nav className="sidebar">
          {item('/manage/documents', '★', 'Documents')}
          {item('/manage/monsters', '☠', 'Monsters')}
          {item('/manage/shops', '⚖', 'Shops')}
          {item('/manage/quotes', '❝', 'Quotes')}
          {item('/manage/sessions', '○', 'Sessions')}
          {item('/manage/players', '☷', 'Players')}
          {item('/manage/settings', '⚙', 'Settings')}
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

// DM-only routes: players who type the URL get bounced to the Dashboard
// rather than a page full of 403s.
function DmOnly() {
  return useIsDm() ? <Outlet /> : <Navigate to="/" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/not-invited" element={<NotInvitedPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/characters" element={<CharacterOverviewPage />} />
            <Route path="/characters/new" element={<CharacterCreateWizardPage />} />
            <Route path="/character/:id" element={<CharacterSheetPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/help" element={<HelpPage />} />
            {/* Old bookmark from when Players lived in the main sidebar. */}
            <Route path="/players" element={<Navigate to="/manage/players" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route element={<DmOnly />}>
            <Route path="/manage" element={<ManageLayout />}>
              <Route index element={<Navigate to="documents" replace />} />
              <Route path="documents" element={<DocumentsManagePage />} />
              <Route path="monsters" element={<MonstersManagePage />} />
              <Route path="shops" element={<ShopsManagePage />} />
              <Route path="quotes" element={<QuotesPage />} />
              <Route path="sessions" element={<SessionsManagePage />} />
              <Route path="players" element={<PlayersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
