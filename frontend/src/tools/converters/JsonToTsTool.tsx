import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const inferType = (v: unknown): string => {
  if (v === null) return 'null';
  if (Array.isArray(v)) {
    if (v.length === 0) return 'unknown[]';
    return `${inferType(v[0])}[]`;
  }
  if (typeof v === 'object') return buildInterface(v as Record<string, unknown>);
  return typeof v;
};

const buildInterface = (obj: Record<string, unknown>, depth = 0): string => {
  const pad = '  '.repeat(depth);
  const lines = [`${depth === 0 ? '' : ''}{\n`];
  for (const [k, v] of Object.entries(obj)) {
    const type = inferType(v);
    lines.push(`${pad}  ${/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`}: ${type};\n`);
  }
  lines.push(`${pad}}`);
  return lines.join('');
};

const jsonToTs = (json: string): string => {
  const parsed = JSON.parse(json);
  if (Array.isArray(parsed)) {
    const item = parsed[0] ?? {};
    return `export interface Root ${buildInterface(item)}\n\nexport type RootArray = Root[];`;
  }
  if (typeof parsed === 'object' && parsed !== null) {
    return `export interface Root ${buildInterface(parsed as Record<string, unknown>)}`;
  }
  return `export type Root = ${typeof parsed};`;
};

const JsonToTsTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const convert = () => {
    setError('');
    try { setOutput(jsonToTs(input)); }
    catch (e: any) { setError(e.message); setOutput(''); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">JSON → TypeScript Interface</h1>
      <p className="text-gray-400 text-sm mb-5">Generate TypeScript interfaces from JSON data.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input JSON" value={input} onChange={setInput}
          placeholder='{"id":1,"name":"Alice","active":true,"tags":["admin"]}' rows={18} error={error} />
        <IOPanel label="TypeScript Interface" value={output} readOnly showCopy rows={18} />
      </div>
      <button onClick={convert} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Generate</button>
    </div>
  );
};

export default JsonToTsTool;
