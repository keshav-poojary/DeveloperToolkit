import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const TextSortTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [order, setOrder] = useState<'asc'|'desc'>('asc');
  const [numeric, setNumeric] = useState(false);
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(true);

  const sort = () => {
    let lines = input.split('\n');
    if (trimLines) lines = lines.map(l => l.trim());
    lines.sort((a, b) => {
      if (numeric) {
        const na = parseFloat(a), nb = parseFloat(b);
        if (!isNaN(na) && !isNaN(nb)) return order === 'asc' ? na - nb : nb - na;
      }
      const aa = caseInsensitive ? a.toLowerCase() : a;
      const bb = caseInsensitive ? b.toLowerCase() : b;
      const cmp = aa.localeCompare(bb);
      return order === 'asc' ? cmp : -cmp;
    });
    setOutput(lines.join('\n'));
  };

  const shuffle = () => {
    const lines = input.split('\n').sort(() => Math.random() - 0.5);
    setOutput(lines.join('\n'));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Text Sorter</h1>
      <p className="text-gray-400 text-sm mb-5">Sort lines alphabetically, numerically or randomly.</p>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
          <button onClick={() => setOrder('asc')} className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${order === 'asc' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>A→Z</button>
          <button onClick={() => setOrder('desc')} className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${order === 'desc' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>Z→A</button>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={numeric} onChange={e => setNumeric(e.target.checked)} className="accent-indigo-500" /> Numeric
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={caseInsensitive} onChange={e => setCaseInsensitive(e.target.checked)} className="accent-indigo-500" /> Case-insensitive
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={trimLines} onChange={e => setTrimLines(e.target.checked)} className="accent-indigo-500" /> Trim lines
        </label>
        <button onClick={sort} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Sort</button>
        <button onClick={shuffle} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">Shuffle</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input Lines" value={input} onChange={setInput} placeholder="banana\napple\ncherry\ndate" rows={16} />
        <IOPanel label="Sorted Output" value={output} readOnly showCopy rows={16} />
      </div>
    </div>
  );
};

export default TextSortTool;
