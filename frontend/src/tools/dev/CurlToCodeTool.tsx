import { useState, useMemo } from 'react';
import CopyButton from '../../components/CopyButton';

// ─── cURL parser ─────────────────────────────────────────────────────────────

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  isFormData: boolean;
  formFields: Record<string, string>;
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const s = input.replace(/\\\n\s*/g, ' ').trim();
  while (i < s.length) {
    if (s[i] === ' ' || s[i] === '\t') { i++; continue; }
    if (s[i] === "'" || s[i] === '"') {
      const q = s[i++];
      let tok = '';
      while (i < s.length && s[i] !== q) {
        if (s[i] === '\\' && i + 1 < s.length) { i++; tok += s[i++]; }
        else tok += s[i++];
      }
      i++; // closing quote
      tokens.push(tok);
    } else {
      let tok = '';
      while (i < s.length && s[i] !== ' ' && s[i] !== '\t') {
        if (s[i] === '\\' && i + 1 < s.length) { i++; tok += s[i++]; }
        else tok += s[i++];
      }
      tokens.push(tok);
    }
  }
  return tokens;
}

function parseCurl(raw: string): ParsedCurl {
  const tokens = tokenize(raw);
  if (tokens[0]?.toLowerCase() !== 'curl') throw new Error('Input must start with "curl"');

  let method = '';
  let url = '';
  const headers: Record<string, string> = {};
  let body: string | null = null;
  const formFields: Record<string, string> = {};
  let isFormData = false;
  let i = 1;

  while (i < tokens.length) {
    const t = tokens[i];
    if (t === '-X' || t === '--request') {
      method = tokens[++i] || 'GET';
    } else if (t === '-H' || t === '--header') {
      const h = tokens[++i] || '';
      const colon = h.indexOf(':');
      if (colon > 0) headers[h.slice(0, colon).trim()] = h.slice(colon + 1).trim();
    } else if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-binary') {
      body = tokens[++i] || '';
    } else if (t === '-F' || t === '--form') {
      isFormData = true;
      const fv = tokens[++i] || '';
      const eq = fv.indexOf('=');
      if (eq > 0) formFields[fv.slice(0, eq)] = fv.slice(eq + 1);
    } else if (t === '-u' || t === '--user') {
      const creds = tokens[++i] || '';
      headers['Authorization'] = 'Basic ' + btoa(creds);
    } else if (t === '-A' || t === '--user-agent') {
      headers['User-Agent'] = tokens[++i] || '';
    } else if (t === '-b' || t === '--cookie') {
      headers['Cookie'] = tokens[++i] || '';
    } else if (t === '--compressed') {
      headers['Accept-Encoding'] = headers['Accept-Encoding'] || 'gzip, deflate, br';
    } else if (!t.startsWith('-') && !url) {
      url = t;
    }
    i++;
  }

  if (!method) {
    method = body || isFormData ? 'POST' : 'GET';
  }
  if (!url) throw new Error('No URL found in cURL command');

  return { method: method.toUpperCase(), url, headers, body: body ?? null, isFormData, formFields };
}

// ─── Code generators ─────────────────────────────────────────────────────────

function toFetch(p: ParsedCurl): string {
  const lines: string[] = [];
  const opts: string[] = [];

  if (p.method !== 'GET') opts.push(`  method: '${p.method}'`);

  const headerEntries = Object.entries(p.headers);
  if (headerEntries.length) {
    const inner = headerEntries.map(([k, v]) => `    '${k}': '${v}'`).join(',\n');
    opts.push(`  headers: {\n${inner}\n  }`);
  }

  if (p.isFormData) {
    lines.push('const form = new FormData();');
    Object.entries(p.formFields).forEach(([k, v]) => lines.push(`form.append('${k}', '${v}');`));
    opts.push('  body: form');
  } else if (p.body) {
    opts.push(`  body: ${JSON.stringify(p.body)}`);
  }

  const optsStr = opts.length ? `, {\n${opts.join(',\n')}\n}` : '';
  lines.push('');
  lines.push(`const response = await fetch('${p.url}'${optsStr});`);
  lines.push('const data = await response.json();');
  lines.push('console.log(data);');
  return lines.join('\n').trim();
}

