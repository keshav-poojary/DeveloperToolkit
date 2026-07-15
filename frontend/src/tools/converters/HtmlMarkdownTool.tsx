import React, { useState, useCallback } from 'react';
import CopyButton from '../../components/CopyButton';

// ─── Lightweight HTML → Markdown converter (no external deps) ────────────────

function htmlToMarkdown(html: string): string {
  // Create a temporary DOM to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? '').replace(/\n+/g, ' ');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const children = () => Array.from(el.childNodes).map(processNode).join('');

    switch (tag) {
      // Block elements
      case 'h1': return `\n# ${children().trim()}\n`;
      case 'h2': return `\n## ${children().trim()}\n`;
      case 'h3': return `\n### ${children().trim()}\n`;
      case 'h4': return `\n#### ${children().trim()}\n`;
      case 'h5': return `\n##### ${children().trim()}\n`;
      case 'h6': return `\n###### ${children().trim()}\n`;
      case 'p':  return `\n${children().trim()}\n`;
      case 'br': return '  \n';
      case 'hr': return '\n---\n';

      // Inline formatting
      case 'strong': case 'b': return `**${children()}**`;
      case 'em': case 'i':     return `_${children()}_`;
      case 'del': case 's':    return `~~${children()}~~`;
      case 'code': {
        const parent = el.parentElement?.tagName.toLowerCase();
        if (parent === 'pre') return el.textContent ?? '';
        return `\`${children()}\``;
      }
      case 'pre': {
        const codeEl = el.querySelector('code');
        const cls = codeEl?.className ?? '';
        const langMatch = cls.match(/language-(\w+)/);
        const lang = langMatch ? langMatch[1] : '';
        const text = (codeEl ? codeEl.textContent : el.textContent) ?? '';
        return `\n\`\`\`${lang}\n${text.trim()}\n\`\`\`\n`;
      }

      // Links & images
      case 'a': {
        const href = el.getAttribute('href') ?? '';
        const title = el.getAttribute('title');
        const text = children().trim() || href;
        return title ? `[${text}](${href} "${title}")` : `[${text}](${href})`;
      }
      case 'img': {
        const src = el.getAttribute('src') ?? '';
        const alt = el.getAttribute('alt') ?? '';
        const title = el.getAttribute('title');
        return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
      }

      // Lists
      case 'ul': {
        return '\n' + Array.from(el.children).map(li => {
          const content = Array.from(li.childNodes).map(processNode).join('').trim();
          return `- ${content}`;
        }).join('\n') + '\n';
      }
      case 'ol': {
        return '\n' + Array.from(el.children).map((li, i) => {
          const content = Array.from(li.childNodes).map(processNode).join('').trim();
          return `${i + 1}. ${content}`;
        }).join('\n') + '\n';
      }
      case 'li': return children();

      // Blockquote
      case 'blockquote': {
        const inner = children().trim().split('\n').map(l => `> ${l}`).join('\n');
        return `\n${inner}\n`;
      }

      // Tables
      case 'table': {
        const rows = Array.from(el.querySelectorAll('tr'));
        if (!rows.length) return '';
        const toRow = (tr: Element) =>
          '| ' + Array.from(tr.querySelectorAll('th,td')).map(c => c.textContent?.trim() ?? '').join(' | ') + ' |';
        const header = rows[0];
        const isHeaderRow = header.querySelector('th') !== null;
        const headerMd = toRow(header);
        const cols = header.querySelectorAll('th,td').length;
        const sep = '| ' + Array(cols).fill('---').join(' | ') + ' |';
        const body = rows.slice(isHeaderRow ? 1 : 0).map(toRow).join('\n');
        if (isHeaderRow) return `\n${headerMd}\n${sep}\n${body}\n`;
        return `\n${sep}\n${body}\n`;
      }

      // Divs / sections — just recurse
      case 'div': case 'section': case 'article': case 'main': case 'header': case 'footer': case 'aside':
        return `\n${children().trim()}\n`;

      case 'span': return children();

      // Skip scripts, styles, meta
      case 'script': case 'style': case 'meta': case 'link': case 'head': return '';

      default: return children();
    }
  }

  const raw = processNode(doc.body);
  // Clean up excessive blank lines
  return raw.replace(/\n{3,}/g, '\n\n').trim();
}

