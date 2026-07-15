import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const cases: { id: string; label: string; fn: (s: string) => string }[] = [
  { id: 'lower',    label: 'lowercase',     fn: s => s.toLowerCase() },
  { id: 'upper',    label: 'UPPERCASE',     fn: s => s.toUpperCase() },
  { id: 'title',    label: 'Title Case',    fn: s => s.replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase()) },
  { id: 'camel',    label: 'camelCase',     fn: s => s.replace(/[-_\s]+(.)/g, (_,c) => c.toUpperCase()).replace(/^(.)/, c => c.toLowerCase()) },
  { id: 'pascal',   label: 'PascalCase',    fn: s => s.replace(/[-_\s]+(.)/g, (_,c) => c.toUpperCase()).replace(/^(.)/, c => c.toUpperCase()) },
  { id: 'snake',    label: 'snake_case',    fn: s => s.replace(/([A-Z])/g, '_$1').replace(/[-\s]+/g, '_').replace(/^_/,'').toLowerCase() },
  { id: 'kebab',    label: 'kebab-case',    fn: s => s.replace(/([A-Z])/g, '-$1').replace(/[_\s]+/g, '-').replace(/^-/,'').toLowerCase() },
  { id: 'screaming',label: 'SCREAMING_SNAKE',fn:s => s.replace(/([A-Z])/g,'_$1').replace(/[-\s]+/g,'_').replace(/^_/,'').toUpperCase() },
  { id: 'dot',      label: 'dot.case',      fn: s => s.replace(/([A-Z])/g, '.$1').replace(/[-_\s]+/g, '.').replace(/^\./,'').toLowerCase() },
];

const StringCaseTool: React.FC = () => {
  const [input, setInput] = useState('');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">String Case Converter</h1>
      <p className="text-gray-400 text-sm mb-5">Convert text between all naming conventions.</p>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Input Text</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={3}
          placeholder="hello world example text"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none placeholder-gray-700" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cases.map(({ id, label, fn }) => {
          const value = input ? fn(input) : '';
          return (
            <div key={id} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500 font-semibold">{label}</span>
                {value && <CopyButton text={value} />}
              </div>
              <p className="font-mono text-sm text-gray-200 truncate">{value || <span className="text-gray-700">…</span>}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StringCaseTool;
