import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const UrlEncodeTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [full, setFull] = useState(false);

  const process = () => {
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(full ? encodeURIComponent(input) : encodeURI(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">URL Encode / Decode</h1>
      <p className="text-gray-400 text-sm mb-5">Percent-encode/decode URLs and query strings.</p>

      <div className="flex items-center gap-4 mb-5">
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
          {(['encode','decode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-1.5 text-sm rounded-md font-medium capitalize transition-colors ${mode === m ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {m}
            </button>
          ))}
        </div>
        {mode === 'encode' && (
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={full} onChange={e => setFull(e.target.checked)} className="accent-indigo-500" />
            Encode all chars (encodeURIComponent)
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input" value={input} onChange={setInput}
          placeholder={mode === 'encode' ? 'https://example.com/path?q=hello world' : 'https%3A%2F%2Fexample.com'} rows={12} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={12} error={error} />
      </div>

      <button onClick={process}
        className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
        {mode === 'encode' ? 'Encode →' : '← Decode'}
      </button>
    </div>
  );
};

export default UrlEncodeTool;
