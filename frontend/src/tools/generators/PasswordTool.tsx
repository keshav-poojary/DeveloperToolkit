import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';
const AMBIGUOUS = /[0Ol1I]/g;

const PasswordTool: React.FC = () => {
  const [length, setLength] = useState(20);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbig, setExcludeAmbig] = useState(false);
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [show, setShow] = useState(true);

  const generate = () => {
    let charset = '';
    if (upper) charset += UPPER;
    if (lower) charset += LOWER;
    if (digits) charset += DIGITS;
    if (symbols) charset += SYMBOLS;
    if (excludeAmbig) charset = charset.replace(AMBIGUOUS, '');
    if (!charset) return;

    const results: string[] = [];
    const arr = new Uint32Array(length);
    for (let j = 0; j < count; j++) {
      crypto.getRandomValues(arr);
      results.push(Array.from(arr).map(n => charset[n % charset.length]).join(''));
    }
    setPasswords(results);
  };

  const strength = () => {
    const bits = Math.log2(
      (upper ? 26 : 0) + (lower ? 26 : 0) + (digits ? 10 : 0) + (symbols ? SYMBOLS.length : 0)
    ) * length;
    if (bits >= 128) return { label: 'Very Strong', color: 'text-emerald-400', w: '100%' };
    if (bits >= 80) return { label: 'Strong', color: 'text-green-400', w: '75%' };
    if (bits >= 60) return { label: 'Fair', color: 'text-yellow-400', w: '50%' };
    return { label: 'Weak', color: 'text-red-400', w: '25%' };
  };

  const s = strength();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Password Generator</h1>
      <p className="text-gray-400 text-sm mb-5">Generate cryptographically secure random passwords.</p>

      {/* Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs text-gray-400">Length: <span className="text-white font-semibold">{length}</span></label>
          </div>
          <input type="range" min={8} max={128} value={length} onChange={e => setLength(Number(e.target.value))}
            className="w-full accent-indigo-500" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Uppercase (A-Z)', state: upper, set: setUpper },
            { label: 'Lowercase (a-z)', state: lower, set: setLower },
            { label: 'Numbers (0-9)', state: digits, set: setDigits },
            { label: 'Symbols (!@#…)', state: symbols, set: setSymbols },
          ].map(opt => (
            <label key={opt.label} className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" checked={opt.state} onChange={e => opt.set(e.target.checked)} className="accent-indigo-500" />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={excludeAmbig} onChange={e => setExcludeAmbig(e.target.checked)} className="accent-indigo-500" />
            Exclude ambiguous (0, O, l, 1, I)
          </label>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Count:</label>
            <input type="number" min={1} max={20} value={count} onChange={e => setCount(Number(e.target.value))}
              className="w-14 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 text-center focus:outline-none" />
          </div>
        </div>

        {/* Strength meter */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">Entropy strength:</span>
            <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: s.w }} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button onClick={generate} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <RefreshCw size={14} /> Generate
        </button>
        {passwords.length > 0 && (
          <>
            <button onClick={() => setShow(s => !s)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded-lg border border-gray-700 transition-colors">
              {show ? <EyeOff size={12} /> : <Eye size={12} />} {show ? 'Hide' : 'Show'}
            </button>
            <CopyButton text={passwords.join('\n')} />
          </>
        )}
      </div>

      {passwords.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          {passwords.map((p, i) => (
            <div key={i} className="flex items-center justify-between group hover:bg-gray-800 rounded px-2 py-1">
              <span className="font-mono text-sm text-green-300 tracking-widest">{show ? p : '•'.repeat(p.length)}</span>
              <CopyButton text={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordTool;
