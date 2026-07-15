import React, { useState } from 'react';

const PERMS = ['read','write','execute'] as const;
const ENTITIES = ['owner','group','others'] as const;

const ChmodTool: React.FC = () => {
  const [bits, setBits] = useState<Record<string, boolean>>({
    owner_read: true, owner_write: true, owner_execute: false,
    group_read: true, group_write: false, group_execute: false,
    others_read: true, others_write: false, others_execute: false,
  });

  const toggle = (k: string) => setBits(prev => ({ ...prev, [k]: !prev[k] }));

  const toOctal = () =>
    ENTITIES.map(e =>
      (bits[`${e}_read`] ? 4 : 0) + (bits[`${e}_write`] ? 2 : 0) + (bits[`${e}_execute`] ? 1 : 0)
    ).join('');

  const toSymbolic = () =>
    ENTITIES.map(e =>
      (bits[`${e}_read`] ? 'r' : '-') + (bits[`${e}_write`] ? 'w' : '-') + (bits[`${e}_execute`] ? 'x' : '-')
    ).join('');

  const octal = toOctal();
  const sym = toSymbolic();

  const fromOctal = (s: string) => {
    if (!/^[0-7]{3}$/.test(s)) return;
    const newBits: Record<string, boolean> = {};
    ENTITIES.forEach((e, i) => {
      const v = parseInt(s[i]);
      newBits[`${e}_read`]    = (v & 4) !== 0;
      newBits[`${e}_write`]   = (v & 2) !== 0;
      newBits[`${e}_execute`] = (v & 1) !== 0;
    });
    setBits(newBits);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Chmod Calculator</h1>
      <p className="text-gray-400 text-sm mb-5">Calculate Unix file permission chmod values.</p>

      <table className="w-full mb-6">
        <thead>
          <tr>
            <th className="text-left text-xs text-gray-500 pb-2 w-24"></th>
            {PERMS.map(p => (
              <th key={p} className="text-center text-xs font-semibold text-gray-400 pb-2 capitalize">{p}</th>
            ))}
            <th className="text-center text-xs font-semibold text-gray-400 pb-2">Octal</th>
          </tr>
        </thead>
        <tbody>
          {ENTITIES.map((entity) => {
            const oct = (bits[`${entity}_read`] ? 4 : 0) + (bits[`${entity}_write`] ? 2 : 0) + (bits[`${entity}_execute`] ? 1 : 0);
            return (
              <tr key={entity} className="border-t border-gray-800">
                <td className="py-3 text-sm font-semibold text-gray-300 capitalize">{entity}</td>
                {PERMS.map(perm => (
                  <td key={perm} className="py-3 text-center">
                    <input type="checkbox" checked={bits[`${entity}_${perm}`]}
                      onChange={() => toggle(`${entity}_${perm}`)}
                      className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                  </td>
                ))}
                <td className="py-3 text-center font-mono text-indigo-300 font-bold">{oct}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Octal</p>
          <p className="text-3xl font-mono font-bold text-indigo-300">{octal}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Symbolic</p>
          <p className="text-2xl font-mono font-bold text-green-300">{sym}</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
        <p className="text-xs text-gray-400 mb-2">Command</p>
        <p className="font-mono text-sm text-yellow-300">chmod {octal} &lt;filename&gt;</p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-400">Set from octal:</label>
        <input maxLength={3} placeholder="644"
          onChange={e => fromOctal(e.target.value)}
          className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>
    </div>
  );
};

export default ChmodTool;
