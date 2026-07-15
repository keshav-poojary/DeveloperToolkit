import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const b64url = (s: string) => {
  let p = s.replace(/-/g, '+').replace(/_/g, '/');
  while (p.length % 4) p += '=';
  try { return JSON.parse(decodeURIComponent(escape(atob(p)))); } catch { return null; }
};

const JwtInspectorTool: React.FC = () => {
  const [token, setToken] = useState('');

  const parts = token.trim().split('.');
  const valid = parts.length === 3;
  const header = valid ? b64url(parts[0]) : null;
  const payload = valid ? b64url(parts[1]) : null;

  const now = Date.now() / 1000;
  const exp = payload?.exp as number | undefined;
  const iat = payload?.iat as number | undefined;
  const nbf = payload?.nbf as number | undefined;
  const isExpired = exp !== undefined && now > exp;
  const isNotYetValid = nbf !== undefined && now < nbf;

  const fmt = (ts: number) => new Date(ts * 1000).toLocaleString();

  const claims = payload
    ? Object.entries(payload).map(([k, v]) => {
        const isTime = ['iat','exp','nbf'].includes(k) && typeof v === 'number';
        return { k, v, human: isTime ? fmt(v as number) : null };
      })
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">JWT Inspector</h1>
      <p className="text-gray-400 text-sm mb-5">Deep inspect JWT structure, expiry status and all claims.</p>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">JWT Token</label>
        <textarea value={token} onChange={e => setToken(e.target.value)} rows={4}
          placeholder="Paste JWT token here…"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none placeholder-gray-700" />
      </div>

      {token && !valid && (
        <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm mb-4">
          Invalid JWT — must have exactly 3 base64url-encoded parts separated by "."
        </div>
      )}

      {valid && header && payload && (
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isExpired ? 'bg-red-900/40 text-red-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
              {isExpired ? '⛔ Expired' : '✅ Not Expired'}
            </span>
            {isNotYetValid && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-900/40 text-yellow-400">⚠️ Not Yet Valid</span>}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/40 text-blue-400">Alg: {header.alg}</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-900/40 text-purple-400">Type: {header.typ}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-yellow-400">Header</h3>
                <CopyButton text={JSON.stringify(header, null, 2)} />
              </div>
              <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">{JSON.stringify(header, null, 2)}</pre>
            </div>

            {/* Timing */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-cyan-400 mb-3">Timing</h3>
              <div className="space-y-2">
                {iat && <Row label="Issued At" value={fmt(iat)} color="text-gray-300" />}
                {nbf && <Row label="Not Before" value={fmt(nbf)} color={isNotYetValid ? 'text-yellow-400' : 'text-gray-300'} />}
                {exp && <Row label="Expires At" value={fmt(exp)} color={isExpired ? 'text-red-400' : 'text-emerald-400'} />}
                {exp && <Row label="Lifetime" value={exp && iat ? `${Math.round((exp-iat)/60)} minutes` : 'N/A'} color="text-gray-400" />}
              </div>
            </div>
          </div>

          {/* Claims table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-pink-400">All Claims ({claims.length})</h3>
              <CopyButton text={JSON.stringify(payload, null, 2)} />
            </div>
            <div className="space-y-1.5">
              {claims.map(({ k, v, human }) => (
                <div key={k} className="flex items-start gap-3 px-3 py-2 bg-gray-950/50 rounded-lg">
                  <span className="text-xs font-mono text-indigo-400 w-20 flex-shrink-0">{k}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-gray-300">{JSON.stringify(v)}</span>
                    {human && <span className="ml-2 text-xs text-gray-500">→ {human}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-500">{label}</span>
    <span className={`text-xs font-mono ${color}`}>{value}</span>
  </div>
);

export default JwtInspectorTool;
