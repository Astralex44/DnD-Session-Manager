import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from './components/ToastContainer.tsx';
import { CharacterOverviewPage } from './pages/CharacterOverviewPage.tsx';
import { CharacterCreateWizardPage } from './pages/CharacterCreateWizardPage.tsx';
import { CharacterSheetPage } from './pages/CharacterSheetPage.tsx';
import { HelpPage } from './pages/HelpPage.tsx';
import { NotesPage } from './pages/NotesPage.tsx';

// Alpha scope (2026-09-19): this first public release is Characters + Notes
// + Help only. Dashboard, Board, and /manage/* are fully built and still in
// git history (see the commit before this one) but aren't ready for real
// players yet, so their nav links, routes, and the ManageLayout shell were
// pulled rather than left reachable — bring them back with a revert once
// they're ready for a real release, don't reintroduce them piecemeal here.
const ALPHA_HOME = '/characters';

// Player-facing shell: /characters, /character/:id, /notes, /help.
function MainLayout() {
  const location = useLocation();
  const isWide = location.pathname.startsWith('/character/') || location.pathname === '/characters/new';

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <span className="glyph">⚔</span>
          <h1>DnD Session Manager</h1>
          <span className="alpha-badge" title="Early test release — see Help for what's covered so far">Alpha</span>
        </div>
      </header>

      <div className="layout">
        <nav className="sidebar">
          <Link className={`nav-item${location.pathname.startsWith('/characters') || location.pathname.startsWith('/character/') ? ' active' : ''}`} to="/characters">
            <span className="glyph">♟</span> Characters
          </Link>
          <Link className={`nav-item${location.pathname.startsWith('/notes') ? ' active' : ''}`} to="/notes">
            <span className="glyph">✎</span> Notes
          </Link>
          <Link className={`nav-item${location.pathname.startsWith('/help') ? ' active' : ''}`} to="/help">
            <span className="glyph">❔</span> Help
          </Link>
        </nav>

        <main className={isWide ? 'wide' : ''}>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to={ALPHA_HOME} replace />} />
          <Route path="/characters" element={<CharacterOverviewPage />} />
          <Route path="/characters/new" element={<CharacterCreateWizardPage />} />
          <Route path="/character/:id" element={<CharacterSheetPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to={ALPHA_HOME} replace />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
