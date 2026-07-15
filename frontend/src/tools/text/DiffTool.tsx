import React, { useState } from 'react';
import { diffLines, diffWords, type Change } from 'diff';

const DiffTool: React.FC = () => {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [mode, setMode] = useState<'lines' | 'words'>('lines');
  const [diffResult, setDiffResult] = useState<Change[] | null>(null);

  const compare = () => {
    const changes = mode === 'lines' ? diffLines(left, right) : diffWords(left, right);
    setDiffResult(changes);
  };

  const stats = diffResult
    ? { added: diffResult.filter(c => c.added).reduce((a, c) => a + (c.count ?? 1), 0),
        removed: diffResult.filter(c => c.removed).reduce((a, c) => a + (c.count ?? 1), 0) }
    : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Diff Checker</h1>
      <p className="text-gray-400 text-sm mb-5">Compare two texts and highlight differences.</p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
          {(['lines','words'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 text-sm rounded-md font-medium capitalize transition-colors ${mode === m ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>{m}</button>
          ))}
        </div>
        <button onClick={compare} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Compare</button>
        {stats && (
          <div className="flex items-center gap-3 ml-auto text-sm">
            <span className="text-emerald-400">+{stats.added} added</span>
            <span className="text-red-400">-{stats.removed} removed</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Original</label>
          <textarea value={left} onChange={e => setLeft(e.target.value)} rows={14}
            placeholder="Original text…"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500 resize-y placeholder-gray-700" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Modified</label>
          <textarea value={right} onChange={e => setRight(e.target.value)} rows={14}
            placeholder="Modified text…"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y placeholder-gray-700" />
        </div>
      </div>

      {diffResult && (
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Diff Result</label>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {diffResult.map((change, i) => (
              <div key={i}
                className={`px-2 py-0.5 rounded mb-0.5 whitespace-pre-wrap ${change.added ? 'bg-emerald-950/50 text-emerald-300' : change.removed ? 'bg-red-950/50 text-red-300 line-through opacity-70' : 'text-gray-400'}`}>
                <span className="select-none mr-2 opacity-50">{change.added ? '+' : change.removed ? '-' : ' '}</span>
                {change.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffTool;
