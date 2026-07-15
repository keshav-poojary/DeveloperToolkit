import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const CODE: Record<string, string> = {
  A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',
  K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',
  U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....',
  '6':'-....','7':'--...','8':'---..','9':'----.','.':'.-.-.-',',':'--..--',
  '?':'..--..','!':'-.-.--','@':'.--.-.','&':'.-...',':':'---...','/':'-..-.',
};
const RCODE = Object.fromEntries(Object.entries(CODE).map(([k, v]) => [v, k]));

const MorseTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const process = () => {
    setError('');
    if (mode === 'encode') {
      const result = input.toUpperCase().split('').map(c => {
        if (c === ' ') return '/';
        return CODE[c] ?? `[${c}]`;
      }).join(' ');
      setOutput(result);
    } else {
      try {
        const words = input.trim().split(' / ');
        const result = words.map(word =>
          word.split(' ').map(code => {
            const ch = RCODE[code];
            if (!ch) throw new Error(`Unknown code: "${code}"`);
            return ch;
          }).join('')
        ).join(' ');
        setOutput(result);
      } catch (e: any) { setError(e.message); setOutput(''); }
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Morse Code</h1>
      <p className="text-gray-400 text-sm mb-5">Encode text to Morse code or decode Morse code to text. Use <code className="text-indigo-400">/</code> to separate words.</p>

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
          placeholder={mode === 'encode' ? 'Hello World' : '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'} rows={10} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={10} error={error} />
      </div>
      <button onClick={process} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Convert</button>
    </div>
  );
};

export default MorseTool;