function toAxios(p: ParsedCurl): string {
  const lines: string[] = ["import axios from 'axios';", ''];
  const cfg: string[] = [`  method: '${p.method.toLowerCase()}'`, `  url: '${p.url}'`];

  const headerEntries = Object.entries(p.headers);
  if (headerEntries.length) {
    const inner = headerEntries.map(([k, v]) => `    '${k}': '${v}'`).join(',\n');
    cfg.push(`  headers: {\n${inner}\n  }`);
  }

  if (p.isFormData) {
    lines.push('const form = new FormData();');
    Object.entries(p.formFields).forEach(([k, v]) => lines.push(`form.append('${k}', '${v}');`));
    cfg.push('  data: form');
  } else if (p.body) {
    cfg.push(`  data: ${JSON.stringify(p.body)}`);
  }

  lines.push(`const { data } = await axios({\n${cfg.join(',\n')}\n});`);
  lines.push('console.log(data);');
  return lines.join('\n');
}

function toPython(p: ParsedCurl): string {
  const lines: string[] = ['import requests', ''];

  if (Object.keys(p.headers).length) {
    lines.push('headers = {');
    Object.entries(p.headers).forEach(([k, v]) => lines.push(`    '${k}': '${v}',`));
    lines.push('}');
    lines.push('');
  }

  const headersArg = Object.keys(p.headers).length ? ', headers=headers' : '';

  if (p.isFormData) {
    lines.push('files = {');
    Object.entries(p.formFields).forEach(([k, v]) => lines.push(`    '${k}': (None, '${v}'),`));
    lines.push('}');
    lines.push('');
    lines.push(`response = requests.${p.method.toLowerCase()}('${p.url}'${headersArg}, files=files)`);
  } else if (p.body) {
    lines.push(`data = ${JSON.stringify(p.body)}`);
    lines.push('');
    const ct = p.headers['Content-Type'] || '';
    if (ct.includes('json')) {
      lines.push(`response = requests.${p.method.toLowerCase()}('${p.url}'${headersArg}, json=data)`);
    } else {
      lines.push(`response = requests.${p.method.toLowerCase()}('${p.url}'${headersArg}, data=data)`);
    }
  } else {
    lines.push(`response = requests.${p.method.toLowerCase()}('${p.url}'${headersArg})`);
  }

  lines.push('print(response.json())');
  return lines.join('\n');
}

function toNode(p: ParsedCurl): string {
  let urlObj: URL | null = null;
  try { urlObj = new URL(p.url); } catch { /* ignore */ }
  if (!urlObj) return `// Invalid URL: ${p.url}`;

  const isHttps = urlObj.protocol === 'https:';
  const port = urlObj.port || (isHttps ? '443' : '80');
  const path = urlObj.pathname + urlObj.search;

  const lines: string[] = [`const ${isHttps ? 'https' : 'http'} = require('${isHttps ? 'https' : 'http'}');`, ''];
  const opts: string[] = [
    `  hostname: '${urlObj.hostname}'`,
    `  port: ${port}`,
    `  path: '${path}'`,
    `  method: '${p.method}'`,
  ];

  if (Object.keys(p.headers).length) {
    const inner = Object.entries(p.headers).map(([k, v]) => `    '${k}': '${v}'`).join(',\n');
    opts.push(`  headers: {\n${inner}\n  }`);
  }

  lines.push(`const options = {\n${opts.join(',\n')}\n};`);
  lines.push('');
  lines.push(`const req = ${isHttps ? 'https' : 'http'}.request(options, (res) => {`);
  lines.push('  let data = \'\';');
  lines.push('  res.on(\'data\', (chunk) => { data += chunk; });');
  lines.push('  res.on(\'end\', () => { console.log(JSON.parse(data)); });');
  lines.push('});');
  lines.push('req.on(\'error\', (e) => console.error(e));');
  if (p.body) lines.push(`req.write(${JSON.stringify(p.body)});`);
  lines.push('req.end();');
  return lines.join('\n');
}

