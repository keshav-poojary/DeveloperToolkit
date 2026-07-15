import React, { Suspense, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { TOOLS, CATEGORIES } from '../data/tools';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const CAT_GLOW: Record<string, string> = {
  encoders: '#818cf8', formatters: '#38bdf8', generators: '#fbbf24',
  converters: '#34d399', text: '#f472b6', dev: '#fb923c',
  network: '#22d3ee', misc: '#a78bfa',
};

const ToolPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const tool = TOOLS.find(t => t.id === id);

  // Auto-save to history when a logged-in user visits a tool
  useEffect(() => {
    if (!tool || !user) return;
    api.saveHistory({
      toolId: tool.id,
      toolName: tool.name,
      input: '',
      output: '',
    }).catch(() => { /* backend may not be running in dev */ });
  }, [tool?.id, user?.id]);

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-up">
        <div className="text-6xl mb-4 animate-float">🔍</div>
        <h2 className="text-xl font-bold text-white mb-2">Tool not found</h2>
        <p className="text-gray-500 mb-6 text-sm">No tool with id &ldquo;{id}&rdquo; exists.</p>
        <Link
          to="/"
          className="flex items-center gap-2 text-sm bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    );
  }

  const cat = CATEGORIES.find(c => c.id === tool.category);
  const glow = CAT_GLOW[tool.category] || '#818cf8';
  const Component = tool.component;

  return (
    <div className="h-full flex flex-col animate-scale-in">
      {/* ── Breadcrumb bar ────────────────────────────────────── */}
      <div
        className="relative flex items-center gap-1.5 px-5 py-2.5 border-b border-white/5"
        style={{ background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(12px)' }}
      >
        {/* Glow line at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-40"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${glow} 30%, ${glow} 70%, transparent 100%)` }}
        />

        <Link
          to="/"
          className="flex items-center justify-center w-6 h-6 rounded-lg text-gray-600 hover:text-gray-200 hover:bg-white/5 transition-all"
        >
          <ArrowLeft size={13} />
        </Link>

        <ChevronRight size={11} className="text-gray-700 flex-shrink-0" />

        <span className="text-xs text-gray-600 flex items-center gap-1">
          {cat?.icon} {cat?.name}
        </span>

        <ChevronRight size={11} className="text-gray-700 flex-shrink-0" />

        <span className="text-xs font-semibold text-gray-300">{tool.name}</span>

        {/* Tool icon accent */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm">{tool.icon}</span>
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: glow, boxShadow: `0 0 6px ${glow}` }}
          />
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl animate-float"
                style={{ background: `${glow}20`, border: `1px solid ${glow}40` }}
              >
                {tool.icon}
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${glow}60`, borderTopColor: 'transparent' }}
                />
                Loading {tool.name}…
              </div>
            </div>
          }
        >
          <Component />
        </Suspense>
      </div>
    </div>
  );
};

export default ToolPage;
