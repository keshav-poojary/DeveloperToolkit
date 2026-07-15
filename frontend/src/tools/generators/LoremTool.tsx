import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';
import { RefreshCw } from 'lucide-react';

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio, et tempus feugiat. Nullam varius turpis vitae eros blandit fermentum. Donec commodo felis at enim. Maecenas condimentum eget leo sit amet condimentum. Fusce in quam non quam hendrerit commodo. Sed consequat libero vel magna porttitor, id tempus lectus aliquam.`.split('. ');

const randomPara = (sentences: number): string => {
  const pool = [...LOREM];
  const arr: string[] = [];
  for (let i = 0; i < sentences; i++) arr.push(pool[Math.floor(Math.random() * pool.length)]);
  return arr.join('. ') + '.';
};

const LoremTool: React.FC = () => {
  const [type, setType] = useState<'paragraphs'|'sentences'|'words'>('paragraphs');
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState('');

  const generate = () => {
    if (type === 'paragraphs') {
      setOutput(Array.from({ length: count }, () => randomPara(5)).join('\n\n'));
    } else if (type === 'sentences') {
      const all = LOREM.slice(0, count).join('. ') + '.';
      setOutput(all);
    } else {
      const words = LOREM.join(' ').split(' ');
      setOutput(words.slice(0, count).join(' '));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Lorem Ipsum Generator</h1>
      <p className="text-gray-400 text-sm mb-5">Generate placeholder lorem ipsum text.</p>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
          {(['paragraphs','sentences','words'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium capitalize transition-colors ${type === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Count:</label>
          <input type="number" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))}
            className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-200 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <button onClick={generate} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <RefreshCw size={14} /> Generate
        </button>
        {output && <CopyButton text={output} />}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 min-h-32">
        {output ? (
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{output}</p>
        ) : (
          <p className="text-sm text-gray-600 text-center py-8">Click "Generate" to create lorem ipsum text</p>
        )}
      </div>
    </div>
  );
};

export default LoremTool;
