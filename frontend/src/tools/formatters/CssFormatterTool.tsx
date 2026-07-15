import React, { useState } from 'react';
import IOPanel from '../../components/IOPanel';

const formatCss = (css: string, minify: boolean): string => {
  if (minify) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*;\s*/g, ';')
      .replace(/;\}/g, '}')
      .trim();
  }
  let indent = 0;
  const lines: string[] = [];
  const tokens = css.match(/[^{}]+[{}]|[^{}]+$/g) ?? [];
  for (const token of tokens) {
    const t = token.trim();
    if (t.endsWith('{')) {
      lines.push('  '.repeat(indent) + t);
      indent++;
    } else if (t.includes('}')) {
      indent = Math.max(0, indent - 1);
      const props = t.replace('}', '').trim();
      if (props) {
        props.split(';').filter(Boolean).forEach(p => lines.push('  '.repeat(indent) + p.trim() + ';'));
      }
      lines.push('  '.repeat(indent) + '}');
    } else {
      t.split(';').filter(Boolean).forEach(p => lines.push('  '.repeat(indent) + p.trim() + ';'));
    }
  }
  return lines.join('\n');
};

const CssFormatterTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">CSS Formatter</h1>
      <p className="text-gray-400 text-sm mb-5">Format and minify CSS stylesheets.</p>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setOutput(formatCss(input, false))} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Beautify</button>
        <button onClick={() => setOutput(formatCss(input, true))} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">Minify</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IOPanel label="Input CSS" value={input} onChange={setInput} placeholder="body{margin:0;padding:0;background:#000}" rows={18} />
        <IOPanel label="Output" value={output} readOnly showCopy rows={18} />
      </div>
    </div>
  );
};

export default CssFormatterTool;
