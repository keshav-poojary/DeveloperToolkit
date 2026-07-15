import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const JwtEncoderTool: React.FC = () => {
  const [header, setHeader] = useState(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
  const [payload, setPayload] = useState(JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 }, null, 2));
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const sign = async () => {
    setError('');
    try {
      const h = JSON.parse(header);
      const p = JSON.parse(payload);
      const alg = h.alg ?? 'HS256';
      const map: Record<string, string> = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' };
      const hashAlgo = map[alg];
      if (!hashAlgo) throw new Error(`Unsupported algorithm: ${alg}. Supported: HS256, HS384, HS512`);

      const enc = new TextEncoder();
      const hStr = btoa(unescape(encodeURIComponent(JSON.stringify(h)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const pStr = btoa(unescape(encodeURIComponent(JSON.stringify(p)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const data = `${hStr}.${pStr}`;

      const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: hashAlgo }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
      const sigStr = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      setToken(`${data}.${sigStr}`);
    } catch (e: any) { setError(e.message); setToken(''); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">JWT Encoder</h1>
      <p className="text-gray-400 text-sm mb-5">Create signed JWT tokens with HMAC-SHA algorithms.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Header</label>
          <textarea value={header} onChange={e => setHeader(e.target.value)} rows={5}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-yellow-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payload</label>
          <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={5}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-pink-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Secret Key</label>
        <input type="text" value={secret} onChange={e => setSecret(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      <button onClick={sign} className="mb-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Sign Token</button>
      {error && <p className="mb-3 text-sm text-red-400 font-mono">{error}</p>}

      {token && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-400">Signed JWT</span>
            <CopyButton text={token} />
          </div>
          <p className="font-mono text-xs break-all">
            {token.split('.').map((part, i) => (
              <span key={i} className={['text-yellow-400','text-pink-400','text-emerald-400'][i]}>
                {part}{i < 2 ? <span className="text-gray-600">.</span> : ''}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
};

export default JwtEncoderTool;
