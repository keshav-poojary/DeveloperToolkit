import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const UrlParserTool: React.FC = () => {
  const [url, setUrl] = useState('https://user:pass@example.com:8080/path/to/page?foo=bar&baz=qux#section');
  let parsed: URL | null = null;
  let params: [string, string][] = [];
  try {
    parsed = new URL(url);
    params = [...new URLSearchParams(parsed.search).entries()];
  } catch {}

  const fields = parsed ? [
    { label: 'Protocol',  value: parsed.protocol },
    { label: 'Username',  value: parsed.username || '(none)' },
    { label: 'Password',  value: parsed.password || '(none)' },
    { label: 'Hostname',  value: parsed.hostname },
    { label: 'Port',      value: parsed.port || '(default)' },
    { label: 'Pathname',  value: parsed.pathname },
    { label: 'Search',    value: parsed.search || '(none)' },
    { label: 'Hash',      value: parsed.hash || '(none)' },
    { label: 'Origin',    value: parsed.origin },
    { label: 'Host',      value: parsed.host },
  ] : [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">URL Parser</h1>
      <p className="text-gray-400 text-sm mb-5">Parse and inspect URL components and query parameters.</p>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">URL</label>
        <input value={url} onChange={e => setUrl(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      {!parsed && url && (
        <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm">Invalid URL</div>
      )}

      {parsed && (
        <>
          <div className="space-y-2 mb-4">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">{label}</span>
                <span className="font-mono text-xs text-gray-200 flex-1 mx-3 truncate">{value}</span>
                {!value.startsWith('(') && <CopyButton text={value} />}
              </div>
            ))}
          </div>

          {params.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Query Parameters ({params.length})</h3>
              <div className="space-y-1.5">
                {params.map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
                    <span className="text-xs text-indigo-400 font-mono w-24 flex-shrink-0 truncate">{key}</span>
                    <span className="text-xs text-gray-300 font-mono flex-1 truncate">{value}</span>
                    <CopyButton text={value} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UrlParserTool;
