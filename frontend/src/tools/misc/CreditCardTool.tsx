import React, { useState } from 'react';

const luhn = (num: string): boolean => {
  const digits = num.replace(/\D/g, '').split('').reverse().map(Number);
  const sum = digits.reduce((acc, d, i) => {
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    return acc + d;
  }, 0);
  return sum % 10 === 0;
};

const detectType = (num: string): string => {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'American Express';
  if (/^6(?:011|5)/.test(n)) return 'Discover';
  if (/^35(2[89]|[3-8]\d)/.test(n)) return 'JCB';
  if (/^3(?:0[0-5]|[68])/.test(n)) return 'Diners Club';
  return 'Unknown';
};

const CreditCardTool: React.FC = () => {
  const [number, setNumber] = useState('');

  const clean = number.replace(/\D/g, '');
  const formatted = clean.match(/.{1,4}/g)?.join(' ') ?? '';
  const valid = clean.length >= 13 && luhn(clean);
  const type = clean.length >= 4 ? detectType(clean) : '';

  const cardIcons: Record<string, string> = {
    Visa: '💳', Mastercard: '💳', 'American Express': '💳', Discover: '💳', JCB: '💳',
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Credit Card Validator</h1>
      <p className="text-gray-400 text-sm mb-5">Validate card numbers using the Luhn algorithm. No real card data is stored.</p>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Card Number</label>
        <input
          value={formatted}
          onChange={e => setNumber(e.target.value.replace(/\D/g, '').slice(0, 19))}
          placeholder="4111 1111 1111 1111"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-xl font-mono tracking-widest text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center"
        />
      </div>

      {clean.length > 0 && (
        <div className="space-y-3">
          <div className={`flex items-center justify-center gap-3 p-4 rounded-xl border text-lg font-semibold ${
            clean.length < 13 ? 'bg-gray-900 border-gray-700 text-gray-400' :
            valid ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' : 'bg-red-950/40 border-red-900 text-red-400'
          }`}>
            {clean.length < 13 ? '⏳ Enter more digits…' : valid ? '✅ Valid Card Number' : '❌ Invalid Card Number'}
          </div>

          {type && (
            <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <span className="text-2xl">{cardIcons[type] ?? '💳'}</span>
              <div>
                <p className="text-xs text-gray-400">Card Type</p>
                <p className="font-semibold text-white">{type}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            <span className="text-xs text-gray-400 w-32">Luhn Checksum</span>
            <span className={`text-sm font-medium ${clean.length >= 13 ? (valid ? 'text-emerald-400' : 'text-red-400') : 'text-gray-500'}`}>
              {clean.length >= 13 ? (valid ? 'Passed ✓' : 'Failed ✗') : 'N/A'}
            </span>
          </div>

          <div className="text-xs text-gray-600 text-center">
            Test numbers: 4111 1111 1111 1111 (Visa) · 5500 0000 0000 0004 (MC)
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCardTool;
