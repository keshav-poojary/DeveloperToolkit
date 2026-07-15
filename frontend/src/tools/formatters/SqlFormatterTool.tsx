import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';
import { format } from 'sql-formatter';

const DIALECTS = ['sql','mysql','postgresql','sqlite','tsql','plsql','db2','hive','spark','n1ql','redshift','singlestoredb','trino','bigquery'];

const SqlFormatterTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [dialect, setDialect] = useState('sql');
  const [tabWidth, setTabWidth] = useState(2);
  const [upper, setUpper] = useState(true);

  const run = () => {
    setError('');
    try {
      const result = format(input, {
        language: dialect as any,
        tabWidth,
        keywordCase: upper ? 'upper' : 'lower',
      });
      setOutput(result);
    } catch (e: any) { setError(e.message); setOutput(''); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">SQL Formatter</h1>
      <p className="text-gray-400 text-sm mb-5">Prettify SQL queries with dialect-aware formatting.</p>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select value={dialect} onChange={e => setDialect(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          {DIALECTS.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
        </select>
        <select value={tabWidth} onChange={e => setTabWidth(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none">
          {[2,4].map(n => <option key={n} value={n}>{n} spaces</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input type="checkbox" checked={upper} onChange={e => setUpper(e.target.checked)} className="accent-indigo-500" />
          Uppercase keywords
        </label>
        <button onClick={run} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors ml-auto">Format</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input SQL" value={input} onChange={setInput}
          placeholder="select u.name,u.email from users u where u.active=1 order by u.name" rows={18} error={error} />
        <IOPanel label="Formatted SQL" value={output} readOnly showCopy rows={18} />
      </div>
    </div>
  );
};

export default SqlFormatterTool;