// ─── Sample HTML ─────────────────────────────────────────────────────────────

const SAMPLE = `<h1>Hello, World!</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> paragraph with a <a href="https://example.com">link</a>.</p>

<h2>Features</h2>
<ul>
  <li>Fast conversion</li>
  <li>Supports <code>inline code</code></li>
  <li>Tables, blockquotes, and more</li>
</ul>

<blockquote>
  <p>Great tools make developers happy.</p>
</blockquote>

<pre><code class="language-javascript">const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('World'));
</code></pre>

<table>
  <tr><th>Name</th><th>Role</th></tr>
  <tr><td>Alice</td><td>Engineer</td></tr>
  <tr><td>Bob</td><td>Designer</td></tr>
</table>`;

// ─── Component ────────────────────────────────────────────────────────────────

type Mode = 'side-by-side' | 'stacked';

export default function HtmlMarkdownTool() {
  const [html, setHtml] = useState(SAMPLE);
  const [mode, setMode] = useState<Mode>('side-by-side');

  const markdown = useCallback(() => {
    try { return htmlToMarkdown(html); } catch { return ''; }
  }, [html])();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setHtml(ev.target?.result as string ?? '');
    r.readAsText(f);
    e.target.value = '';
  };

  const panelClass = 'rounded-2xl border border-white/8 overflow-hidden flex flex-col';
  const headerClass = 'px-4 py-2.5 border-b border-white/5 flex items-center justify-between flex-shrink-0';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">HTML → Markdown</h1>
          <p className="text-gray-500 text-sm">Convert HTML markup to clean Markdown.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layout toggle */}
          <div className="flex rounded-lg border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {(['side-by-side', 'stacked'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${mode === m ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300'}`}>
                {m === 'side-by-side' ? '⬜⬜ Side by side' : '☰ Stacked'}
              </button>
            ))}
          </div>
          {/* File upload */}
          <label className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-gray-400 hover:text-white hover:border-white/25 transition-all cursor-pointer">
            Upload HTML
            <input type="file" accept=".html,.htm" className="hidden" onChange={handleFile} />
          </label>
          {/* Clear */}
          <button onClick={() => setHtml('')}
            className="px-3 py-1.5 rounded-lg border border-white/8 text-xs text-gray-500 hover:text-gray-300 transition-all">
            Clear
          </button>
        </div>
      </div>

      <div className={mode === 'side-by-side' ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'}>
        {/* HTML input */}
        <div className={panelClass} style={{ background: 'rgba(255,255,255,0.025)' }}>
          <div className={headerClass} style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">HTML</span>
            <span className="text-[10px] text-gray-700">{html.length} chars</span>
          </div>
          <textarea
            value={html}
            onChange={e => setHtml(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full px-4 py-3 text-sm font-mono text-gray-300 bg-transparent focus:outline-none resize-none"
            style={{ minHeight: mode === 'stacked' ? '280px' : '460px' }}
            placeholder="Paste HTML here…"
          />
        </div>

        {/* Markdown output */}
        <div className={panelClass} style={{ background: 'rgba(255,255,255,0.025)' }}>
          <div className={headerClass} style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Markdown</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-700">{markdown.length} chars</span>
              <CopyButton text={markdown} />
            </div>
          </div>
          <pre
            className="flex-1 px-4 py-3 text-sm font-mono text-gray-300 overflow-auto whitespace-pre-wrap break-words"
            style={{ minHeight: mode === 'stacked' ? '280px' : '460px' }}
          >
            {markdown || <span className="text-gray-700">Output will appear here…</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
