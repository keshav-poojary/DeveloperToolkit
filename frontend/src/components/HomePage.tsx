import React from 'react';
import AdSenseAd from './AdSenseAd';
import { Link } from 'react-router-dom';
import { TOOLS, CATEGORIES } from '../data/tools';

// Category → accent color (glow + border + text)
const CAT_COLORS: Record<string, { glow: string; border: string; text: string; bg: string }> = {
  encoders:   { glow: '#818cf8', border: 'rgba(129,140,248,0.25)', text: 'text-indigo-400',  bg: 'rgba(99,102,241,0.08)'  },
  formatters: { glow: '#38bdf8', border: 'rgba(56,189,248,0.25)',  text: 'text-sky-400',     bg: 'rgba(14,165,233,0.08)'  },
  generators: { glow: '#fbbf24', border: 'rgba(251,191,36,0.25)',  text: 'text-amber-400',   bg: 'rgba(245,158,11,0.08)'  },
  converters: { glow: '#34d399', border: 'rgba(52,211,153,0.25)',  text: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)'  },
  text:       { glow: '#f472b6', border: 'rgba(244,114,182,0.25)', text: 'text-pink-400',    bg: 'rgba(236,72,153,0.08)'  },
  dev:        { glow: '#fb923c', border: 'rgba(251,146,60,0.25)',  text: 'text-orange-400',  bg: 'rgba(249,115,22,0.08)'  },
  network:    { glow: '#22d3ee', border: 'rgba(34,211,238,0.25)',  text: 'text-cyan-400',    bg: 'rgba(6,182,212,0.08)'   },
  misc:       { glow: '#a78bfa', border: 'rgba(167,139,250,0.25)', text: 'text-violet-400',  bg: 'rgba(139,92,246,0.08)'  },
};

const HomePage: React.FC = () => {
  const popular = TOOLS.filter(t => t.popular);

  return (
    <div className="min-h-full">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-6 pt-14 pb-12 text-center">
        {/* Background orbs */}
        <div className="absolute top-4 left-1/4 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl animate-float pointer-events-none" />
        <div className="absolute top-8 right-1/4 w-56 h-56 rounded-full bg-purple-600/10 blur-3xl animate-float2 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-cyan-500/5 to-transparent blur-2xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-5 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
          {TOOLS.length} tools · free · in your browser
        </div>

        {/* Title */}
        <h1
          className="text-5xl sm:text-6xl font-black tracking-tight mb-4 animate-fade-up"
          style={{ animationDelay: '60ms' }}
        >
          <span className="text-gradient">Developer</span>
          <br />
          <span className="text-white">Toolkit</span>
        </h1>

        <p
          className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed animate-fade-up"
          style={{ animationDelay: '120ms' }}
        >
          Every tool you need — formatters, generators, encoders, converters, network tools and more.
        </p>

        {/* Stats */}
        <div
          className="flex items-center justify-center gap-8 mt-8 animate-fade-up"
          style={{ animationDelay: '180ms' }}
        >
          {[
            { n: TOOLS.length, label: 'Tools' },
            { n: CATEGORIES.length, label: 'Categories' },
            { n: '100%', label: 'Client-side' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-white">{s.n}</p>
              <p className="text-[11px] text-gray-600 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        {/* Home page ad (renders only when VITE_ENABLE_ADS=true) */}
        <div className="mt-6 mx-auto max-w-3xl">
          <AdSenseAd />
        </div>
      </div>

      <div className="px-5 pb-12 max-w-7xl mx-auto">

        {/* ── Popular ─────────────────────────────────────────────── */}
        <section className="mb-10">
          <SectionHeader icon="⚡" label="Popular Tools" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 stagger">
            {popular.map(tool => (
              <ToolCard key={tool.id} tool={tool} catId={tool.category} />
            ))}
          </div>
        </section>

        {/* ── Categories ──────────────────────────────────────────── */}
        {CATEGORIES.map(cat => {
          const tools = TOOLS.filter(t => t.category === cat.id);
          const col = CAT_COLORS[cat.id] || CAT_COLORS.misc;
          return (
            <section key={cat.id} className="mb-10">
              <SectionHeader icon={cat.icon} label={cat.name} count={tools.length} textClass={col.text} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 stagger">
                {tools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} catId={cat.id} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ icon: string; label: string; count?: number; textClass?: string }> = ({
  icon, label, count, textClass = 'text-gray-500',
}) => (
  <div className="flex items-center gap-3 mb-3">
    <span className="text-base">{icon}</span>
    <h2 className={`text-xs font-bold uppercase tracking-widest ${textClass}`}>{label}</h2>
    {count !== undefined && (
      <span className="text-[10px] text-gray-700 font-normal normal-case tracking-normal">({count})</span>
    )}
    <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
  </div>
);

const ToolCard: React.FC<{ tool: { id: string; name: string; description: string; icon: string; popular?: boolean }; catId: string }> = ({ tool, catId }) => {
  const col = CAT_COLORS[catId] || CAT_COLORS.misc;
  return (
    <Link
      to={`/tools/${tool.id}`}
      className="group relative flex flex-col gap-2.5 p-3.5 rounded-2xl border transition-all duration-300 animate-fade-up card-glow overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        borderColor: 'rgba(255,255,255,0.07)',
        ['--glow-color' as any]: col.glow,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = col.border;
        (e.currentTarget as HTMLElement).style.background = col.bg;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)';
      }}
    >
      {/* Hover top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${col.glow}, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <span
          className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 inline-block"
        >
          {tool.icon}
        </span>
        {tool.popular && (
          <span className="text-[9px] font-bold text-amber-400/80 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">
            HOT
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors leading-tight mb-1 line-clamp-1">
          {tool.name}
        </p>
        <p className="text-[11px] text-gray-600 group-hover:text-gray-500 transition-colors leading-snug line-clamp-2">
          {tool.description}
        </p>
      </div>
    </Link>
  );
};

export default HomePage;
