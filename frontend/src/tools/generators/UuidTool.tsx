import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';
import { RefreshCw } from 'lucide-react';

const v4 = () => crypto.randomUUID();
const nil = () => '00000000-0000-0000-0000-000000000000';
const v1Like = () => {
  const now = Date.now();
  const hex = now.toString(16).padStart(12, '0');
  const r = () => Math.floor(Math.random() * 16).toString(16);
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-1${r()}${r()}${r()}-${(Math.floor(Math.random()*4)+8).toString(16)}${r()}${r()}${r()}-${Array.from({length:12},r).join('')}`;
};

const UuidTool: React.FC = () => {
  const [version, setVersion] = useState<'v4'|'v1'|'nil'>('v4');
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = () => {
    const fn = version === 'v4' ? v4 : version === 'v1' ? v1Like : nil;
    setUuids(Array.from({ length: count }, fn));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">UUID Generator</h1>
      <p className="text-gray-400 text-sm mb-5">Generate universally unique identifiers.</p>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
          {(['v4','v1','nil'] as const).map(v => (
            <button key={v} onClick={() => setVersion(v)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${version === v ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {v.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Count:</label>
          <input type="number" min={1} max={100} value={count} onChange={e => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
            className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-200 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <button onClick={generate}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <RefreshCw size={14} /> Generate
        </button>
        {uuids.length > 0 && <CopyButton text={uuids.join('\n')} />}
      </div>

      {uuids.length > 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          {uuids.map((u, i) => (
            <div key={i} className="flex items-center justify-between group hover:bg-gray-800 rounded px-2 py-1">
              <span className="font-mono text-sm text-indigo-300">{u}</span>
              <CopyButton text={u} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-8 text-center text-gray-600 text-sm">
          Click "Generate" to create UUIDs
        </div>
      )}
    </div>
  );
};

export default UuidTool;
