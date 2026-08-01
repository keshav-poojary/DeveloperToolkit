import React, { useState } from 'react';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/network` : 'https://api.developertoolkit.online/api/network';

const WhoisTool: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async () => {
    if (!domain.trim()) return;
    setLoading(true); setError(''); setResult('');
    try {
      const res = await fetch(`${API}/whois?domain=${encodeURIComponent(domain.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'WHOIS lookup failed');
      setResult(json.raw ?? JSON.stringify(json, null, 2));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">WHOIS Lookup</h1>
      <p className="text-gray-400 text-sm mb-2">Look up domain registration information. <span className="text-yellow-500 text-xs">Requires backend on :3001</span></p>

      <div className="flex items-center gap-3 mb-5">
        <input value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key==='Enter' && lookup()}
          placeholder="example.com"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        <button onClick={lookup} disabled={loading}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {loading ? 'Looking up…' : 'Lookup'}
        </button>
      </div>

      {error && <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm mb-4">{error}</div>}
      {result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-auto max-h-[500px]">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default WhoisTool;
