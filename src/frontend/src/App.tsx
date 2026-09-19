import { BrowserRouter, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from './components/ToastContainer.tsx';
import { QuotesPage } from './pages/QuotesPage.tsx';
import { BoardPage } from './pages/BoardPage.tsx';
import { CharacterOverviewPage } from './pages/CharacterOverviewPage.tsx';
import { CharacterCreateWizardPage } from './pages/CharacterCreateWizardPage.tsx';
import { CharacterSheetPage } from './pages/CharacterSheetPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { DocumentsManagePage } from './pages/DocumentsManagePage.tsx';
import { MonstersManagePage } from './pages/MonstersManagePage.tsx';
import { NotesPage } from './pages/NotesPage.tsx';
import { SessionsManagePage } from './pages/SessionsManagePage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { ShopsManagePage } from './pages/ShopsManagePage.tsx';

// Player-facing shell: /characters, /character/:id, and eventually /, /board, /notes.
function MainLayout() {
  const location = useLocation();
  const isWide = location.pathname.startsWith('/character/') || location.pathname === '/characters/new';
  const isFullWidth = location.pathname.startsWith('/board');

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <span className="glyph">⚔</span>
          <h1>DnD Session Manager</h1>
        </div>
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
          <Link className={`nav-item${location.pathname.startsWith('/manage') ? ' active' : ''}`} to="/manage/documents">
            <span className="glyph">☰</span> Manage
          </Link>
        </nav>

        <main className={isFullWidth ? 'full-width' : isWide ? 'wide' : ''}>
          <Outlet />
        </main>
      </div>
    </>
  );
}

// DM-facing shell: /manage/*, matching docs/mockups/DnD_Tool_Manage_Mockup.html's
// distinct "— Management" header and its own sidebar, separate from the player shell.
function ManageLayout() {
  const location = useLocation();

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <span className="glyph">⚔</span>
          <h1>DnD Session Manager</h1>
          <span className="sub">— Management</span>
        </div>
        <Link className="back-link" to="/board">‹ Back to Board</Link>
      </header>

      <div className="layout">
        <nav className="sidebar">
          <Link className={`nav-item${location.pathname.startsWith('/manage/documents') ? ' active' : ''}`} to="/manage/documents">
            <span className="glyph">★</span> Documents
          </Link>
          <Link className={`nav-item${location.pathname.startsWith('/manage/monsters') ? ' active' : ''}`} to="/manage/monsters">
            <span className="glyph">☠</span> Monsters
          </Link>
          <Link className={`nav-item${location.pathname.startsWith('/manage/shops') ? ' active' : ''}`} to="/manage/shops">
            <span className="glyph">⚖</span> Shops
          </Link>
          <Link className={`nav-item${location.pathname.startsWith('/manage/quotes') ? ' active' : ''}`} to="/manage/quotes">
            <span className="glyph">❝</span> Quotes
          </Link>
          <Link className={`nav-item${location.pathname.startsWith('/manage/sessions') ? ' active' : ''}`} to="/manage/sessions">
            <span className="glyph">○</span> Sessions
          </Link>
          <Link className={`nav-item${location.pathname.startsWith('/manage/settings') ? ' active' : ''}`} to="/manage/settings">
            <span className="glyph">⚙</span> Settings
          </Link>
        </nav>

        <main>
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
          <Route path="/" element={<DashboardPage />} />
          <Route path="/characters" element={<CharacterOverviewPage />} />
          <Route path="/characters/new" element={<CharacterCreateWizardPage />} />
          <Route path="/character/:id" element={<CharacterSheetPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Route>
        <Route path="/manage" element={<ManageLayout />}>
          <Route index element={<DocumentsManagePage />} />
          <Route path="documents" element={<DocumentsManagePage />} />
          <Route path="monsters" element={<MonstersManagePage />} />
          <Route path="shops" element={<ShopsManagePage />} />
          <Route path="quotes" element={<QuotesPage />} />
          <Route path="sessions" element={<SessionsManagePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
