import React, { useState } from 'react';

const RECORD_TYPES = ['A','AAAA','CNAME','MX','NS','TXT','SOA','SRV','PTR'];
const API = 'http://localhost:3001/api/network';

const DnsTool: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [type, setType] = useState('A');
  const [results, setResults] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async () => {
    if (!domain.trim()) return;
    setLoading(true); setError(''); setResults(null);
    try {
      const res = await fetch(`${API}/dns?domain=${encodeURIComponent(domain.trim())}&type=${type}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'DNS lookup failed');
      setResults(json.records ?? json);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">DNS Lookup</h1>
      <p className="text-gray-400 text-sm mb-2">Query DNS records for any domain. <span className="text-yellow-500 text-xs">Requires backend running on :3001</span></p>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <input value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key==='Enter' && lookup()}
          placeholder="example.com"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-0" />
        <select value={type} onChange={e => setType(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none">
          {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={lookup} disabled={loading}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {loading ? 'Looking up…' : 'Lookup'}
        </button>
      </div>

      {error && <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm mb-4">{error}</div>}
      {results && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2">{results.length} record{results.length !== 1 ? 's' : ''} for <span className="text-indigo-300">{domain}</span> ({type})</p>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-gray-300">
                {typeof r === 'object' ? JSON.stringify(r) : String(r)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DnsTool;
