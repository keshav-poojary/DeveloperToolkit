import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const slugify = (text: string, separator: string, keepCase: boolean): string => {
  let s = text;
  // Normalize unicode
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!keepCase) s = s.toLowerCase();
  // Replace non-alphanumeric with separator
  s = s.replace(/[^a-zA-Z0-9\s-_]/g, '');
  s = s.replace(/[\s_-]+/g, separator);
  s = s.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
  return s;
};

const SlugifyTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [separator, setSeparator] = useState('-');
  const [keepCase, setKeepCase] = useState(false);
  const output = input ? slugify(input, separator, keepCase) : '';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Text to Slug</h1>
      <p className="text-gray-400 text-sm mb-5">Convert text to URL-friendly slug format.</p>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Separator:</label>
          <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
            {['-', '_', '.'].map(s => (
              <button key={s} onClick={() => setSeparator(s)}
                className={`px-3 py-1 text-sm rounded font-mono font-medium transition-colors ${separator === s ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={keepCase} onChange={e => setKeepCase(e.target.checked)} className="accent-indigo-500" /> Keep original case
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input Text" value={input} onChange={setInput} placeholder="Hello World! My Blog Post #1" rows={8} />
        <IOPanel label="Slug Output" value={output} readOnly showCopy rows={8} />
      </div>

      {output && (
        <div className="mt-4 p-3 bg-gray-900 border border-gray-800 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">URL example:</p>
          <p className="font-mono text-sm text-indigo-300">https://example.com/<span className="text-green-300">{output}</span></p>
        </div>
      )}
    </div>
  );
};

export default SlugifyTool;
