import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const AsciiTableTool: React.FC = () => {
  const [search, setSearch] = useState('');
  const [range, setRange] = useState<'printable'|'all'>('printable');

  const start = range === 'printable' ? 32 : 0;
  const end   = range === 'printable' ? 127 : 128;

  const chars = Array.from({ length: end - start }, (_, i) => {
    const code = i + start;
    const ch = String.fromCharCode(code);
    const printable = code >= 32 && code < 127;
    const names: Record<number, string> = {
      0:'NUL',1:'SOH',2:'STX',3:'ETX',4:'EOT',5:'ENQ',6:'ACK',7:'BEL',8:'BS',9:'HT',
      10:'LF',11:'VT',12:'FF',13:'CR',14:'SO',15:'SI',16:'DLE',17:'DC1',18:'DC2',19:'DC3',
      20:'DC4',21:'NAK',22:'SYN',23:'ETB',24:'CAN',25:'EM',26:'SUB',27:'ESC',28:'FS',
      29:'GS',30:'RS',31:'US',127:'DEL',
    };
    return { code, hex: code.toString(16).toUpperCase().padStart(2,'0'),
      bin: code.toString(2).padStart(8,'0'), ch: printable ? ch : names[code] ?? '?', printable };
  });

  const filtered = search
    ? chars.filter(c => c.code.toString().includes(search) || c.ch.toLowerCase().includes(search.toLowerCase()) || c.hex.toLowerCase().includes(search.toLowerCase()))
    : chars;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">ASCII Table</h1>
      <p className="text-gray-400 text-sm mb-5">Full ASCII character reference with decimal, hex, and binary values.</p>

      <div className="flex items-center gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search char, code, hex…"
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-52" />
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
          <button onClick={() => setRange('printable')} className={`px-3 py-1 text-xs rounded font-medium transition-colors ${range==='printable'?'bg-indigo-600 text-white':'text-gray-400 hover:text-gray-200'}`}>Printable (32–126)</button>
          <button onClick={() => setRange('all')} className={`px-3 py-1 text-xs rounded font-medium transition-colors ${range==='all'?'bg-indigo-600 text-white':'text-gray-400 hover:text-gray-200'}`}>All (0–127)</button>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-gray-800">
        <table className="w-full text-xs">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-3 py-2 text-left">Dec</th>
              <th className="px-3 py-2 text-left">Hex</th>
              <th className="px-3 py-2 text-left">Binary</th>
              <th className="px-3 py-2 text-left">Char</th>
              <th className="px-3 py-2 text-left">HTML</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {filtered.map(c => (
              <tr key={c.code} className="border-t border-gray-800 hover:bg-gray-900 transition-colors group">
                <td className="px-3 py-1.5 text-gray-300">{c.code}</td>
                <td className="px-3 py-1.5 text-indigo-400">{c.hex}</td>
                <td className="px-3 py-1.5 text-gray-500">{c.bin}</td>
                <td className="px-3 py-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-sm ${c.printable ? 'text-green-300 bg-green-950/30' : 'text-gray-500 bg-gray-900'}`}>{c.ch}</span>
                </td>
                <td className="px-3 py-1.5 text-gray-500">
                  <span className="group-hover:opacity-100 opacity-0 transition-opacity">
                    <CopyButton text={`&#${c.code};`} />
                  </span>
                  &#x26;#{c.code};
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AsciiTableTool;
