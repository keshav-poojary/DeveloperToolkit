import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const BinaryTextTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'toBinary' | 'toText'>('toBinary');

  const process = () => {
    setError('');
    try {
      if (mode === 'toBinary') {
        setOutput(input.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '));
      } else {
        const cleaned = input.trim().replace(/\s+/g, ' ');
        const bytes = cleaned.split(' ');
        for (const b of bytes) {
          if (!/^[01]{8}$/.test(b)) throw new Error(`Invalid byte: "${b}" — each byte must be 8 bits`);
        }
        setOutput(bytes.map(b => String.fromCharCode(parseInt(b, 2))).join(''));
      }
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Binary ↔ Text</h1>
      <p className="text-gray-400 text-sm mb-5">Convert text to binary (8-bit ASCII) or binary back to text.</p>

      <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1 w-fit mb-5">
        <button onClick={() => setMode('toBinary')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'toBinary' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>Text → Binary</button>
        <button onClick={() => setMode('toText')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'toText' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>Binary → Text</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input" value={input} onChange={setInput}
          placeholder={mode === 'toBinary' ? 'Hello World' : '01001000 01100101 01101100 01101100 01101111'} rows={12} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={12} error={error} />
      </div>
      <button onClick={process} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Convert</button>
    </div>
  );
};

export default BinaryTextTool;
