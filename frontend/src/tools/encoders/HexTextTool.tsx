import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const HexTextTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'toHex' | 'toText'>('toHex');

  const process = () => {
    setError('');
    try {
      if (mode === 'toHex') {
        setOutput(Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '));
      } else {
        const cleaned = input.replace(/\s+/g, '');
        if (!/^[0-9a-fA-F]+$/.test(cleaned)) throw new Error('Input must be valid hexadecimal characters');
        if (cleaned.length % 2 !== 0) throw new Error('Hex string must have even length');
        const result = cleaned.match(/.{2}/g)!.map(h => String.fromCharCode(parseInt(h, 16))).join('');
        setOutput(result);
      }
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Hex ↔ Text</h1>
      <p className="text-gray-400 text-sm mb-5">Convert text to hexadecimal encoding or decode hex back to text.</p>

      <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1 w-fit mb-5">
        <button onClick={() => setMode('toHex')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'toHex' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>Text → Hex</button>
        <button onClick={() => setMode('toText')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'toText' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>Hex → Text</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input" value={input} onChange={setInput}
          placeholder={mode === 'toHex' ? 'Hello World' : '48 65 6c 6c 6f 20 57 6f 72 6c 64'} rows={12} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={12} error={error} />
      </div>
      <button onClick={process} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Convert</button>
    </div>
  );
};

export default HexTextTool;
