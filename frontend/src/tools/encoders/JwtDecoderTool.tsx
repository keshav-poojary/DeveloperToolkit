import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

interface JwtParts { header: Record<string, unknown>; payload: Record<string, unknown>; signature: string }

const b64url = (s: string) => {
  let p = s.replace(/-/g, '+').replace(/_/g, '/');
  while (p.length % 4) p += '=';
  try { return JSON.parse(decodeURIComponent(escape(atob(p)))); }
  catch { return null; }
};

const decode = (token: string): JwtParts | null => {
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;
  const header = b64url(parts[0]);
  const payload = b64url(parts[1]);
  if (!header || !payload) return null;
  return { header, payload, signature: parts[2] };
};

const isExpired = (exp?: number) => exp ? Date.now() / 1000 > exp : false;

const JwtDecoderTool: React.FC = () => {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<JwtParts | null>(null);
  const [error, setError] = useState('');

  const process = () => {
    setError('');
    const result = decode(token);
    if (!result) { setError('Invalid JWT — must have 3 base64url parts separated by "."'); setDecoded(null); return; }
    setDecoded(result);
  };

  const exp = decoded?.payload?.exp as number | undefined;
  const iat = decoded?.payload?.iat as number | undefined;
  const fmt = (ts: number) => new Date(ts * 1000).toLocaleString();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">JWT Decoder</h1>
      <p className="text-gray-400 text-sm mb-5">Decode and inspect JSON Web Token header, payload and signature. No secret key needed for decoding.</p>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">JWT Token</label>
        <textarea value={token} onChange={e => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
          rows={4}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-700 resize-none" />
      </div>

      <button onClick={process} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors mb-5">Decode</button>

      {error && <div className="mb-4 p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm">{error}</div>}

      {decoded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Header */}
          <Section title="Header" color="text-yellow-400" data={decoded.header} />

          {/* Payload */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-pink-400">Payload</h3>
              <div className="flex items-center gap-2">
                {exp && (
                  <span className={`text-xs px-2 py-0.5 rounded border ${isExpired(exp) ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-emerald-900/30 text-emerald-400 border-emerald-800'}`}>
                    {isExpired(exp) ? 'Expired' : 'Valid'}
                  </span>
                )}
                <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
              </div>
            </div>
            <pre className="text-xs text-gray-300 font-mono overflow-auto max-h-64 whitespace-pre-wrap">{JSON.stringify(decoded.payload, null, 2)}</pre>
            {(exp || iat) && (
              <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-1 gap-1">
                {iat && <p className="text-xs text-gray-500">Issued: <span className="text-gray-300">{fmt(iat)}</span></p>}
                {exp && <p className="text-xs text-gray-500">Expires: <span className={isExpired(exp) ? 'text-red-400' : 'text-gray-300'}>{fmt(exp)}</span></p>}
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-emerald-400 mb-2">Signature</h3>
            <p className="text-xs font-mono text-gray-400 break-all">{decoded.signature}</p>
            <p className="text-xs text-gray-600 mt-2">Signature verification requires the secret key and cannot be done client-side securely.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Section: React.FC<{ title: string; color: string; data: Record<string, unknown> }> = ({ title, color, data }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
      <CopyButton text={JSON.stringify(data, null, 2)} />
    </div>
    <pre className="text-xs text-gray-300 font-mono overflow-auto max-h-48 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
  </div>
);

export default JwtDecoderTool;