function toGo(p: ParsedCurl): string {
  const lines: string[] = ['package main', '', 'import (', '\t"fmt"', '\t"io"', '\t"net/http"'];
  if (p.body) lines.splice(5, 0, '\t"strings"');
  lines.push(')', '');
  lines.push('func main() {');

  if (p.body) {
    lines.push(`\tbody := strings.NewReader(${JSON.stringify(p.body)})`);
    lines.push(`\treq, _ := http.NewRequest("${p.method}", "${p.url}", body)`);
  } else {
    lines.push(`\treq, _ := http.NewRequest("${p.method}", "${p.url}", nil)`);
  }

  Object.entries(p.headers).forEach(([k, v]) => lines.push(`\treq.Header.Set("${k}", "${v}")`));
  lines.push('');
  lines.push('\tclient := &http.Client{}');
  lines.push('\tresp, err := client.Do(req)');
  lines.push('\tif err != nil { panic(err) }');
  lines.push('\tdefer resp.Body.Close()');
  lines.push('\tbody2, _ := io.ReadAll(resp.Body)');
  lines.push('\tfmt.Println(string(body2))');
  lines.push('}');
  return lines.join('\n');
}

function toPhp(p: ParsedCurl): string {
  const lines: string[] = ['<?php', '', '$ch = curl_init();', `curl_setopt($ch, CURLOPT_URL, '${p.url}');`, 'curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);'];
  if (p.method !== 'GET') lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${p.method}');`);

  if (Object.keys(p.headers).length) {
    lines.push('curl_setopt($ch, CURLOPT_HTTPHEADER, [');
    Object.entries(p.headers).forEach(([k, v]) => lines.push(`    '${k}: ${v}',`));
    lines.push(']);');
  }

  if (p.body) lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, '${p.body}');`);

  lines.push('', '$response = curl_exec($ch);', 'curl_close($ch);', 'echo $response;', '?>');
  return lines.join('\n');
}

// ─── Language config ──────────────────────────────────────────────────────────

const LANGS = [
  { id: 'fetch',  label: 'JS Fetch',  lang: 'javascript', gen: toFetch },
  { id: 'axios',  label: 'Axios',     lang: 'javascript', gen: toAxios },
  { id: 'python', label: 'Python',    lang: 'python',      gen: toPython },
  { id: 'node',   label: 'Node.js',   lang: 'javascript', gen: toNode },
  { id: 'go',     label: 'Go',        lang: 'go',          gen: toGo },
  { id: 'php',    label: 'PHP',       lang: 'php',         gen: toPhp },
];

const SAMPLE = `curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.token' \\
  -d '{"name":"Jane","email":"jane@example.com"}'`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CurlToCodeTool() {
  const [input, setInput] = useState(SAMPLE);
  const [langId, setLangId] = useState('fetch');

  const lang = LANGS.find(l => l.id === langId)!;

  const { code, error, parsed } = useMemo(() => {
    try {
      const p = parseCurl(input.trim());
      return { code: lang.gen(p), error: '', parsed: p };
    } catch (e: any) {
      return { code: '', error: e.message, parsed: null };
    }
  }, [input, langId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">cURL → Code</h1>
      <p className="text-gray-500 text-sm mb-6">Convert a cURL command into runnable code in multiple languages.</p>

      {/* Input */}
      <div className="mb-4">
        <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">cURL Command</label>
        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          rows={6}
          spellCheck={false}
          className="w-full rounded-xl px-4 py-3 text-sm font-mono text-gray-200 focus:outline-none resize-y transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}` }}
          placeholder="curl -X GET 'https://api.example.com/data' -H 'Authorization: Bearer TOKEN'"
        />
        {error && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />{error}</p>}
      </div>

      {/* Parsed summary */}
      {parsed && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">{parsed.method}</span>
          <span className="text-xs font-mono text-gray-400 truncate max-w-xs">{parsed.url}</span>
          {Object.keys(parsed.headers).length > 0 && (
            <span className="text-[10px] text-gray-600">{Object.keys(parsed.headers).length} header{Object.keys(parsed.headers).length > 1 ? 's' : ''}</span>
          )}
          {parsed.body && <span className="text-[10px] text-gray-600">body: {parsed.body.length} chars</span>}
        </div>
      )}

      {/* Language tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {LANGS.map(l => (
          <button key={l.id} onClick={() => setLangId(l.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              langId === l.id
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-gray-500 border border-white/6 hover:text-gray-300 hover:border-white/15'
            }`}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Output */}
      {code && (
        <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)' }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{lang.label}</span>
            <CopyButton text={code} />
          </div>
          <pre className="px-4 py-4 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed">{code}</pre>
        </div>
      )}
    </div>
  );
}
