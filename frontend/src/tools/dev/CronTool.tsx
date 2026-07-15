import React, { useState } from 'react';
import cronstrue from 'cronstrue';

const PRESETS = [
  { label: 'Every minute',    value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every hour',      value: '0 * * * *' },
  { label: 'Daily at midnight',value:'0 0 * * *' },
  { label: 'Daily at noon',   value: '0 12 * * *' },
  { label: 'Weekly (Sun midnight)', value: '0 0 * * 0' },
  { label: 'Monthly (1st)',   value: '0 0 1 * *' },
  { label: 'Yearly (Jan 1)',  value: '0 0 1 1 *' },
];

const CronTool: React.FC = () => {
  const [expr, setExpr] = useState('*/5 * * * *');

  // Derived — never call setState during render
  let description = '';
  let error = '';
  try { description = cronstrue.toString(expr, { verbose: true, use24HourTimeFormat: true }); }
  catch (e: any) { error = e.message ?? String(e); }

  const parts = expr.trim().split(/\s+/);
  const labels = ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week'];
  const next5: string[] = [];
  try {
    // Simple next-run approximation
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(now.getTime() + (i + 1) * 5 * 60 * 1000);
      next5.push(d.toLocaleString());
    }
  } catch {}

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Cron Expression Parser</h1>
      <p className="text-gray-400 text-sm mb-5">Parse and explain cron job schedule expressions.</p>

      {/* Presets */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Presets</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.value} onClick={() => setExpr(p.value)}
              className="px-2.5 py-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expression */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cron Expression</label>
        <input value={expr} onChange={e => setExpr(e.target.value)}
          className={`w-full bg-gray-900 border rounded-lg px-3 py-2.5 text-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${error ? 'border-red-700 text-red-300' : 'border-gray-700 text-green-300'}`} />
      </div>

      {error ? (
        <div className="p-3 bg-red-950/50 border border-red-900 rounded-xl text-red-400 text-sm">{error}</div>
      ) : (
        <>
          {/* Human description */}
          <div className="bg-gray-900 border border-emerald-900/50 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-400 mb-1">Human readable:</p>
            <p className="text-base text-emerald-300 font-medium">{description}</p>
          </div>

          {/* Field breakdown */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {labels.map((label, i) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <p className="font-mono text-xl text-indigo-300 font-bold">{parts[i] ?? '*'}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Format guide */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-gray-400">
            <p className="font-semibold text-gray-300 mb-2">Field Reference</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {[
                ['*', 'any value'],['*/n', 'every n'],['n', 'specific value'],
                ['n-m', 'range'],['n,m', 'list'],['@hourly', '0 * * * *'],
                ['@daily', '0 0 * * *'],['@weekly', '0 0 * * 0'],['@monthly', '0 0 1 * *'],
              ].map(([sym, desc]) => (
                <p key={sym}><code className="text-indigo-400 mr-1">{sym}</code>— {desc}</p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CronTool;
