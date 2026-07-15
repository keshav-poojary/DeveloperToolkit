import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';
import * as yaml from 'js-yaml';

const JsonYamlTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'jsonToYaml'|'yamlToJson'>('jsonToYaml');

  const convert = () => {
    setError('');
    try {
      if (mode === 'jsonToYaml') {
        const parsed = JSON.parse(input);
        setOutput(yaml.dump(parsed, { indent: 2, lineWidth: 120 }));
      } else {
        const parsed = yaml.load(input);
        setOutput(JSON.stringify(parsed, null, 2));
      }
    } catch (e: any) { setError(e.message); setOutput(''); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">JSON ↔ YAML</h1>
      <p className="text-gray-400 text-sm mb-5">Convert between JSON and YAML formats.</p>
      <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1 w-fit mb-4">
        <button onClick={() => setMode('jsonToYaml')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'jsonToYaml' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>JSON → YAML</button>
        <button onClick={() => setMode('yamlToJson')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'yamlToJson' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>YAML → JSON</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label={mode === 'jsonToYaml' ? 'Input JSON' : 'Input YAML'} value={input} onChange={setInput}
          placeholder={mode === 'jsonToYaml' ? '{"name":"John","age":30}' : 'name: John\nage: 30'} rows={18} error={error} />
        <IOPanel label={mode === 'jsonToYaml' ? 'Output YAML' : 'Output JSON'} value={output} readOnly showCopy rows={18} />
      </div>
      <button onClick={convert} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Convert</button>
    </div>
  );
};

export default JsonYamlTool;
