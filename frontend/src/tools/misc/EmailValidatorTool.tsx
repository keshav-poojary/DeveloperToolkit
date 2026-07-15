import React, { useState } from 'react';

const EmailValidatorTool: React.FC = () => {
  const [email, setEmail] = useState('');

  const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const valid = email ? EMAIL_RE.test(email) : null;
  
  const atIdx = email.indexOf('@');
  const local = atIdx > -1 ? email.slice(0, atIdx) : email;
  const domain = atIdx > -1 ? email.slice(atIdx + 1) : '';
  const tld = domain.includes('.') ? domain.split('.').pop() ?? '' : '';
  
  const checks = email
    ? [
        { label: 'Contains @',       ok: email.includes('@') },
        { label: 'Has local part',   ok: local.length > 0 },
        { label: 'Has domain',        ok: domain.length > 0 },
        { label: 'Has TLD',           ok: tld.length >= 2 },
        { label: 'No spaces',         ok: !email.includes(' ') },
        { label: 'Valid characters',  ok: !/[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~@-]/.test(email) },
        { label: 'RFC 5322 compliant',ok: valid === true },
      ]
    : [];

  const examples = [
    'user@example.com', 'john.doe+tag@company.org', 'user@sub.domain.io', 'invalid@', 'no-at-sign', '@nodomain.com',
  ];

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Email Validator</h1>
      <p className="text-gray-400 text-sm mb-5">Validate email addresses against RFC 5322 rules.</p>

      <div className="mb-4">
        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="user@example.com"
          className={`w-full bg-gray-900 border rounded-lg px-4 py-3 text-base font-mono focus:outline-none focus:ring-1 transition-colors ${
            valid === null ? 'border-gray-700 text-gray-100' :
            valid ? 'border-emerald-600 text-emerald-300 focus:ring-emerald-500' : 'border-red-700 text-red-300 focus:ring-red-500'
          }`} />
      </div>

      {valid !== null && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-4 font-semibold ${
          valid ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' : 'bg-red-950/40 border-red-900 text-red-400'
        }`}>
          {valid ? '✅ Valid email address' : '❌ Invalid email address'}
        </div>
      )}

      {checks.length > 0 && (
        <div className="space-y-1.5 mb-5">
          {checks.map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
              <span className={ok ? 'text-emerald-400' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>
              <span className="text-sm text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      )}

      {atIdx > -1 && email && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 mb-2">Parsed</p>
          <div className="space-y-1">
            <p className="text-xs font-mono"><span className="text-gray-500 w-20 inline-block">Local:</span> <span className="text-indigo-300">{local}</span></p>
            <p className="text-xs font-mono"><span className="text-gray-500 w-20 inline-block">Domain:</span> <span className="text-blue-300">{domain}</span></p>
            {tld && <p className="text-xs font-mono"><span className="text-gray-500 w-20 inline-block">TLD:</span> <span className="text-green-300">.{tld}</span></p>}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-gray-500 mb-2">Quick test examples:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map(e => (
            <button key={e} onClick={() => setEmail(e)}
              className="text-xs font-mono px-2 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded transition-colors">
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmailValidatorTool;
