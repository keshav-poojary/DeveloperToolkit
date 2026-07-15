import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [urlSafe, setUrlSafe] = useState(false);

  const process = () => {
    setError('');
    try {
      if (mode === 'encode') {
        let result = btoa(unescape(encodeURIComponent(input)));
        if (urlSafe) result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        setOutput(result);
      } else {
        let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        setOutput(decodeURIComponent(escape(atob(b64))));
      }
    } catch {
      setError('Invalid input for ' + mode);
      setOutput('');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Base64 Encode / Decode</h1>
      <p className="text-gray-400 text-sm mb-5">Encode text to Base64 or decode Base64 back to text.</p>

      <div className="flex items-center gap-4 mb-5">
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
          {(['encode','decode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-1.5 text-sm rounded-md font-medium capitalize transition-colors ${mode === m ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {m}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input type="checkbox" checked={urlSafe} onChange={e => setUrlSafe(e.target.checked)} className="accent-indigo-500" />
          URL-safe (Base64url)
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input" value={input} onChange={setInput}
          placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Enter Base64 to decode…'} rows={12} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={12}
          error={error} placeholder="Result will appear here…" />
      </div>

      <button onClick={process}
        className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
        {mode === 'encode' ? 'Encode →' : '← Decode'}
      </button>
    </div>
  );
};

export default Base64Tool;
