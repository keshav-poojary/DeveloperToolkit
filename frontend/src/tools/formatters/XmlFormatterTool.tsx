import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const XmlFormatterTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const format = (minify = false) => {
    setError('');
    try {
      const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: true });
      const parsed = parser.parse(input);
      const builder = new XMLBuilder({ ignoreAttributes: false, preserveOrder: true, format: !minify, indentBy: '  ' });
      setOutput(builder.build(parsed));
    } catch (e: any) { setError(e.message); setOutput(''); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">XML Formatter</h1>
      <p className="text-gray-400 text-sm mb-5">Beautify or minify XML documents.</p>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => format(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Beautify</button>
        <button onClick={() => format(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">Minify</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input XML" value={input} onChange={setInput} placeholder="<root><item id='1'>Hello</item></root>" rows={18} error={error} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={18} />
      </div>
    </div>
  );
};

export default XmlFormatterTool;
