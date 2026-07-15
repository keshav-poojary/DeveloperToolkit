import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Clock, ChevronRight, History } from 'lucide-react';
import { api, type HistoryEntry } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.getHistory(100)
      .then(setHistory)
      .catch(e => setError(e.message || 'Could not load history'))
      .finally(() => setLoading(false));
  }, [user]);

  const remove = async (id: string) => {
    await api.deleteHistory(id).catch(() => {});
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const clearAll = async () => {
    if (!confirm('Clear all history?')) return;
    await api.clearHistory().catch(() => {});
    setHistory([]);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 animate-float">
          <History size={28} className="text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Your history lives here</h2>
        <p className="text-gray-500 mb-6 text-sm max-w-xs">
          Sign in and every tool you open is automatically saved so you can jump back instantly.
        </p>
        <Link
          to="/login"
          className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        >
          Sign in free
        </Link>
      </div>
    );
  }

  // Group by date
  const groups: Record<string, HistoryEntry[]> = {};
  history.forEach(h => {
    const d = new Date(h.createdAt);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    let day: string;
    if (d.toDateString() === today.toDateString()) day = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) day = 'Yesterday';
    else day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    (groups[day] ||= []).push(h);
  });

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-up">

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">History</h1>
            <p className="text-xs text-gray-600 mt-0.5">{history.length} entries</p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-400 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-all"
          >
            <Trash2 size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/8 text-red-400 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          {error} — make sure the backend is running.
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-600">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading history…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && history.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 opacity-20">📭</div>
          <p className="text-gray-600 text-sm">No history yet</p>
          <p className="text-gray-700 text-xs mt-1">Open any tool and it will appear here</p>
          <Link to="/" className="inline-flex items-center gap-1.5 mt-5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Browse tools <ChevronRight size={12} />
          </Link>
        </div>
      )}

      {/* Groups */}
      {Object.entries(groups).map(([day, entries]) => (
        <div key={day} className="mb-6">
          {/* Day header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-600">{day}</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <span className="text-[10px] text-gray-700">{entries.length}</span>
          </div>

          <div className="space-y-1.5">
            {entries.map(h => (
              <div
                key={h.id}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 border border-white/5 hover:border-white/10 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.025)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
              >
                <Link to={`/tools/${h.toolId}`} className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{h.toolName}</span>
                      <span className="text-[10px] text-gray-700 flex items-center gap-0.5">
                        <Clock size={9} />
                        {new Date(h.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {h.input && (
                      <p className="text-[11px] text-gray-600 truncate font-mono">{h.input.slice(0, 60)}</p>
                    )}
                  </div>
                  <ChevronRight size={13} className="text-gray-700 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                </Link>
                <button
                  onClick={() => remove(h.id)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryPage;
