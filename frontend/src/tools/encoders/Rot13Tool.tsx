import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const rot13 = (s: string) =>
  s.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });

const Rot13Tool: React.FC = () => {
  const [input, setInput] = useState('');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">ROT13 Cipher</h1>
      <p className="text-gray-400 text-sm mb-5">ROT13 is its own inverse — applying it twice restores the original text.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input" value={input} onChange={setInput} placeholder="Hello, World!" rows={12} />
        <IOPanel label="Output (ROT13 applied)" value={rot13(input)} readOnly showCopy rows={12} />
      </div>
      <p className="mt-3 text-xs text-gray-500">Output updates live as you type. Only A–Z and a–z are shifted; all other characters are unchanged.</p>
    </div>
  );
};

export default Rot13Tool;
