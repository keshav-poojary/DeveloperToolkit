import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const JsonFormatterTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);

  const format = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
    } catch (e: any) { setError(e.message); setOutput(''); }
  };

  const minify = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e: any) { setError(e.message); setOutput(''); }
  };

  const validate = () => {
    setError('');
    try {
      JSON.parse(input);
      setError('✅ Valid JSON!');
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">JSON Formatter & Validator</h1>
      <p className="text-gray-400 text-sm mb-5">Format, validate and minify JSON data.</p>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={format} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Format</button>
        <button onClick={minify} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">Minify</button>
        <button onClick={validate} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">Validate</button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-gray-400">Indent:</label>
          <select value={indent} onChange={e => setIndent(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-200 focus:outline-none">
            {[2,4,8].map(n => <option key={n} value={n}>{n} spaces</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input JSON" value={input} onChange={setInput} placeholder='{"name":"John","age":30}' rows={18}
          error={error.startsWith('✅') ? undefined : error} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={18} />
      </div>
      {error.startsWith('✅') && <p className="mt-2 text-sm text-emerald-400">{error}</p>}
    </div>
  );
};

export default JsonFormatterTool;
