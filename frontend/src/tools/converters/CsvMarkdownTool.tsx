import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const csvToMarkdown = (csv: string): string => {
  const lines = csv.trim().split('\n');
  const cols = lines[0].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
  const sep = cols.map(() => '---');
  const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
  return [
    '| ' + cols.join(' | ') + ' |',
    '| ' + sep.join(' | ') + ' |',
    ...rows.map(r => '| ' + r.join(' | ') + ' |'),
  ].join('\n');
};

const markdownToCSV = (md: string): string => {
  const lines = md.trim().split('\n').filter(l => l.trim() && !l.match(/^\|[-|: ]+\|$/));
  return lines.map(line =>
    line.trim().replace(/^\||\|$/g, '').split('|').map(c => {
      const v = c.trim();
      return v.includes(',') ? `"${v}"` : v;
    }).join(',')
  ).join('\n');
};

const CsvMarkdownTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'csvToMd'|'mdToCsv'>('csvToMd');

  const convert = () => {
    setError('');
    try {
      setOutput(mode === 'csvToMd' ? csvToMarkdown(input) : markdownToCSV(input));
    } catch (e: any) { setError(e.message); setOutput(''); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">CSV ↔ Markdown Table</h1>
      <p className="text-gray-400 text-sm mb-5">Convert CSV data to/from Markdown tables.</p>
      <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1 w-fit mb-4">
        <button onClick={() => setMode('csvToMd')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'csvToMd' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>CSV → Markdown</button>
        <button onClick={() => setMode('mdToCsv')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'mdToCsv' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>Markdown → CSV</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label={mode === 'csvToMd' ? 'CSV Input' : 'Markdown Input'} value={input} onChange={setInput}
          placeholder={mode === 'csvToMd' ? 'name,age,city\nAlice,28,NYC\nBob,32,LA' : '| name | age |\n| --- | --- |\n| Alice | 28 |'} rows={14} error={error} />
        <IOPanel label={mode === 'csvToMd' ? 'Markdown Table' : 'CSV Output'} value={output} readOnly showCopy rows={14} />
      </div>
      <button onClick={convert} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Convert</button>
    </div>
  );
};

export default CsvMarkdownTool;
