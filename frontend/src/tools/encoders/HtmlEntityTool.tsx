import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const ENTITIES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  '©': '&copy;', '®': '&reg;', '™': '&trade;', '€': '&euro;', '£': '&pound;',
};
const DECODE_REGEX = /&(?:#(\d+)|#x([0-9a-fA-F]+)|([a-zA-Z]+));/g;
const NAMED: Record<string, string> = Object.fromEntries(Object.entries(ENTITIES).map(([k, v]) => [v, k]));

const HtmlEntityTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const process = () => {
    if (mode === 'encode') {
      setOutput(input.replace(/[&<>"'©®™€£]/g, c => ENTITIES[c] ?? c));
    } else {
      setOutput(input.replace(DECODE_REGEX, (_, dec, hex, named) => {
        if (dec) return String.fromCharCode(parseInt(dec, 10));
        if (hex) return String.fromCharCode(parseInt(hex, 16));
        const full = `&${named};`;
        return NAMED[full] ?? full;
      }));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">HTML Entity Encode / Decode</h1>
      <p className="text-gray-400 text-sm mb-5">Encode/decode special HTML characters (&amp;, &lt;, &gt;, etc.).</p>

      <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1 w-fit mb-5">
        {(['encode','decode'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 text-sm rounded-md font-medium capitalize transition-colors ${mode === m ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input" value={input} onChange={setInput}
          placeholder={mode === 'encode' ? '<h1>Hello "World" & more</h1>' : '&lt;h1&gt;Hello&lt;/h1&gt;'} rows={12} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={12} />
      </div>
      <button onClick={process} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
        {mode === 'encode' ? 'Encode →' : '← Decode'}
      </button>
    </div>
  );
};

export default HtmlEntityTool;
