import React, { useState } from 'react';
import { marked } from 'marked';
import IOPanel from '../../components/IOPanel';

const MarkdownTool: React.FC = () => {
  const [input, setInput] = useState(`# Hello Developer Toolkit\n\nWrite **Markdown** here and see the *live preview*.\n\n## Features\n- ✅ GitHub-flavored Markdown\n- ✅ Code blocks\n- ✅ Tables\n\n\`\`\`js\nconsole.log("Hello!");\n\`\`\`\n\n| Name | Value |\n|------|-------|\n| foo  | bar   |\n`);
  const [view, setView] = useState<'split' | 'preview'>('split');

  const html = marked(input) as string;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Markdown Preview</h1>
          <p className="text-gray-400 text-sm">Live Markdown to HTML preview.</p>
        </div>
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
          {(['split','preview'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium capitalize transition-colors ${view === v ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-4 ${view === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {(view === 'split') && (
          <IOPanel label="Markdown" value={input} onChange={setInput} rows={24} placeholder="Write markdown…" />
        )}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 overflow-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Preview</div>
          <div
            className="prose prose-invert prose-sm max-w-none"
            style={{ color: '#d1d5db' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
};

export default MarkdownTool;
