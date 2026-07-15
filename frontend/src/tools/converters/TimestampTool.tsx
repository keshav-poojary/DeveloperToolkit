import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';
import { RefreshCw } from 'lucide-react';

const TimestampTool: React.FC = () => {
  const [ts, setTs] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState('');

  const fromTimestamp = () => {
    setError('');
    try {
      const num = parseInt(ts);
      if (isNaN(num)) throw new Error('Invalid timestamp');
      const msTs = ts.length <= 10 ? num * 1000 : num;
      const d = new Date(msTs);
      setResult({
        'ISO 8601':        d.toISOString(),
        'UTC':             d.toUTCString(),
        'Local':           d.toLocaleString(),
        'Date (local)':    d.toLocaleDateString(),
        'Time (local)':    d.toLocaleTimeString(),
        'Unix (seconds)':  Math.floor(msTs / 1000).toString(),
        'Unix (ms)':       msTs.toString(),
        'Relative':        getRelative(d),
      });
    } catch (e: any) { setError(e.message); setResult(null); }
  };

  const fromDate = () => {
    setError('');
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) throw new Error('Invalid date string');
      setResult({
        'ISO 8601':        d.toISOString(),
        'UTC':             d.toUTCString(),
        'Local':           d.toLocaleString(),
        'Unix (seconds)':  Math.floor(d.getTime() / 1000).toString(),
        'Unix (ms)':       d.getTime().toString(),
        'Relative':        getRelative(d),
      });
    } catch (e: any) { setError(e.message); setResult(null); }
  };

  const getRelative = (d: Date): string => {
    const diff = Date.now() - d.getTime();
    const s = Math.abs(diff) / 1000;
    const suffix = diff > 0 ? 'ago' : 'from now';
    if (s < 60) return `${Math.round(s)} seconds ${suffix}`;
    if (s < 3600) return `${Math.round(s/60)} minutes ${suffix}`;
    if (s < 86400) return `${Math.round(s/3600)} hours ${suffix}`;
    return `${Math.round(s/86400)} days ${suffix}`;
  };

  const now = () => {
    const n = Math.floor(Date.now() / 1000).toString();
    setTs(n); setResult(null); setError('');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Unix Timestamp Converter</h1>
      <p className="text-gray-400 text-sm mb-5">Convert Unix timestamps to/from human-readable dates.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Unix Timestamp</label>
          <div className="flex gap-2">
            <input value={ts} onChange={e => setTs(e.target.value)} placeholder="1700000000"
              className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <button onClick={now} title="Use now" className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <RefreshCw size={14} className="text-gray-300" />
            </button>
          </div>
          <button onClick={fromTimestamp} className="mt-2 w-full px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">Convert →</button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date / Time String</label>
          <input value={dateStr} onChange={e => setDateStr(e.target.value)} placeholder="2024-01-15T10:30:00Z"
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-2" />
          <button onClick={fromDate} className="w-full px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">Convert →</button>
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {result && (
        <div className="space-y-2">
          {Object.entries(result).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5">
              <span className="text-xs text-gray-500 w-32 flex-shrink-0">{label}</span>
              <span className="font-mono text-xs text-gray-200 flex-1 mx-3">{value}</span>
              <CopyButton text={value} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimestampTool;
