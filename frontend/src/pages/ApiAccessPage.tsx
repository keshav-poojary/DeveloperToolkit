import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Copy, Check, Key, Clock,
  Sparkles, BookOpen, Zap, GitBranch, Shield, Bell,
} from 'lucide-react';
import { api, type ApiKeyRecord } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const COMING_SOON = [
  { icon: <BookOpen size={14} />,  title: 'Full API Docs',         desc: 'Interactive Swagger docs for every tool endpoint' },
  { icon: <Zap size={14} />,       title: 'Tool Endpoints',        desc: 'Call any of the 55+ tools via REST API' },
  { icon: <GitBranch size={14} />, title: 'Webhooks',              desc: 'Get notified when long-running jobs complete' },
  { icon: <Shield size={14} />,    title: 'Rate limit dashboard',  desc: 'Monitor usage, quotas and request logs' },
];

const ApiAccessPage: React.FC = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.listApiKeys().then(setKeys).catch(console.error);
    }
  }, [user]);

  const create = async () => {
    setError('');
    setLoading(true);
    try {
      const key = await api.createApiKey(label || undefined);
      setKeys(prev => [key, ...prev]);
      setLabel('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    await api.deleteApiKey(id);
    setKeys(prev => prev.filter(k => k.id !== id));
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 animate-float">
          <Key size={28} className="text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">API Access</h2>
        <p className="text-gray-500 mb-6 text-sm max-w-xs">Sign in to generate API keys and access DevToolkit programmatically.</p>
        <Link
          to="/login"
          className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        >
          <Sparkles size={14} /> Sign in free
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-up">

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link to="/" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all">
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            API Access
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 uppercase tracking-widest">Beta</span>
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">Programmatic access to DevToolkit</p>
        </div>
      </div>

      {/* ── Coming Soon notice ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 mb-6">
        {/* Animated gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-indigo-950/60" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl animate-float2 pointer-events-none" />

        <div className="relative p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
              <Bell size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">More features & full docs rolling out soon</p>
              <p className="text-xs text-gray-500 mt-0.5">
                API access is in early beta. Keys you generate today will continue to work as we expand the platform.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COMING_SOON.map(f => (
              <div
                key={f.title}
                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 transition-colors"
              >
                <span className="text-indigo-400/70 mt-0.5 flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-300">{f.title}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-gray-600">
              Stay updated — follow{' '}
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                
              </a>
              {' '}on GitHub for release notes.
            </p>
          </div>
        </div>
      </div>

      {/* ── Base URL ────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4 mb-5 border border-white/5"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Base URL</p>
        <code className="text-sm text-indigo-300 font-mono">
          {import.meta.env.VITE_API_URL || 'http://localhost:3001'}
        </code>
        <p className="text-xs text-gray-700 mt-2">
          Authenticate with: <code className="text-gray-500 bg-white/5 px-1.5 py-0.5 rounded text-[11px]">Authorization: Bearer dtk_...</code>
        </p>
      </div>

      {/* ── Generate key ────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4 mb-5 border border-white/5"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Generate New Key</h2>
        {error && (
          <p className="text-red-400 text-xs mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{error}
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="Key label  (optional)"
            className="flex-1 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-700 focus:outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(99,102,241,0.2)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <button
            onClick={create}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all disabled:opacity-40 hover:shadow-[0_0_16px_rgba(99,102,241,0.35)]"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Plus size={14} /> Generate</>
            }
          </button>
        </div>
      </div>

      {/* ── Keys list ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        {keys.length === 0 && (
          <div className="text-center py-10 text-gray-700">
            <Key size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No API keys yet</p>
            <p className="text-xs mt-1">Generate one above to get started</p>
          </div>
        )}
        {keys.map(k => (
          <div
            key={k.id}
            className="group rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all"
            style={{ background: 'rgba(255,255,255,0.025)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-gray-200 truncate">{k.label || 'Untitled key'}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                    k.active
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'bg-gray-800 text-gray-600 border border-gray-700'
                  }`}>
                    {k.active ? 'active' : 'revoked'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <code className="text-xs text-gray-600 font-mono truncate max-w-[200px]">{k.key}</code>
                  <button
                    onClick={() => copyKey(k.key, k.id)}
                    className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-gray-700 hover:text-gray-300 hover:bg-white/5 transition-all"
                  >
                    {copiedId === k.id
                      ? <Check size={11} className="text-emerald-400" />
                      : <Copy size={11} />
                    }
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-gray-700">
                  <span className="flex items-center gap-1"><Clock size={9} />{new Date(k.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <Zap size={9} />{k.usageCount} {k.usageCount === 1 ? 'use' : 'uses'}
                  </span>
                  {k.lastUsedAt && (
                    <span>Last used {new Date(k.lastUsedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => remove(k.id)}
                className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiAccessPage;
