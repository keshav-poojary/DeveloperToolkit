import React, { useState } from 'react';

const WordCountTool: React.FC = () => {
  const [text, setText] = useState('');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const lines = text ? text.split('\n').length : 0;
  const sentences = text ? (text.match(/[.!?]+/g) ?? []).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(Boolean).length : 0;
  const readTime = Math.ceil(words / 200);
  const uniqueWords = text.trim() ? new Set(text.toLowerCase().match(/\b\w+\b/g) ?? []).size : 0;
  const avgWordLen = words ? (text.match(/\b\w+\b/g) ?? []).reduce((a, w) => a + w.length, 0) / words : 0;

  // Word frequency
  const freq = text.trim()
    ? Object.entries(
        (text.toLowerCase().match(/\b\w+\b/g) ?? []).reduce<Record<string, number>>(
          (acc, w) => ({ ...acc, [w]: (acc[w] ?? 0) + 1 }), {}
        )
      ).sort((a, b) => b[1] - a[1]).slice(0, 10)
    : [];

  const stats = [
    { label: 'Words', value: words, color: 'text-indigo-400' },
    { label: 'Characters', value: chars, color: 'text-blue-400' },
    { label: 'Chars (no spaces)', value: charsNoSpace, color: 'text-cyan-400' },
    { label: 'Lines', value: lines, color: 'text-green-400' },
    { label: 'Sentences', value: sentences, color: 'text-yellow-400' },
    { label: 'Paragraphs', value: paragraphs, color: 'text-orange-400' },
    { label: 'Unique Words', value: uniqueWords, color: 'text-pink-400' },
    { label: 'Read Time (min)', value: readTime, color: 'text-purple-400' },
    { label: 'Avg Word Length', value: avgWordLen.toFixed(1), color: 'text-red-400' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Word Counter</h1>
      <p className="text-gray-400 text-sm mb-5">Count words, characters, lines, sentences, and more.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Text</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={18}
            placeholder="Paste or type your text here…"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none placeholder-gray-700" />
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {stats.map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {freq.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Top Words</p>
              {freq.map(([word, count]) => (
                <div key={word} className="flex items-center justify-between py-0.5">
                  <span className="text-xs font-mono text-gray-300">{word}</span>
                  <span className="text-xs text-indigo-400">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordCountTool;
