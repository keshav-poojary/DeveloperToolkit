import React, { useState } from 'react';

interface Match { index: number; length: number; groups: Record<string,string> | null }

const RegexTool: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');


  let matches: Match[] = [];
  try {
    if (pattern && text) {
      const re = new RegExp(pattern, flags);
      if (flags.includes('g')) {
        let m;
        while ((m = re.exec(text)) !== null) {
          matches.push({ index: m.index, length: m[0].length, groups: m.groups ?? null });
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        const m = re.exec(text);
        if (m) matches.push({ index: m.index, length: m[0].length, groups: m.groups ?? null });
      }
    }
  } catch {}

  const highlightText = () => {
    if (!matches.length) return text;
    const parts: { text: string; match: boolean }[] = [];
    let last = 0;
    for (const m of matches) {
      if (m.index > last) parts.push({ text: text.slice(last, m.index), match: false });
      parts.push({ text: text.slice(m.index, m.index + m.length), match: true });
      last = m.index + m.length;
    }
    if (last < text.length) parts.push({ text: text.slice(last), match: false });
    return parts;
  };

  const highlighted = pattern && text ? highlightText() : null;
  const FLAG_OPTS = [
    { f: 'g', label: 'g', title: 'global' },
    { f: 'i', label: 'i', title: 'case-insensitive' },
    { f: 'm', label: 'm', title: 'multiline' },
    { f: 's', label: 's', title: 'dotAll' },
  ];

  const toggleFlag = (f: string) =>
    setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f);

  let regexError = '';
  try { if (pattern) new RegExp(pattern, flags); }
  catch (e: any) { regexError = e.message; }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Regex Tester</h1>
      <p className="text-gray-400 text-sm mb-5">Test regular expressions with live match highlighting.</p>

      {/* Pattern */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pattern</label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-lg font-mono">/</span>
          <input value={pattern} onChange={e => setPattern(e.target.value)}
            placeholder="(\w+)@(\w+)\.(\w+)"
            className={`flex-1 bg-gray-900 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${regexError ? 'border-red-700 text-red-300' : 'border-gray-700 text-green-300'}`} />
          <span className="text-gray-500 text-lg font-mono">/</span>
          <div className="flex items-center gap-1">
            {FLAG_OPTS.map(({ f, label, title }) => (
              <button key={f} onClick={() => toggleFlag(f)} title={title}
                className={`w-7 h-7 text-sm font-mono rounded transition-colors ${flags.includes(f) ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {regexError && <p className="mt-1 text-xs text-red-400">{regexError}</p>}
      </div>

      {/* Text */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Test String
          {matches.length > 0 && <span className="ml-2 text-indigo-400 font-normal normal-case">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>}
        </label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
          placeholder="Enter text to test against…"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y placeholder-gray-700" />
      </div>

      {/* Highlighted */}
      {highlighted && typeof highlighted !== 'string' && (
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Highlighted Matches</label>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 font-mono text-sm whitespace-pre-wrap">
            {highlighted.map((part, i) =>
              part.match
                ? <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5">{part.text}</mark>
                : <span key={i} className="text-gray-300">{part.text}</span>
            )}
          </div>
        </div>
      )}

      {/* Match details */}
      {matches.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Match Details</label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {matches.map((m, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5">
                <span className="text-xs text-gray-600 w-6 text-right">{i+1}</span>
                <span className="font-mono text-xs text-yellow-300">{text.slice(m.index, m.index + m.length)}</span>
                <span className="text-xs text-gray-600">at index {m.index}</span>
                {m.groups && <span className="text-xs text-indigo-400">{JSON.stringify(m.groups)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegexTool;
