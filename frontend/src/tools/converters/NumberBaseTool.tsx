import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const NumberBaseTool: React.FC = () => {
  const [decimal, setDecimal] = useState('');
  const [binary, setBinary] = useState('');
  const [octal, setOctal] = useState('');
  const [hex, setHex] = useState('');
  const [error, setError] = useState('');

  const update = (value: number) => {
    setDecimal(value.toString(10));
    setBinary(value.toString(2));
    setOctal(value.toString(8));
    setHex(value.toString(16).toUpperCase());
    setError('');
  };

  const fromDec = (v: string) => { setDecimal(v); try { if (v) update(parseInt(v, 10)); else clear(); } catch { setError('Invalid decimal'); } };
  const fromBin = (v: string) => { setBinary(v); try { if (v) update(parseInt(v, 2)); else clear(); } catch { setError('Invalid binary'); } };
  const fromOct = (v: string) => { setOctal(v); try { if (v) update(parseInt(v, 8)); else clear(); } catch { setError('Invalid octal'); } };
  const fromHex = (v: string) => { setHex(v); try { if (v) update(parseInt(v, 16)); else clear(); } catch { setError('Invalid hex'); } };

  const clear = () => { setDecimal(''); setBinary(''); setOctal(''); setHex(''); setError(''); };

  const Field = ({ label, value, onChange, prefix = '' }: { label: string; value: string; onChange: (v: string) => void; prefix?: string }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-indigo-400">{label}</span>
        <CopyButton text={value} />
      </div>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-xs text-gray-500 font-mono">{prefix}</span>}
        <input value={value} onChange={e => onChange(e.target.value.toUpperCase())}
          className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Number Base Converter</h1>
      <p className="text-gray-400 text-sm mb-5">Convert numbers between Binary, Octal, Decimal and Hexadecimal.</p>
      {error && <p className="mb-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-1">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Decimal (Base 10)" value={decimal} onChange={fromDec} />
        <Field label="Binary (Base 2)" value={binary} onChange={fromBin} prefix="0b" />
        <Field label="Octal (Base 8)" value={octal} onChange={fromOct} prefix="0o" />
        <Field label="Hexadecimal (Base 16)" value={hex} onChange={fromHex} prefix="0x" />
      </div>

      {decimal && (
        <div className="mt-4 p-3 bg-gray-900 border border-gray-800 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Summary</p>
          <p className="font-mono text-xs text-gray-300">
            <span className="text-yellow-400">{decimal}</span>₁₀ = <span className="text-green-400">0b{binary}</span> = <span className="text-blue-400">0o{octal}</span> = <span className="text-pink-400">0x{hex}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default NumberBaseTool;
