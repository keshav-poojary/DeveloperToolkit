import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

function base64urlDecode(str: string): string {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
  return atob(padded);
}

function parseJwt(token: string): { header: Record<string, unknown>; payload: Record<string, unknown> } {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('JWT must have 3 parts separated by dots');
  return {
    header:  JSON.parse(base64urlDecode(parts[0])),
    payload: JSON.parse(base64urlDecode(parts[1])),
  };
}

type Status = 'pass' | 'fail' | 'warn' | 'info';

interface ClaimResult {
  claim: string;
  value: unknown;
  status: Status;
  message: string;
}

function validate(payload: Record<string, unknown>, opts: {
  expectedIssuer: string;
  expectedAudience: string;
  requiredClaims: string;
}): ClaimResult[] {
  const results: ClaimResult[] = [];
  const now = Math.floor(Date.now() / 1000);

  // exp
  if ('exp' in payload) {
    const exp = payload.exp as number;
    const secsLeft = exp - now;
    const absLeft = Math.abs(secsLeft);
    const time = absLeft < 60 ? `${absLeft}s` : absLeft < 3600 ? `${Math.floor(absLeft/60)}m` : absLeft < 86400 ? `${Math.floor(absLeft/3600)}h` : `${Math.floor(absLeft/86400)}d`;
    results.push({ claim: 'exp', value: new Date(exp * 1000).toLocaleString(), status: secsLeft > 0 ? (secsLeft < 300 ? 'warn' : 'pass') : 'fail',
      message: secsLeft > 0 ? `Expires in ${time}` : `Expired ${time} ago` });
  } else {
    results.push({ claim: 'exp', value: '(not set)', status: 'warn', message: 'No expiry — token never expires' });
  }

  // nbf
  if ('nbf' in payload) {
    const nbf = payload.nbf as number;
    const valid = now >= nbf;
    results.push({ claim: 'nbf', value: new Date(nbf * 1000).toLocaleString(), status: valid ? 'pass' : 'fail',
      message: valid ? 'Token is now valid (nbf passed)' : `Not valid until ${new Date(nbf * 1000).toLocaleString()}` });
  }

  // iat
  if ('iat' in payload) {
    const iat = payload.iat as number;
    const age = now - iat;
    const ageStr = age < 60 ? `${age}s` : age < 3600 ? `${Math.floor(age/60)}m` : age < 86400 ? `${Math.floor(age/3600)}h` : `${Math.floor(age/86400)}d`;
    results.push({ claim: 'iat', value: new Date(iat * 1000).toLocaleString(), status: 'info', message: `Issued ${ageStr} ago` });
  }

  // iss
  if (opts.expectedIssuer.trim()) {
    const iss = payload.iss as string | undefined;
    const match = iss === opts.expectedIssuer.trim();
    results.push({ claim: 'iss', value: iss ?? '(not set)', status: match ? 'pass' : 'fail',
      message: match ? 'Issuer matches' : `Expected "${opts.expectedIssuer.trim()}", got "${iss ?? 'undefined'}"` });
  } else if ('iss' in payload) {
    results.push({ claim: 'iss', value: payload.iss, status: 'info', message: 'Issuer present (not validated)' });
  }

  // aud
  if (opts.expectedAudience.trim()) {
    const aud = payload.aud;
    const audiences = Array.isArray(aud) ? aud : [aud];
    const match = audiences.includes(opts.expectedAudience.trim());
    results.push({ claim: 'aud', value: Array.isArray(aud) ? aud.join(', ') : String(aud ?? '(not set)'), status: match ? 'pass' : 'fail',
      message: match ? 'Audience matches' : `Expected "${opts.expectedAudience.trim()}"` });
  } else if ('aud' in payload) {
    const aud = payload.aud;
    results.push({ claim: 'aud', value: Array.isArray(aud) ? aud.join(', ') : String(aud), status: 'info', message: 'Audience present (not validated)' });
  }

  // sub
  if ('sub' in payload) {
    results.push({ claim: 'sub', value: payload.sub, status: 'info', message: 'Subject present' });
  }

  // required claims
  if (opts.requiredClaims.trim()) {
    const required = opts.requiredClaims.split(',').map(s => s.trim()).filter(Boolean);
    for (const claim of required) {
      const present = claim in payload;
      results.push({ claim, value: present ? payload[claim] : '(missing)', status: present ? 'pass' : 'fail',
        message: present ? `Claim "${claim}" is present` : `Required claim "${claim}" is missing` });
    }
  }

  return results;
}

