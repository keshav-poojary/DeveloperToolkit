import React, { useMemo, useState } from 'react';
import IOPanel from '../../components/IOPanel';

const estimates = [
  { score: 0, label: 'Very weak', color: 'text-red-400', note: 'Too short or guessable.' },
  { score: 1, label: 'Weak', color: 'text-orange-300', note: 'Weak password. Add numbers and symbols.' },
  { score: 2, label: 'Fair', color: 'text-yellow-300', note: 'OK for low-risk use, but strengthen it.' },
  { score: 3, label: 'Strong', color: 'text-emerald-300', note: 'Good password for most accounts.' },
  { score: 4, label: 'Very strong', color: 'text-cyan-300', note: 'Excellent password strength.' },
];

const scorePassword = (password: string) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
};

const PasswordStrengthTool: React.FC = () => {
  const [password, setPassword] = useState('');
  const [hint, setHint] = useState('');

  const score = useMemo(() => scorePassword(password), [password]);
  const rating = estimates[score];
  const suggestions = [
    'Use at least 12 characters.',
    'Mix uppercase and lowercase letters.',
    'Add numbers and symbols.',
    'Avoid dictionary words and repeats.',
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Password Strength</h1>
      <p className="text-gray-400 text-sm mb-4">Check password strength and get practical improvement tips.</p>

      <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
        <div>
          <IOPanel
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            rows={6}
            mono={false}
          />

          <button
            onClick={() => setHint('Try a longer passphrase with letters, numbers, and symbols.')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-200 hover:bg-white/10 transition"
          >
            Generate tip
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-1">Strength</div>
            <div className="text-3xl font-black text-white">{rating.label}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <span
                  key={idx}
                  className={`block h-2.5 flex-1 rounded-full ${idx <= score ? 'bg-emerald-400' : 'bg-white/10'}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-300">{rating.note}</p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-2">Suggestions</div>
            <ul className="space-y-2 text-sm text-gray-300">
              {suggestions.slice(0, score + 1).map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-300">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {hint && (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-cyan-100">
              <span className="font-semibold">Hint:</span> {hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthTool;
