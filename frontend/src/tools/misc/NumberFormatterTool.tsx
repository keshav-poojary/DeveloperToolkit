import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const LOCALES = ['en-US','en-GB','de-DE','fr-FR','ja-JP','zh-CN','ar-SA','hi-IN','pt-BR'];
const CURRENCIES = ['USD','EUR','GBP','JPY','CAD','AUD','CHF','CNY','INR','BRL'];
const STYLES = ['decimal','percent','currency','unit'] as const;
const UNITS = ['kilometer','meter','centimeter','kilogram','gram','pound','liter','milliliter','celsius','fahrenheit','degree'];

const NumberFormatterTool: React.FC = () => {
  const [num, setNum] = useState('1234567.89');
  const [locale, setLocale] = useState('en-US');
  const [style, setStyle] = useState<typeof STYLES[number]>('decimal');
  const [currency, setCurrency] = useState('USD');
  const [unit, setUnit] = useState('kilometer');
  const [minFrac, setMinFrac] = useState(2);
  const [maxFrac, setMaxFrac] = useState(2);

  // Derived values — never call setState during render
  let formatted = '';
  let error = '';
  try {
    const opts: Intl.NumberFormatOptions = { style, minimumFractionDigits: minFrac, maximumFractionDigits: maxFrac };
    if (style === 'currency') opts.currency = currency;
    if (style === 'unit') { opts.unit = unit; opts.unitDisplay = 'long'; }
    formatted = new Intl.NumberFormat(locale, opts).format(parseFloat(num));
  } catch (e: any) { error = e.message; }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Number Formatter</h1>
      <p className="text-gray-400 text-sm mb-5">Format numbers with locale, separators, currency and units using the Intl API.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Number</label>
          <input value={num} onChange={e => setNum(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Locale</label>
          <select value={locale} onChange={e => setLocale(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            {LOCALES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Style</label>
          <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
            {STYLES.map(s => (
              <button key={s} onClick={() => setStyle(s)}
                className={`flex-1 py-1.5 text-xs rounded font-medium capitalize transition-colors ${style===s?'bg-indigo-600 text-white':'text-gray-400 hover:text-gray-200'}`}>{s}</button>
            ))}
          </div>
        </div>
        {style === 'currency' && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none">
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        {style === 'unit' && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Unit</label>
            <select value={unit} onChange={e => setUnit(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Fraction Digits</label>
          <div className="flex gap-2 items-center">
            <input type="number" min={0} max={20} value={minFrac} onChange={e => setMinFrac(Number(e.target.value))}
              className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-200 text-center focus:outline-none" />
            <span className="text-gray-500 text-sm">–</span>
            <input type="number" min={0} max={20} value={maxFrac} onChange={e => setMaxFrac(Number(e.target.value))}
              className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-200 text-center focus:outline-none" />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      {!error && (
        <div className="bg-gray-900 border border-emerald-900/40 rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-emerald-300">{formatted}</p>
          <div className="flex justify-center mt-3">
            <CopyButton text={formatted} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberFormatterTool;
