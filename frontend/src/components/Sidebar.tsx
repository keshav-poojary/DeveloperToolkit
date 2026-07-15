import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, ChevronDown, X,
  Key, Clock, Menu, LogOut, Sparkles, Zap, Home, ArrowRight,
} from 'lucide-react';
import { TOOLS, CATEGORIES } from '../data/tools';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps { open: boolean; onClose: () => void; }

const CAT_COLORS: Record<string, { glow: string; text: string; bg: string }> = {
  encoders:   { glow: '#818cf8', text: '#a5b4fc', bg: 'rgba(99,102,241,0.12)'   },
  formatters: { glow: '#38bdf8', text: '#7dd3fc', bg: 'rgba(14,165,233,0.12)'   },
  generators: { glow: '#fbbf24', text: '#fde68a', bg: 'rgba(245,158,11,0.12)'   },
  converters: { glow: '#34d399', text: '#6ee7b7', bg: 'rgba(16,185,129,0.12)'   },
  text:       { glow: '#f472b6', text: '#f9a8d4', bg: 'rgba(236,72,153,0.12)'   },
  dev:        { glow: '#fb923c', text: '#fdba74', bg: 'rgba(249,115,22,0.12)'   },
  network:    { glow: '#22d3ee', text: '#67e8f9', bg: 'rgba(6,182,212,0.12)'    },
  misc:       { glow: '#a78bfa', text: '#c4b5fd', bg: 'rgba(139,92,246,0.12)'   },
};

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CATEGORIES.map(c => [c.id, true]))
  );
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const searchRef = useRef<HTMLInputElement>(null);
  const currentId = location.pathname.split('/').pop();

  const toggle = (id: string) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  const filtered = search.trim()
    ? TOOLS.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    : null;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const activeCatId = TOOLS.find(t => t.id === currentId)?.category;
  const activeGlow = activeCatId ? CAT_COLORS[activeCatId]?.glow : '#6366f1';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', animation: 'fadeIn .2s ease' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-40 w-64 flex-shrink-0
          flex flex-col h-full
          border-r border-white/[0.06]
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(160deg, #0e0e1e 0%, #080810 60%, #0a0814 100%)',
          overflow: 'hidden',
        }}
      >
        {/* ── Decorative background layers ───────────────────── */}
        <div className="pointer-events-none absolute inset-0">
          {/* Top-left radial */}
          <div
            className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-30 animate-float"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }}
          />
          {/* Bottom-right radial */}
          <div
            className="absolute -bottom-16 -right-8 w-40 h-40 rounded-full opacity-20 animate-float2"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)' }}
          />
          {/* Active cat color bleeds in */}
          {activeGlow && (
            <div
              className="absolute top-0 left-0 right-0 h-1 transition-all duration-700"
              style={{ background: `linear-gradient(90deg, transparent, ${activeGlow}60, transparent)` }}
            />
          )}
          {/* Vertical grid lines */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 80px)',
          }} />
        </div>

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="relative flex-shrink-0 px-3 pt-3 pb-3 space-y-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Link to="/" onClick={onClose} className="group flex items-center gap-2.5 flex-1 min-w-0">
              {/* Logo icon with spinning ring */}
              <div className="relative w-9 h-9 flex-shrink-0">
                {/* Outer spinning ring */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)',
                    animation: 'spin 3s linear infinite',
                    padding: '1px',
                    borderRadius: '10px',
                  }}
                />
                {/* Glow behind */}
                <div className="absolute inset-0.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                {/* Icon surface */}
                <div
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center text-base group-hover:scale-105 transition-transform duration-300"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  🛠️
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white leading-none tracking-tight">DevToolkit</p>
                <p className="text-[10px] mt-0.5 flex items-center gap-1 font-medium" style={{ color: '#818cf8' }}>
                  <Zap size={8} className="flex-shrink-0" />{TOOLS.length} tools
                </p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/8 transition-all"
            >
              <X size={14} />
            </button>
          </div>

          {/* User / Sign-in */}
          {user ? (
            <div
              className="relative overflow-hidden rounded-xl p-0.5"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.2), rgba(6,182,212,0.1))' }}
            >
              <div
                className="relative rounded-[10px] p-2.5 flex items-center gap-2.5"
                style={{ background: 'linear-gradient(135deg, rgba(15,10,30,0.95), rgba(10,8,20,0.95))' }}
              >
                {/* Shimmer top line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(129,140,248,0.5) 50%, transparent 90%)' }} />
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-full blur-sm opacity-70" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }} />
                  <div className="relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white leading-none truncate">{user.name || user.email.split('@')[0]}</p>
                  <p className="text-[10px] truncate mt-0.5 font-medium" style={{ color: 'rgba(129,140,248,0.5)' }}>{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                >
                  <LogOut size={11} />
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(99,102,241,0.2)' }}
            >
              {/* Multi-layer bg */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(124,58,237,0.06) 50%, rgba(6,182,212,0.04) 100%)' }} />
              {/* Shimmer sweep */}
              <div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-in-out"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.12), transparent)' }}
              />
              {/* Border glow on hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.4)' }} />

              <div
                className="relative w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:border-indigo-400/50 transition-all duration-300"
                style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.25)' }}
              >
                <Sparkles size={14} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-xs font-extrabold text-indigo-300 group-hover:text-indigo-200 transition-colors">Sign in free</p>
                <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'rgba(99,102,241,0.45)' }}>History · API keys · sync</p>
              </div>
              <ArrowRight size={12} className="relative text-indigo-700 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>
          )}

          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools…   ⌘K"
              className="w-full rounded-xl pl-7 pr-7 py-2 text-xs text-gray-300 placeholder-gray-700 focus:outline-none transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onFocus={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.12), 0 0 16px rgba(99,102,241,0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {search ? (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                <X size={11} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Thin separator with gradient */}
        <div className="relative flex-shrink-0 h-px mx-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 50%, transparent)' }} />

        {/* ── NAV ────────────────────────────────────────────── */}
        <nav className="relative flex-1 overflow-y-auto px-2 pt-2 pb-4">

          {/* Top nav items */}
          <div className="space-y-0.5 mb-1">
            <NavLink to="/"           icon={<Home size={12}  />} label="Home"       active={location.pathname === '/'}            onClick={onClose} />
            <NavLink to="/history"    icon={<Clock size={12} />} label="History"    active={location.pathname === '/history'}     onClick={onClose} />
            <NavLink to="/api-access" icon={<Key size={12}   />} label="API Access" active={location.pathname === '/api-access'}  onClick={onClose} />
          </div>

          {/* Divider */}
          <div className="my-2 mx-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 50%, transparent)' }} />

          {/* Tool list */}
          {filtered ? (
            <div className="animate-slide-left">
              <div className="flex items-center gap-2 px-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#818cf8' }}>{filtered.length} results</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,0.2)' }} />
              </div>
              {filtered.map(t => (
                <ToolItem key={t.id} tool={t} active={currentId === t.id} catId={t.category} onClick={onClose} />
              ))}
            </div>
          ) : (
            CATEGORIES.map(cat => {
              const tools = TOOLS.filter(t => t.category === cat.id);
              const isOpen = !collapsed[cat.id];
              const col = CAT_COLORS[cat.id] || CAT_COLORS.misc;
              const isHovered = hoveredCat === cat.id;

              return (
                <div key={cat.id} className="mb-0.5">
                  <button
                    onClick={() => toggle(cat.id)}
                    onMouseEnter={() => setHoveredCat(cat.id)}
                    onMouseLeave={() => setHoveredCat(null)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl transition-all duration-200 group"
                    style={{
                      background: isHovered ? col.bg : 'transparent',
                    }}
                  >
                    <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest transition-colors duration-200"
                      style={{ color: isHovered ? col.text : 'rgba(75,85,99,1)' }}
                    >
                      <span
                        className="text-sm transition-all duration-200"
                        style={{ filter: isHovered ? `drop-shadow(0 0 6px ${col.glow})` : 'none', transform: isHovered ? 'scale(1.15)' : 'scale(1)' }}
                      >
                        {cat.icon}
                      </span>
                      {cat.name}
                      <span className="font-normal normal-case tracking-normal text-gray-700">({tools.length})</span>
                    </span>
                    <ChevronDown
                      size={10}
                      className="transition-all duration-300"
                      style={{
                        color: isHovered ? col.glow : 'rgba(75,85,99,0.7)',
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      }}
                    />
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? `${tools.length * 36}px` : '0px', opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="ml-1 mt-0.5 space-y-0.5 pb-1">
                      {tools.map(t => (
                        <ToolItem key={t.id} tool={t} active={currentId === t.id} catId={cat.id} onClick={onClose} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </nav>
      </aside>
    </>
  );
};

/* ── Nav link (Home / History / API) ──────────────────────── */
const NavLink: React.FC<{
  to: string; icon: React.ReactNode; label: string; active: boolean; onClick?: () => void;
}> = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 relative overflow-hidden group"
    style={active ? {
      background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))',
      color: '#a5b4fc',
      boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.25), 0 0 12px rgba(99,102,241,0.1)',
    } : { color: 'rgba(107,114,128,1)' }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e2e8f0'; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(107,114,128,1)'; }}}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full" style={{ background: '#6366f1', boxShadow: '0 0 6px #6366f1' }} />
    )}
    <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>
    <span>{label}</span>
    {active && <div className="absolute inset-0 rounded-xl opacity-20" style={{ background: 'radial-gradient(ellipse at 20% 50%, #6366f1 0%, transparent 60%)' }} />}
  </Link>
);

