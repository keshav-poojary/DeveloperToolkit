import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const formatHtml = (html: string, minify: boolean): string => {
  if (minify) return html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
  let indent = 0;
  const lines: string[] = [];
  const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const tokens = html.match(/<[^>]+>|[^<]+/g) ?? [];
  for (const token of tokens) {
    const text = token.trim();
    if (!text) continue;
    if (text.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      lines.push('  '.repeat(indent) + text);
    } else if (text.startsWith('<') && !text.startsWith('<!') && !text.startsWith('<?')) {
      const tag = (text.match(/^<([a-zA-Z0-9-]+)/) ?? [])[1]?.toLowerCase();
      lines.push('  '.repeat(indent) + text);
      if (tag && !VOID.has(tag) && !text.endsWith('/>')) indent++;
    } else {
      lines.push('  '.repeat(indent) + text);
    }
  }
  return lines.join('\n');
};

const HtmlFormatterTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">HTML Formatter</h1>
      <p className="text-gray-400 text-sm mb-5">Beautify or minify HTML markup.</p>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setOutput(formatHtml(input, false))} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Beautify</button>
        <button onClick={() => setOutput(formatHtml(input, true))} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">Minify</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input HTML" value={input} onChange={setInput} placeholder="<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>" rows={18} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={18} />
      </div>
    </div>
  );
};

export default HtmlFormatterTool;
