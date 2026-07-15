import React, { useState } from 'react';

const HTTP_CODES = [
  { code: 100, text: 'Continue',                   category: '1xx', desc: 'Initial part of request received; client should continue.' },
  { code: 101, text: 'Switching Protocols',         category: '1xx', desc: 'Server agrees to switch protocols.' },
  { code: 200, text: 'OK',                          category: '2xx', desc: 'Request succeeded. Default for GET, POST.' },
  { code: 201, text: 'Created',                     category: '2xx', desc: 'Request succeeded and resource was created.' },
  { code: 202, text: 'Accepted',                    category: '2xx', desc: 'Request accepted for processing, but processing not complete.' },
  { code: 204, text: 'No Content',                  category: '2xx', desc: 'Request succeeded but no content to return.' },
  { code: 206, text: 'Partial Content',             category: '2xx', desc: 'Server delivering partial resource (range request).' },
  { code: 301, text: 'Moved Permanently',           category: '3xx', desc: 'Resource permanently moved to new URL.' },
  { code: 302, text: 'Found',                       category: '3xx', desc: 'Resource temporarily at different URL.' },
  { code: 304, text: 'Not Modified',                category: '3xx', desc: 'Resource not modified; use cached version.' },
  { code: 307, text: 'Temporary Redirect',          category: '3xx', desc: 'Redirect while preserving request method.' },
  { code: 308, text: 'Permanent Redirect',          category: '3xx', desc: 'Permanent redirect, method must not change.' },
  { code: 400, text: 'Bad Request',                 category: '4xx', desc: 'Server cannot process request due to client error.' },
  { code: 401, text: 'Unauthorized',                category: '4xx', desc: 'Authentication required.' },
  { code: 403, text: 'Forbidden',                   category: '4xx', desc: 'Server understood but refuses to authorize.' },
  { code: 404, text: 'Not Found',                   category: '4xx', desc: 'Resource not found on server.' },
  { code: 405, text: 'Method Not Allowed',          category: '4xx', desc: 'HTTP method not allowed for this resource.' },
  { code: 408, text: 'Request Timeout',             category: '4xx', desc: 'Server timed out waiting for request.' },
  { code: 409, text: 'Conflict',                    category: '4xx', desc: 'Request conflicts with current state of resource.' },
  { code: 410, text: 'Gone',                        category: '4xx', desc: 'Resource permanently removed.' },
  { code: 413, text: 'Payload Too Large',           category: '4xx', desc: 'Request entity exceeds server limits.' },
  { code: 414, text: 'URI Too Long',                category: '4xx', desc: 'URI too long for server to process.' },
  { code: 415, text: 'Unsupported Media Type',      category: '4xx', desc: 'Media format not supported.' },
  { code: 422, text: 'Unprocessable Entity',        category: '4xx', desc: 'Well-formed but semantically incorrect request.' },
  { code: 429, text: 'Too Many Requests',           category: '4xx', desc: 'User sent too many requests (rate limiting).' },
  { code: 500, text: 'Internal Server Error',       category: '5xx', desc: 'Generic server error.' },
  { code: 501, text: 'Not Implemented',             category: '5xx', desc: 'Server does not support requested functionality.' },
  { code: 502, text: 'Bad Gateway',                 category: '5xx', desc: 'Upstream server returned invalid response.' },
  { code: 503, text: 'Service Unavailable',         category: '5xx', desc: 'Server temporarily unable to handle requests.' },
  { code: 504, text: 'Gateway Timeout',             category: '5xx', desc: 'Upstream server did not respond in time.' },
];

const catColor: Record<string, string> = {
  '1xx': 'text-gray-400 bg-gray-800 border-gray-700',
  '2xx': 'text-emerald-400 bg-emerald-950/40 border-emerald-900',
  '3xx': 'text-blue-400 bg-blue-950/40 border-blue-900',
  '4xx': 'text-yellow-400 bg-yellow-950/40 border-yellow-900',
  '5xx': 'text-red-400 bg-red-950/40 border-red-900',
};

const HttpStatusTool: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = HTTP_CODES.filter(c =>
    (filter === 'all' || c.category === filter) &&
    (!search || c.code.toString().includes(search) || c.text.toLowerCase().includes(search.toLowerCase()))
  );

  const categories = ['all', '1xx', '2xx', '3xx', '4xx', '5xx'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">HTTP Status Codes</h1>
      <p className="text-gray-400 text-sm mb-5">Complete reference for HTTP status codes.</p>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code or name…"
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-52" />
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors capitalize ${filter === c ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(c => (
          <div key={c.code} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${catColor[c.category]}`}>
            <span className="font-mono font-bold text-lg w-12 flex-shrink-0">{c.code}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{c.text}</p>
              <p className="text-xs opacity-70 mt-0.5">{c.desc}</p>
            </div>
            <span className="text-xs opacity-50 flex-shrink-0">{c.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HttpStatusTool;
