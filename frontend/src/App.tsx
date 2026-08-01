import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import ToolPage from './components/ToolPage';
import { AuthProvider } from './contexts/AuthContext';
import KeyboardShortcuts from './components/KeyboardShortcuts';

const LoginPage    = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const HistoryPage  = lazy(() => import('./pages/HistoryPage'));
const ApiAccessPage = lazy(() => import('./pages/ApiAccessPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-full gap-3">
    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-sm text-gray-500">Loading…</span>
  </div>
);

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '?') setShortcutsOpen(s => !s);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
              {/* Mobile top bar */}
              <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0a0a0f]">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 hover:text-gray-200 transition-colors"
                >
                  <Menu size={20} />
                </button>
                <span className="text-sm font-bold text-white tracking-tight">🛠️ DevToolkit</span>
              </div>

              <main className="flex-1 min-h-0 overflow-y-auto">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/"            element={<HomePage />} />
                    <Route path="/tools/:id"   element={<ToolPage />} />
                    <Route path="/login"       element={<LoginPage />} />
                    <Route path="/register"    element={<RegisterPage />} />
                    <Route path="/history"     element={<HistoryPage />} />
                    <Route path="/api-access"  element={<ApiAccessPage />} />
                  </Routes>
                </Suspense>
              </main>
              <KeyboardShortcuts open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
            </div>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