/* ── Tool sidebar item ─────────────────────────────────────── */
const ToolItem: React.FC<{
  tool: { id: string; name: string; icon: string; popular?: boolean };
  active: boolean; catId: string; onClick?: () => void;
}> = ({ tool, active, catId, onClick }) => {
  const col = CAT_COLORS[catId] || CAT_COLORS.misc;
  return (
    <Link
      to={`/tools/${tool.id}`}
      onClick={onClick}
      className="group flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 relative overflow-hidden"
      style={active ? {
        background: col.bg,
        color: col.text,
        boxShadow: `inset 0 0 0 1px ${col.glow}30, inset 3px 0 0 ${col.glow}`,
      } : { color: 'rgba(107,114,128,1)' }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.color = '#d1d5db';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(107,114,128,1)';
        }
      }}
    >
      {active && (
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse at 0% 50%, ${col.glow}40 0%, transparent 60%)` }}
        />
      )}
      <span
        className="relative text-sm leading-none flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:-rotate-6"
        style={active ? { filter: `drop-shadow(0 0 5px ${col.glow}90)` } : {}}
      >
        {tool.icon}
      </span>
      <span className="relative truncate flex-1">{tool.name}</span>
      {tool.popular && !active && (
        <span
          className="relative text-[9px] font-black flex-shrink-0"
          style={{ color: '#f59e0b', textShadow: '0 0 4px rgba(245,158,11,0.5)' }}
        >★</span>
      )}
    </Link>
  );
};

export { Menu, Key, Clock };
export default Sidebar;
