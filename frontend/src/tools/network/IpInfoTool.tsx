import React, { useState } from 'react';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/network` : 'https://api.developertoolkit.online/api/network';

const IpInfoTool: React.FC = () => {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (addr?: string) => {
    const query = addr ?? ip.trim();
    setLoading(true); setError(''); setResult(null);
    try {
      const url = query ? `${API}/ip?ip=${encodeURIComponent(query)}` : `${API}/ip`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'IP lookup failed');
      setResult(json);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fields: { label: string; key: string }[] = [
    { label: 'IP Address', key: 'ip' },
    { label: 'City', key: 'city' },
    { label: 'Region', key: 'region' },
    { label: 'Country', key: 'country' },
    { label: 'Country Code', key: 'country_code' },
    { label: 'Latitude', key: 'latitude' },
    { label: 'Longitude', key: 'longitude' },
    { label: 'Timezone', key: 'timezone' },
    { label: 'ISP / Org', key: 'org' },
    { label: 'ASN', key: 'asn' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">IP Address Info</h1>
      <p className="text-gray-400 text-sm mb-2">Get geolocation and ISP info for any IP address or hostname. <span className="text-yellow-500 text-xs">Uses the hosted API backend or VITE_API_URL.</span></p>

      <div className="flex items-center gap-3 mb-3">
        <input value={ip} onChange={e => setIp(e.target.value)} onKeyDown={e => e.key==='Enter' && lookup()}
          placeholder="1.1.1.1 (leave empty for your IP)"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        <button onClick={() => lookup()} disabled={loading}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {loading ? 'Looking…' : 'Lookup'}
        </button>
      </div>
      <button onClick={() => { setIp(''); lookup(''); }} disabled={loading} className="text-xs text-indigo-400 hover:text-indigo-300 mb-5">Look up my IP →</button>

      {error && <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm mb-4">{error}</div>}
      {result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {fields.map(({ label, key }) =>
            result[key] !== undefined ? (
              <div key={key} className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-gray-500 w-32">{label}</span>
                <span className="text-sm font-mono text-gray-200">{String(result[key] ?? '')}</span>
              </div>
            ) : null
          )}
          {Boolean(result.map_url) && (
            <div className="px-4 py-3">
              <a href={String(result.map_url)} target="_blank" rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300">📍 View on map →</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IpInfoTool;
