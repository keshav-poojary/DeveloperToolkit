import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const API = 'http://localhost:3001/api/network';

const HeadersTool: React.FC = () => {
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetch_ = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setHeaders(null);
    try {
      const res = await fetch(`${API}/headers?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Failed to fetch headers');
      setHeaders(json.headers);
      setStatus(`${json.status} ${json.statusText}`);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">HTTP Headers</h1>
      <p className="text-gray-400 text-sm mb-2">Fetch and inspect HTTP response headers for any URL. <span className="text-yellow-500 text-xs">Requires backend on :3001</span></p>

      <div className="flex items-center gap-3 mb-5">
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key==='Enter' && fetch_()}
          placeholder="https://example.com"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        <button onClick={fetch_} disabled={loading}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {loading ? 'Fetching…' : 'Fetch'}
        </button>
      </div>

      {error && <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm mb-4">{error}</div>}
      {headers && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${status.startsWith('2') ? 'text-emerald-400' : status.startsWith('3') ? 'text-blue-400' : 'text-red-400'}`}>
              HTTP {status}
            </span>
            <span className="text-xs text-gray-500">{Object.keys(headers).length} headers</span>
          </div>
          <div className="space-y-1.5">
            {Object.entries(headers).map(([k, v]) => (
              <div key={k} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                <span className="text-xs font-mono text-indigo-400 w-48 flex-shrink-0 break-all">{k}</span>
                <span className="text-xs font-mono text-gray-300 flex-1 break-all">{v}</span>
                <CopyButton text={v} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadersTool;
