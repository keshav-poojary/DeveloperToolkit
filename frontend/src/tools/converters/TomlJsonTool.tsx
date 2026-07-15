import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

// Minimal TOML parser/serializer
const parseToml = (toml: string): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  let current = result;
  for (const rawLine of toml.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('[') && line.endsWith(']')) {
      const key = line.slice(1,-1);
      (result as any)[key] = {};
      current = (result as any)[key];
    } else {
      const eq = line.indexOf('=');
      if (eq < 0) continue;
      const k = line.slice(0, eq).trim();
      const v = line.slice(eq+1).trim();
      if (v.startsWith('"') && v.endsWith('"')) current[k] = v.slice(1,-1);
      else if (v === 'true') current[k] = true;
      else if (v === 'false') current[k] = false;
      else if (!isNaN(Number(v))) current[k] = Number(v);
      else current[k] = v;
    }
  }
  return result;
};

const toToml = (obj: Record<string, unknown>, prefix = ''): string => {
  const lines: string[] = [];
  const nested: [string, Record<string, unknown>][] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      nested.push([prefix ? `${prefix}.${k}` : k, v as Record<string, unknown>]);
    } else {
      const val = typeof v === 'string' ? `"${v}"` : String(v);
      lines.push(`${k} = ${val}`);
    }
  }
  for (const [name, section] of nested) {
    lines.push(`\n[${name}]`);
    lines.push(toToml(section, name));
  }
  return lines.join('\n');
};

const TomlJsonTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'tomlToJson'|'jsonToToml'>('tomlToJson');

  const convert = () => {
    setError('');
    try {
      if (mode === 'tomlToJson') {
        setOutput(JSON.stringify(parseToml(input), null, 2));
      } else {
        const parsed = JSON.parse(input);
        setOutput(toToml(parsed));
      }
    } catch (e: any) { setError(e.message); setOutput(''); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">TOML ↔ JSON</h1>
      <p className="text-gray-400 text-sm mb-5">Convert between TOML and JSON formats.</p>
      <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1 w-fit mb-4">
        <button onClick={() => setMode('tomlToJson')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'tomlToJson' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>TOML → JSON</button>
        <button onClick={() => setMode('jsonToToml')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'jsonToToml' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>JSON → TOML</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label={mode === 'tomlToJson' ? 'TOML Input' : 'JSON Input'} value={input} onChange={setInput}
          placeholder={mode === 'tomlToJson' ? 'title = "My App"\nversion = 1\n\n[database]\nhost = "localhost"\nport = 5432' : '{"title":"My App","version":1}'} rows={18} error={error} />
        <IOPanel label={mode === 'tomlToJson' ? 'JSON Output' : 'TOML Output'} value={output} readOnly showCopy rows={18} />
      </div>
      <button onClick={convert} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Convert</button>
    </div>
  );
};

export default TomlJsonTool;
