import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const jsonToCsv = (json: string): string => {
  const data = JSON.parse(json);
  if (!Array.isArray(data) || data.length === 0) throw new Error('Input must be a non-empty JSON array');
  const headers = Object.keys(data[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...data.map((row: Record<string, unknown>) => headers.map(h => escape(row[h])).join(','))].join('\n');
};

const csvToJson = (csv: string): string => {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const parseRow = (line: string) => {
    const values: string[] = [];
    let cur = '', inQ = false;
    for (const c of line) {
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { values.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    values.push(cur.trim());
    return values;
  };
  const rows = lines.slice(1).map(line => {
    const vals = parseRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
  });
  return JSON.stringify(rows, null, 2);
};

const JsonCsvTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'jsonToCsv'|'csvToJson'>('jsonToCsv');

  const convert = () => {
    setError('');
    try {
      setOutput(mode === 'jsonToCsv' ? jsonToCsv(input) : csvToJson(input));
    } catch (e: any) { setError(e.message); setOutput(''); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">JSON ↔ CSV</h1>
      <p className="text-gray-400 text-sm mb-5">Convert JSON arrays to/from CSV format.</p>
      <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1 w-fit mb-4">
        <button onClick={() => setMode('jsonToCsv')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'jsonToCsv' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>JSON → CSV</button>
        <button onClick={() => setMode('csvToJson')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'csvToJson' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>CSV → JSON</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label={mode === 'jsonToCsv' ? 'Input JSON Array' : 'Input CSV'} value={input} onChange={setInput}
          placeholder={mode === 'jsonToCsv' ? '[{"name":"Alice","age":28},{"name":"Bob","age":32}]' : 'name,age\nAlice,28\nBob,32'} rows={18} error={error} />
        <IOPanel label={mode === 'jsonToCsv' ? 'Output CSV' : 'Output JSON'} value={output} readOnly showCopy rows={18} />
      </div>
      <button onClick={convert} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Convert</button>
    </div>
  );
};

export default JsonCsvTool;
