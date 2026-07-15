import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';
import * as yaml from 'js-yaml';

const YamlFormatterTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const format = () => {
    setError('');
    try {
      const parsed = yaml.load(input);
      setOutput(yaml.dump(parsed, { indent: 2, lineWidth: 120 }));
    } catch (e: any) { setError(e.message); setOutput(''); }
  };

  const validate = () => {
    setError('');
    try { yaml.load(input); setError('✅ Valid YAML!'); }
    catch (e: any) { setError(e.message); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">YAML Formatter</h1>
      <p className="text-gray-400 text-sm mb-5">Validate and pretty-print YAML documents.</p>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={format} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Format</button>
        <button onClick={validate} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">Validate</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input YAML" value={input} onChange={setInput} placeholder={'name: John\nage: 30\nhobbies:\n  - coding\n  - reading'} rows={18}
          error={error.startsWith('✅') ? undefined : error} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={18} />
      </div>
      {error.startsWith('✅') && <p className="mt-2 text-sm text-emerald-400">{error}</p>}
    </div>
  );
};

export default YamlFormatterTool;
