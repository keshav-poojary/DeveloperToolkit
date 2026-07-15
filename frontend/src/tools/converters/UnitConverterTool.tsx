import { useState, useMemo } from 'react';
import CopyButton from '../../components/CopyButton';

// ─── Unit definitions ────────────────────────────────────────────────────────

interface Unit {
  id: string;
  label: string;
  toBase: (v: number) => number;   // convert value → base unit
  fromBase: (v: number) => number; // convert base unit → value
}

interface Category {
  id: string;
  label: string;
  icon: string;
  baseUnit: string;
  units: Unit[];
}

const CATEGORIES: Category[] = [
  {
    id: 'length',
    label: 'Length',
    icon: '📏',
    baseUnit: 'meter',
    units: [
      { id: 'km',    label: 'Kilometer (km)',     toBase: v => v * 1000,          fromBase: v => v / 1000 },
      { id: 'm',     label: 'Meter (m)',           toBase: v => v,                 fromBase: v => v },
      { id: 'cm',    label: 'Centimeter (cm)',     toBase: v => v / 100,           fromBase: v => v * 100 },
      { id: 'mm',    label: 'Millimeter (mm)',     toBase: v => v / 1000,          fromBase: v => v * 1000 },
      { id: 'um',    label: 'Micrometer (μm)',     toBase: v => v / 1e6,           fromBase: v => v * 1e6 },
      { id: 'nm',    label: 'Nanometer (nm)',      toBase: v => v / 1e9,           fromBase: v => v * 1e9 },
      { id: 'mi',    label: 'Mile (mi)',           toBase: v => v * 1609.344,      fromBase: v => v / 1609.344 },
      { id: 'yd',    label: 'Yard (yd)',           toBase: v => v * 0.9144,        fromBase: v => v / 0.9144 },
      { id: 'ft',    label: 'Foot (ft)',           toBase: v => v * 0.3048,        fromBase: v => v / 0.3048 },
      { id: 'in',    label: 'Inch (in)',           toBase: v => v * 0.0254,        fromBase: v => v / 0.0254 },
      { id: 'nmi',   label: 'Nautical Mile',       toBase: v => v * 1852,          fromBase: v => v / 1852 },
    ],
  },
  {
    id: 'weight',
    label: 'Weight / Mass',
    icon: '⚖️',
    baseUnit: 'kilogram',
    units: [
      { id: 't',     label: 'Tonne (t)',           toBase: v => v * 1000,          fromBase: v => v / 1000 },
      { id: 'kg',    label: 'Kilogram (kg)',        toBase: v => v,                 fromBase: v => v },
      { id: 'g',     label: 'Gram (g)',             toBase: v => v / 1000,          fromBase: v => v * 1000 },
      { id: 'mg',    label: 'Milligram (mg)',       toBase: v => v / 1e6,           fromBase: v => v * 1e6 },
      { id: 'ug',    label: 'Microgram (μg)',       toBase: v => v / 1e9,           fromBase: v => v * 1e9 },
      { id: 'lb',    label: 'Pound (lb)',           toBase: v => v * 0.453592,      fromBase: v => v / 0.453592 },
      { id: 'oz',    label: 'Ounce (oz)',           toBase: v => v * 0.0283495,     fromBase: v => v / 0.0283495 },
      { id: 'st',    label: 'Stone (st)',           toBase: v => v * 6.35029,       fromBase: v => v / 6.35029 },
      { id: 'lton',  label: 'Long Ton (UK)',        toBase: v => v * 1016.05,       fromBase: v => v / 1016.05 },
      { id: 'ston',  label: 'Short Ton (US)',       toBase: v => v * 907.185,       fromBase: v => v / 907.185 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    icon: '🌡️',
    baseUnit: 'celsius',
    units: [
      { id: 'c',  label: 'Celsius (°C)',    toBase: v => v,                    fromBase: v => v },
      { id: 'f',  label: 'Fahrenheit (°F)', toBase: v => (v - 32) * 5/9,      fromBase: v => v * 9/5 + 32 },
      { id: 'k',  label: 'Kelvin (K)',      toBase: v => v - 273.15,           fromBase: v => v + 273.15 },
      { id: 'r',  label: 'Rankine (°R)',    toBase: v => (v - 491.67) * 5/9,  fromBase: v => (v + 273.15) * 9/5 },
    ],
  },
  {
    id: 'area',
    label: 'Area',
    icon: '🟦',
    baseUnit: 'square meter',
    units: [
      { id: 'km2',  label: 'Square Kilometer (km²)',  toBase: v => v * 1e6,         fromBase: v => v / 1e6 },
      { id: 'm2',   label: 'Square Meter (m²)',        toBase: v => v,               fromBase: v => v },
      { id: 'cm2',  label: 'Square Centimeter (cm²)', toBase: v => v / 10000,       fromBase: v => v * 10000 },
      { id: 'mm2',  label: 'Square Millimeter (mm²)', toBase: v => v / 1e6,         fromBase: v => v * 1e6 },
      { id: 'ha',   label: 'Hectare (ha)',             toBase: v => v * 10000,       fromBase: v => v / 10000 },
      { id: 'ac',   label: 'Acre (ac)',                toBase: v => v * 4046.86,     fromBase: v => v / 4046.86 },
      { id: 'mi2',  label: 'Square Mile (mi²)',        toBase: v => v * 2.59e6,      fromBase: v => v / 2.59e6 },
      { id: 'ft2',  label: 'Square Foot (ft²)',        toBase: v => v * 0.092903,    fromBase: v => v / 0.092903 },
      { id: 'in2',  label: 'Square Inch (in²)',        toBase: v => v * 0.00064516,  fromBase: v => v / 0.00064516 },
    ],
  },
  {
    id: 'volume',
    label: 'Volume',
    icon: '🧊',
    baseUnit: 'liter',
    units: [
      { id: 'l',     label: 'Liter (L)',             toBase: v => v,              fromBase: v => v },
      { id: 'ml',    label: 'Milliliter (mL)',        toBase: v => v / 1000,       fromBase: v => v * 1000 },
      { id: 'm3',    label: 'Cubic Meter (m³)',       toBase: v => v * 1000,       fromBase: v => v / 1000 },
      { id: 'cm3',   label: 'Cubic Centimeter (cm³)',toBase: v => v / 1000,       fromBase: v => v * 1000 },
      { id: 'gal',   label: 'US Gallon (gal)',        toBase: v => v * 3.78541,    fromBase: v => v / 3.78541 },
      { id: 'qt',    label: 'US Quart (qt)',          toBase: v => v * 0.946353,   fromBase: v => v / 0.946353 },
      { id: 'pt',    label: 'US Pint (pt)',           toBase: v => v * 0.473176,   fromBase: v => v / 0.473176 },
      { id: 'cup',   label: 'US Cup',                 toBase: v => v * 0.236588,   fromBase: v => v / 0.236588 },
      { id: 'floz',  label: 'US Fluid Oz (fl oz)',    toBase: v => v * 0.0295735,  fromBase: v => v / 0.0295735 },
      { id: 'ukgal', label: 'UK Gallon',              toBase: v => v * 4.54609,    fromBase: v => v / 4.54609 },
    ],
  },
  {
    id: 'speed',
    label: 'Speed',
    icon: '💨',
    baseUnit: 'm/s',
    units: [
      { id: 'ms',   label: 'Meter/second (m/s)',    toBase: v => v,               fromBase: v => v },
      { id: 'kph',  label: 'Kilometer/hour (km/h)', toBase: v => v / 3.6,         fromBase: v => v * 3.6 },
      { id: 'mph',  label: 'Mile/hour (mph)',        toBase: v => v * 0.44704,     fromBase: v => v / 0.44704 },
      { id: 'knot', label: 'Knot (kn)',              toBase: v => v * 0.514444,    fromBase: v => v / 0.514444 },
      { id: 'fps',  label: 'Feet/second (fps)',      toBase: v => v * 0.3048,      fromBase: v => v / 0.3048 },
      { id: 'mach', label: 'Mach (at sea level)',    toBase: v => v * 340.29,      fromBase: v => v / 340.29 },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    icon: '⏱️',
    baseUnit: 'second',
    units: [
      { id: 'ns',  label: 'Nanosecond (ns)',   toBase: v => v / 1e9,         fromBase: v => v * 1e9 },
      { id: 'us',  label: 'Microsecond (μs)',  toBase: v => v / 1e6,         fromBase: v => v * 1e6 },
      { id: 'ms',  label: 'Millisecond (ms)',  toBase: v => v / 1000,        fromBase: v => v * 1000 },
      { id: 's',   label: 'Second (s)',        toBase: v => v,               fromBase: v => v },
      { id: 'min', label: 'Minute (min)',       toBase: v => v * 60,          fromBase: v => v / 60 },
      { id: 'hr',  label: 'Hour (hr)',          toBase: v => v * 3600,        fromBase: v => v / 3600 },
      { id: 'day', label: 'Day (d)',            toBase: v => v * 86400,       fromBase: v => v / 86400 },
      { id: 'wk',  label: 'Week (wk)',          toBase: v => v * 604800,      fromBase: v => v / 604800 },
      { id: 'mo',  label: 'Month (avg)',        toBase: v => v * 2629800,     fromBase: v => v / 2629800 },
      { id: 'yr',  label: 'Year (avg)',         toBase: v => v * 31557600,    fromBase: v => v / 31557600 },
    ],
  },
  {
    id: 'data',
    label: 'Data Storage',
    icon: '💾',
    baseUnit: 'byte',
    units: [
      { id: 'b',   label: 'Bit (b)',             toBase: v => v / 8,          fromBase: v => v * 8 },
      { id: 'B',   label: 'Byte (B)',             toBase: v => v,              fromBase: v => v },
      { id: 'KB',  label: 'Kilobyte (KB)',        toBase: v => v * 1000,       fromBase: v => v / 1000 },
      { id: 'MB',  label: 'Megabyte (MB)',        toBase: v => v * 1e6,        fromBase: v => v / 1e6 },
      { id: 'GB',  label: 'Gigabyte (GB)',        toBase: v => v * 1e9,        fromBase: v => v / 1e9 },
      { id: 'TB',  label: 'Terabyte (TB)',        toBase: v => v * 1e12,       fromBase: v => v / 1e12 },
      { id: 'PB',  label: 'Petabyte (PB)',        toBase: v => v * 1e15,       fromBase: v => v / 1e15 },
      { id: 'KiB', label: 'Kibibyte (KiB)',       toBase: v => v * 1024,       fromBase: v => v / 1024 },
      { id: 'MiB', label: 'Mebibyte (MiB)',       toBase: v => v * 1048576,    fromBase: v => v / 1048576 },
      { id: 'GiB', label: 'Gibibyte (GiB)',       toBase: v => v * 1073741824, fromBase: v => v / 1073741824 },
      { id: 'TiB', label: 'Tebibyte (TiB)',       toBase: v => v * 1099511627776, fromBase: v => v / 1099511627776 },
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    icon: '⚡',
    baseUnit: 'joule',
    units: [
      { id: 'j',    label: 'Joule (J)',             toBase: v => v,             fromBase: v => v },
      { id: 'kj',   label: 'Kilojoule (kJ)',        toBase: v => v * 1000,      fromBase: v => v / 1000 },
      { id: 'mj',   label: 'Megajoule (MJ)',        toBase: v => v * 1e6,       fromBase: v => v / 1e6 },
      { id: 'cal',  label: 'Calorie (cal)',          toBase: v => v * 4.184,     fromBase: v => v / 4.184 },
      { id: 'kcal', label: 'Kilocalorie (kcal)',     toBase: v => v * 4184,      fromBase: v => v / 4184 },
      { id: 'wh',   label: 'Watt-hour (Wh)',        toBase: v => v * 3600,      fromBase: v => v / 3600 },
      { id: 'kwh',  label: 'Kilowatt-hour (kWh)',   toBase: v => v * 3.6e6,     fromBase: v => v / 3.6e6 },
      { id: 'btu',  label: 'BTU',                   toBase: v => v * 1055.06,   fromBase: v => v / 1055.06 },
      { id: 'ev',   label: 'Electronvolt (eV)',      toBase: v => v * 1.602e-19, fromBase: v => v / 1.602e-19 },
    ],
  },
  {
    id: 'pressure',
    label: 'Pressure',
    icon: '🔵',
    baseUnit: 'pascal',
    units: [
      { id: 'pa',   label: 'Pascal (Pa)',           toBase: v => v,             fromBase: v => v },
      { id: 'kpa',  label: 'Kilopascal (kPa)',      toBase: v => v * 1000,      fromBase: v => v / 1000 },
      { id: 'mpa',  label: 'Megapascal (MPa)',      toBase: v => v * 1e6,       fromBase: v => v / 1e6 },
      { id: 'bar',  label: 'Bar',                   toBase: v => v * 100000,    fromBase: v => v / 100000 },
      { id: 'mbar', label: 'Millibar (mbar)',       toBase: v => v * 100,       fromBase: v => v / 100 },
      { id: 'atm',  label: 'Atmosphere (atm)',      toBase: v => v * 101325,    fromBase: v => v / 101325 },
      { id: 'torr', label: 'Torr (mmHg)',           toBase: v => v * 133.322,   fromBase: v => v / 133.322 },
      { id: 'psi',  label: 'PSI (lb/in²)',          toBase: v => v * 6894.76,   fromBase: v => v / 6894.76 },
    ],
  },
  {
    id: 'angle',
    label: 'Angle',
    icon: '📐',
    baseUnit: 'degree',
    units: [
      { id: 'deg',  label: 'Degree (°)',            toBase: v => v,                     fromBase: v => v },
      { id: 'rad',  label: 'Radian (rad)',           toBase: v => v * 180 / Math.PI,    fromBase: v => v * Math.PI / 180 },
      { id: 'grad', label: 'Gradian (grad)',         toBase: v => v * 0.9,              fromBase: v => v / 0.9 },
      { id: 'turn', label: 'Turn (revolution)',      toBase: v => v * 360,              fromBase: v => v / 360 },
      { id: 'arcm', label: 'Arcminute (\')',         toBase: v => v / 60,               fromBase: v => v * 60 },
      { id: 'arcs', label: 'Arcsecond (")',          toBase: v => v / 3600,             fromBase: v => v * 3600 },
    ],
  },
];

// ─── Format helpers ───────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (!isFinite(n)) return 'N/A';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e15 || (abs > 0 && abs < 1e-10)) return n.toExponential(6);
  if (abs >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 6 });
  return parseFloat(n.toPrecision(10)).toString();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UnitConverterTool() {
  const [catId, setCatId] = useState('length');
  const [fromId, setFromId] = useState('m');
  const [toId, setToId] = useState('ft');
  const [inputVal, setInputVal] = useState('1');

  const cat = CATEGORIES.find(c => c.id === catId)!;

  // When category changes, reset to first two units
  const handleCatChange = (id: string) => {
    setCatId(id);
    const newCat = CATEGORIES.find(c => c.id === id)!;
    setFromId(newCat.units[0].id);
    setToId(newCat.units[1]?.id ?? newCat.units[0].id);
    setInputVal('1');
  };

  const fromUnit = cat.units.find(u => u.id === fromId) ?? cat.units[0];
  const toUnit   = cat.units.find(u => u.id === toId)   ?? cat.units[1];

  const { result, allResults } = useMemo(() => {
    const n = parseFloat(inputVal);
    if (isNaN(n)) return { result: '', allResults: [] };
    const base = fromUnit.toBase(n);
    const r = toUnit.fromBase(base);
    const all = cat.units.map(u => ({ unit: u, value: u.fromBase(base) }));
    return { result: fmt(r), allResults: all };
  }, [inputVal, fromUnit, toUnit, cat]);

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
    // Update input to converted value so the display stays the same
    const n = parseFloat(inputVal);
    if (!isNaN(n) && result) setInputVal(result.replace(/,/g, ''));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Unit Converter</h1>
      <p className="text-gray-500 text-sm mb-5">Convert between units across length, weight, temperature, volume, and more.</p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => handleCatChange(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              catId === c.id
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-gray-500 border border-white/6 hover:text-gray-300 hover:border-white/15'
            }`}>
            <span>{c.icon}</span>{c.label}
          </button>
        ))}
      </div>

      {/* Converter */}
      <div className="rounded-2xl border border-white/8 p-5 mb-5" style={{ background: 'rgba(255,255,255,0.025)' }}>
        <div className="flex items-end gap-3">
          {/* From */}
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">From</label>
            <select value={fromId} onChange={e => setFromId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none mb-2 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {cat.units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
            <input
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-xl font-mono text-indigo-300 focus:outline-none transition-all"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}
              placeholder="Enter value…"
            />
          </div>

          {/* Swap */}
          <button onClick={swap}
            className="mb-0.5 p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-all flex-shrink-0 text-lg"
            title="Swap">
            ⇄
          </button>

          {/* To */}
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">To</label>
            <select value={toId} onChange={e => setToId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none mb-2 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {cat.units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
            <div className="relative">
              <div className="w-full rounded-lg px-3 py-2.5 text-xl font-mono text-emerald-300 transition-all"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', minHeight: '48px' }}>
                {result || <span className="text-gray-700">—</span>}
              </div>
              {result && <div className="absolute right-2 top-1/2 -translate-y-1/2"><CopyButton text={result} /></div>}
            </div>
          </div>
        </div>

        {/* Human-readable */}
        {result && inputVal && (
          <p className="mt-3 text-center text-sm text-gray-500">
            <span className="text-gray-300 font-semibold">{parseFloat(inputVal).toLocaleString()} {fromUnit.label.split(' ')[0]}</span>
            {' = '}
            <span className="text-emerald-400 font-semibold">{result} {toUnit.label.split(' ')[0]}</span>
          </p>
        )}
      </div>

      {/* All conversions */}
      {allResults.length > 0 && parseFloat(inputVal) !== 0 && !isNaN(parseFloat(inputVal)) && (
        <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)' }}>
          <div className="px-4 py-2.5 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">All {cat.label} Conversions</span>
          </div>
          <div className="divide-y divide-white/5">
            {allResults.map(({ unit, value }) => (
              <div key={unit.id}
                className={`flex items-center justify-between px-4 py-2.5 transition-colors ${unit.id === fromId ? 'bg-indigo-500/8' : unit.id === toId ? 'bg-emerald-500/8' : 'hover:bg-white/3'}`}>
                <span className={`text-xs ${unit.id === fromId ? 'text-indigo-400' : unit.id === toId ? 'text-emerald-400' : 'text-gray-500'}`}>{unit.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono font-semibold ${unit.id === fromId ? 'text-indigo-300' : unit.id === toId ? 'text-emerald-300' : 'text-gray-300'}`}>
                    {fmt(value)}
                  </span>
                  <CopyButton text={fmt(value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