const StatusIcon = ({ status }: { status: Status }) => {
  if (status === 'pass') return <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />;
  if (status === 'fail') return <XCircle size={15} className="text-red-400 flex-shrink-0" />;
  if (status === 'warn') return <AlertCircle size={15} className="text-amber-400 flex-shrink-0" />;
  return <Clock size={15} className="text-blue-400 flex-shrink-0" />;
};

const STATUS_BG: Record<Status, string> = {
  pass: 'rgba(16,185,129,0.08)',
  fail: 'rgba(239,68,68,0.08)',
  warn: 'rgba(245,158,11,0.08)',
  info: 'rgba(59,130,246,0.08)',
};
const STATUS_BORDER: Record<Status, string> = {
  pass: 'rgba(16,185,129,0.2)',
  fail: 'rgba(239,68,68,0.2)',
  warn: 'rgba(245,158,11,0.2)',
  info: 'rgba(59,130,246,0.2)',
};

const SAMPLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Sfl6KwAeZlD7Qs5BL9DIQIT4mGxbIQqLCRGE8OJ4J0';

export default function JwtClaimsValidatorTool() {
  const [token, setToken] = useState(SAMPLE);
  const [issuer, setIssuer] = useState('');
  const [audience, setAudience] = useState('');
  const [required, setRequired] = useState('');

  let header: Record<string, unknown> | null = null;
  let payload: Record<string, unknown> | null = null;
  let results: ClaimResult[] = [];
  let parseError = '';

  try {
    const parsed = parseJwt(token);
    header = parsed.header;
    payload = parsed.payload;
    results = validate(payload, { expectedIssuer: issuer, expectedAudience: audience, requiredClaims: required });
  } catch (e: any) { parseError = e.message; }

  const pass = results.filter(r => r.status === 'pass').length;
  const fail = results.filter(r => r.status === 'fail').length;
  const warn = results.filter(r => r.status === 'warn').length;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">JWT Claims Validator</h1>
      <p className="text-gray-500 text-sm mb-5">Validate JWT expiry, issuer, audience and required claims.</p>

      {/* Token input */}
      <div className="mb-4">
        <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">JWT Token</label>
        <textarea value={token} onChange={e => setToken(e.target.value)} rows={4}
          className="w-full rounded-xl px-3.5 py-3 text-xs font-mono text-indigo-300 focus:outline-none resize-none transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.25)' }}
          placeholder="Paste JWT token here…"
        />
        {parseError && <p className="text-red-400 text-xs mt-1">{parseError}</p>}
      </div>

      {/* Validation options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Expected Issuer (iss)', value: issuer, set: setIssuer, ph: 'https://auth.example.com' },
          { label: 'Expected Audience (aud)', value: audience, set: setAudience, ph: 'myapp' },
          { label: 'Required Claims (comma-sep)', value: required, set: setRequired, ph: 'sub, name, email' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">{f.label}</label>
            <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph}
              className="w-full rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-700 focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            />
          </div>
        ))}
      </div>

      {header && payload && (
        <>
          {/* Summary bar */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-1.5 text-xs"><CheckCircle size={13} className="text-emerald-400" /><span className="text-emerald-400 font-bold">{pass} pass</span></div>
            {fail > 0 && <div className="flex items-center gap-1.5 text-xs"><XCircle size={13} className="text-red-400" /><span className="text-red-400 font-bold">{fail} fail</span></div>}
            {warn > 0 && <div className="flex items-center gap-1.5 text-xs"><AlertCircle size={13} className="text-amber-400" /><span className="text-amber-400 font-bold">{warn} warn</span></div>}
            <div className="ml-auto text-[10px] text-gray-600 font-mono">alg: {header.alg as string} · typ: {header.typ as string}</div>
          </div>

          {/* Claims */}
          <div className="space-y-2 mb-5">
            {results.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border transition-colors"
                style={{ background: STATUS_BG[r.status], borderColor: STATUS_BORDER[r.status] }}>
                <StatusIcon status={r.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-300 font-mono">{r.claim}</span>
                    <span className="text-[11px] text-gray-500 truncate">{r.message}</span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-500 truncate block">{String(r.value)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Full payload */}
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Full Payload</span>
            </div>
            <pre className="px-4 py-3 text-xs font-mono text-gray-400 overflow-auto max-h-48">{JSON.stringify(payload, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
}
