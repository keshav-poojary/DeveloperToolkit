import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const ALGOS = ['SHA-256', 'SHA-384', 'SHA-512'] as const;

const hmac = async (message: string, secret: string, algo: string): Promise<string> => {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: algo }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const HmacTool: React.FC = () => {
  const [message, setMessage] = useState('');
  const [secret, setSecret] = useState('');
  const [algo, setAlgo] = useState<typeof ALGOS[number]>('SHA-256');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const compute = async () => {
    setError('');
    try {
      const result = await hmac(message, secret, algo);
      setOutput(result);
    } catch (e: any) { setError(e.message); setOutput(''); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">HMAC Generator</h1>
      <p className="text-gray-400 text-sm mb-5">Generate HMAC signatures using SHA-256/384/512.</p>

      <div className="space-y-4 mb-5">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none placeholder-gray-700"
            placeholder="Message to sign…" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Secret Key</label>
          <input type="text" value={secret} onChange={e => setSecret(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-700"
            placeholder="Secret key…" />
        </div>
        <div className="flex items-center gap-3">
          <select value={algo} onChange={e => setAlgo(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none">
            {ALGOS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={compute} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Compute HMAC</button>
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      {output && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-400">HMAC-{algo}</span>
            <CopyButton text={output} />
          </div>
          <p className="font-mono text-xs text-gray-300 break-all">{output}</p>
        </div>
      )}
    </div>
  );
};

export default HmacTool;
