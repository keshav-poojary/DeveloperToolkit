import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const JsonXmlTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'jsonToXml'|'xmlToJson'>('jsonToXml');

  const convert = () => {
    setError('');
    try {
      if (mode === 'jsonToXml') {
        const parsed = JSON.parse(input);
        const builder = new XMLBuilder({ ignoreAttributes: false, format: true, indentBy: '  ' });
        setOutput('<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build({ root: parsed }));
      } else {
        const parser = new XMLParser({ ignoreAttributes: false });
        const parsed = parser.parse(input);
        setOutput(JSON.stringify(parsed, null, 2));
      }
    } catch (e: any) { setError(e.message); setOutput(''); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">JSON ↔ XML</h1>
      <p className="text-gray-400 text-sm mb-5">Convert between JSON and XML formats.</p>
      <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1 w-fit mb-4">
        <button onClick={() => setMode('jsonToXml')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'jsonToXml' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>JSON → XML</button>
        <button onClick={() => setMode('xmlToJson')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'xmlToJson' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>XML → JSON</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label={mode === 'jsonToXml' ? 'Input JSON' : 'Input XML'} value={input} onChange={setInput}
          placeholder={mode === 'jsonToXml' ? '{"name":"Alice","role":"admin"}' : '<root><name>Alice</name><role>admin</role></root>'} rows={18} error={error} />
        <IOPanel label={mode === 'jsonToXml' ? 'Output XML' : 'Output JSON'} value={output} readOnly showCopy rows={18} />
      </div>
      <button onClick={convert} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Convert</button>
    </div>
  );
};

export default JsonXmlTool;
