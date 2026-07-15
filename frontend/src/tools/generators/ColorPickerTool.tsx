import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const hexToRgb = (h: string) => {
  const c = h.replace('#', '');
  const full = c.length === 3 ? c.split('').map(x => x + x).join('') : c;
  return { r: parseInt(full.slice(0,2),16), g: parseInt(full.slice(2,4),16), b: parseInt(full.slice(4,6),16) };
};

const ColorPickerTool: React.FC = () => {
  const [color, setColor] = useState('#6366f1');
  const { r, g, b } = hexToRgb(color);

  const values = [
    { label: 'HEX',  value: color.toUpperCase() },
    { label: 'RGB',  value: `rgb(${r}, ${g}, ${b})` },
    { label: 'CSS',  value: `color: ${color.toUpperCase()};` },
    { label: 'RGBA', value: `rgba(${r}, ${g}, ${b}, 1)` },
    { label: 'HSL',  value: (() => {
        const rn=r/255, gn=g/255, bn=b/255;
        const max=Math.max(rn,gn,bn), min=Math.min(rn,gn,bn);
        let h=0, s=0; const l=(max+min)/2;
        if (max!==min) { const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
          h=max===rn?((gn-bn)/d+(gn<bn?6:0))/6:max===gn?((bn-rn)/d+2)/6:((rn-gn)/d+4)/6; }
        return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
      })() },
    { label: 'Decimal', value: `${r * 65536 + g * 256 + b}` },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Color Picker</h1>
      <p className="text-gray-400 text-sm mb-5">Pick a color and get all its format values.</p>

      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="w-32 h-32 rounded-2xl border-4 border-gray-700 shadow-lg" style={{ background: color }} />
        <input type="color" value={color} onChange={e => setColor(e.target.value)}
          className="w-48 h-12 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer" />
        <input type="text" value={color} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setColor(e.target.value); }}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 text-center w-36 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {values.map(({ label, value }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 font-semibold">{label}</span>
              <CopyButton text={value} />
            </div>
            <p className="font-mono text-xs text-gray-300 break-all">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPickerTool;
