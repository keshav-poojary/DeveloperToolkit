import React, { useState } from 'react';

const API = 'http://localhost:3001/api/network';

const SslTool: React.FC = () => {
  const [host, setHost] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const check = async () => {
    if (!host.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${API}/ssl?host=${encodeURIComponent(host.replace(/^https?:\/\//, '').split('/')[0])}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'SSL check failed');
      setResult(json);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };



  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">SSL Certificate Checker</h1>
      <p className="text-gray-400 text-sm mb-2">Check SSL certificate details for any hostname. <span className="text-yellow-500 text-xs">Requires backend on :3001</span></p>

      <div className="flex items-center gap-3 mb-5">
        <input value={host} onChange={e => setHost(e.target.value)} onKeyDown={e => e.key==='Enter' && check()}
          placeholder="example.com or https://example.com"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        <button onClick={check} disabled={loading}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>

      {error && <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm mb-4">{error}</div>}
      {result && (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold ${result.valid ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' : 'bg-red-950/40 border-red-900 text-red-400'}`}>
            {result.valid ? '🛡️ Valid Certificate' : '⚠️ Invalid or Expired Certificate'}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            {Object.entries(result).map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4">
                <span className="text-xs text-gray-500 capitalize w-32 flex-shrink-0">{k.replace(/_/g, ' ')}</span>
                <span className="text-xs font-mono text-gray-300 text-right">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SslTool;
