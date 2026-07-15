import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const transforms: { id: string; label: string; fn: (s: string) => string }[] = [
  { id: 'reverse',     label: 'Reverse Text',      fn: s => s.split('').reverse().join('') },
  { id: 'reverseWords',label: 'Reverse Words',      fn: s => s.split('\n').map(l => l.split(' ').reverse().join(' ')).join('\n') },
  { id: 'flipLines',   label: 'Flip Lines',         fn: s => s.split('\n').reverse().join('\n') },
  { id: 'shuffle',     label: 'Shuffle Characters', fn: s => s.split('').sort(() => Math.random()-0.5).join('') },
  { id: 'palindrome',  label: 'Make Palindrome',    fn: s => s + s.split('').reverse().join('') },
];

const TextReverseTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [transform, setTransform] = useState('reverse');

  const apply = () => {
    const t = transforms.find(t => t.id === transform);
    if (t) setOutput(t.fn(input));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Text Transformer</h1>
      <p className="text-gray-400 text-sm mb-5">Reverse, flip, and transform text in various ways.</p>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select value={transform} onChange={e => setTransform(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          {transforms.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <button onClick={apply} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Apply</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input" value={input} onChange={setInput} placeholder="Hello World" rows={12} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={12} />
      </div>
    </div>
  );
};

export default TextReverseTool;
