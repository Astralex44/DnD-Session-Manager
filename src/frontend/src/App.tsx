import { useEffect, useRef, useState } from 'react';
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
import { useLiveFetch } from './hooks/useLiveFetch.ts';
import { useAuthStore, useGameId, useIsDm, useMe } from './store/authStore.ts';
import { useCharactersStore } from './store/charactersStore.ts';

// One shell for everything (see the routing table in the vault's Architecture
// note). The DM's setup pages live under /manage as an expandable "Manage"
// group in the same sidebar — not a separate area with its own header, so the
// Board is always one click away during a session. /manage is DM-only here
// (DmOnly) and on the server (GameDm policy).
const MANAGE_ITEMS: [path: string, glyph: string, label: string][] = [
  ['/manage/documents', '★', 'Documents'],
  ['/manage/monsters', '☠', 'Monsters'],
  ['/manage/shops', '⚖', 'Shops'],
  ['/manage/quotes', '❝', 'Quotes'],
  ['/manage/sessions', '○', 'Sessions'],
  ['/manage/players', '☷', 'Players'],
  ['/manage/settings', '⚙', 'Settings'],
];
const MANAGE_OPEN_KEY = 'dnd.sidebar.manageOpen';

function MainLayout() {
  const location = useLocation();
  const isDm = useIsDm();
  const nav = (active: boolean) => `nav-item${active ? ' active' : ''}`;
  const charactersTarget = useCharactersLinkTarget();

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
          <Link className={nav(location.pathname === '/')} to="/">
            <span className="glyph">⌂</span> Dashboard
          </Link>
          <Link className={nav(location.pathname.startsWith('/characters') || location.pathname.startsWith('/character/'))} to={charactersTarget}>
            <span className="glyph">♟</span> Characters
          </Link>
          <Link className={nav(location.pathname.startsWith('/board'))} to="/board">
            <span className="glyph">⚔</span> Board
          </Link>
          <Link className={nav(location.pathname.startsWith('/notes'))} to="/notes">
            <span className="glyph">✎</span> Notes
          </Link>
          {isDm && <ManageGroup />}
          <Link className={nav(location.pathname.startsWith('/help'))} to="/help">
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

// "Characters" in the sidebar: the DM gets the list of everyone's
// characters; a player jumps straight to the sheet of their active character
// (one per player, enforced on the server), or the list when there's none —
// to create one or pick one. Kept live, so setting another character active
// updates the link at once.
function useCharactersLinkTarget(): string {
  const gameId = useGameId();
  const isDm = useIsDm();
  const { characters, fetchCharacters } = useCharactersStore();
  useLiveFetch(gameId, 'characters', fetchCharacters);
  if (isDm) return '/characters';
  const active = characters.find((c) => c.status === 'active');
  return active ? `/character/${active.id}` : '/characters';
}

// DM only. Opens itself when you're on a Manage page and stays open; the
// browser remembers whether you last left it open or closed.
function ManageGroup() {
  const location = useLocation();
  const onManagePage = location.pathname.startsWith('/manage');
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(MANAGE_OPEN_KEY) === '1';
    } catch {
      return false;
    }
  });
  // Arriving on a Manage page opens the group, and it stays open after you
  // leave (e.g. jumping to the Board mid-session) until you close it yourself.
  // Adjusting state during render, guarded, is React's pattern for this — no
  // effect needed.
  if (onManagePage && !open) setOpen(true);
  const expanded = open || onManagePage;

  function toggle() {
    const next = !expanded;
    setOpen(next);
    try {
      localStorage.setItem(MANAGE_OPEN_KEY, next ? '1' : '0');
    } catch {
      // Storage blocked — the group just won't remember its state.
    }
  }

  return (
    <div className="nav-group">
      <button
        type="button"
        className={`nav-item nav-group-toggle${onManagePage ? ' active-parent' : ''}`}
        aria-expanded={expanded}
        onClick={toggle}
      >
        <span className="glyph">☰</span> Manage
        <span className="nav-caret">{expanded ? '▾' : '▸'}</span>
      </button>
      {expanded && (
        <div className="nav-sub">
          {MANAGE_ITEMS.map(([path, glyph, label]) => (
            <Link key={path} className={`nav-item nav-sub-item${location.pathname.startsWith(path) ? ' active' : ''}`} to={path}>
              <span className="glyph">{glyph}</span> {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Profile button top right; logging out sits behind it, not out in the open.
// Closes on a click outside or Escape.
function UserMenu() {
  const me = useMe();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="user-menu" ref={rootRef}>
      {me.role === 'Dm' && <span className="role-badge">DM</span>}
      <button
        type="button"
        className="user-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {me.avatarUrl ? <img className="user-avatar" src={me.avatarUrl} alt="" /> : <span className="user-avatar placeholder" />}
        <span className="user-name">{me.username}</span>
        <span className="user-menu-caret">▾</span>
      </button>
      {open && (
        <div className="user-menu-dropdown" role="menu">
          <button type="button" role="menuitem" onClick={handleLogout}>Log out</button>
        </div>
      )}
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
            <Route element={<DmOnly />}>
              <Route path="/manage" element={<Navigate to="/manage/documents" replace />} />
              <Route path="/manage/documents" element={<DocumentsManagePage />} />
              <Route path="/manage/monsters" element={<MonstersManagePage />} />
              <Route path="/manage/shops" element={<ShopsManagePage />} />
              <Route path="/manage/quotes" element={<QuotesPage />} />
              <Route path="/manage/sessions" element={<SessionsManagePage />} />
              <Route path="/manage/players" element={<PlayersPage />} />
              <Route path="/manage/settings" element={<SettingsPage />} />
            </Route>
            {/* Old bookmark from when Players lived in the main sidebar. */}
            <Route path="/players" element={<Navigate to="/manage/players" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
