import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const DedupTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [trim, setTrim] = useState(true);
  const [keepBlanks, setKeepBlanks] = useState(false);
  const [removed, setRemoved] = useState(0);

  const dedup = () => {
    let lines = input.split('\n');
    if (trim) lines = lines.map(l => l.trim());
    if (!keepBlanks) lines = lines.filter(l => l.trim());
    const seen = new Set<string>();
    let count = 0;
    const result = lines.filter(l => {
      const key = caseInsensitive ? l.toLowerCase() : l;
      if (seen.has(key)) { count++; return false; }
      seen.add(key); return true;
    });
    setOutput(result.join('\n'));
    setRemoved(count);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Duplicate Line Remover</h1>
      <p className="text-gray-400 text-sm mb-5">Remove duplicate lines from text, keeping only unique lines.</p>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={caseInsensitive} onChange={e => setCaseInsensitive(e.target.checked)} className="accent-indigo-500" /> Case-insensitive
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={trim} onChange={e => setTrim(e.target.checked)} className="accent-indigo-500" /> Trim whitespace
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={keepBlanks} onChange={e => setKeepBlanks(e.target.checked)} className="accent-indigo-500" /> Keep blank lines
        </label>
        <button onClick={dedup} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Remove Duplicates</button>
        {removed > 0 && <span className="text-sm text-red-400">{removed} duplicate{removed !== 1 ? 's' : ''} removed</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input" value={input} onChange={setInput} placeholder={'apple\nbanana\napple\ncherry\nbanana\norange'} rows={16} />
        <IOPanel label="Unique Lines" value={output} readOnly showCopy rows={16} />
      </div>
    </div>
  );
};

export default DedupTool;
