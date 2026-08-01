import React, { useState } from 'react';

function hexToRgb(hex: string) {
  const h = hex.replace('#', '').trim();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return { r, g, b };
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  const srgb = [r, g, b].map(v => v / 255).map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(fg: string, bg: string) {
  const a = hexToRgb(fg);
  const b = hexToRgb(bg);
  if (!a || !b) return 0;
  const L1 = luminance(a);
  const L2 = luminance(b);
  const bright = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (bright + 0.05) / (dark + 0.05);
}

const ContrastCheckerTool: React.FC = () => {
  const [fg, setFg] = useState('#ffffff');
  const [bg, setBg] = useState('#1f2937');

  const ratio = contrastRatio(fg, bg);
  const passesAA = ratio >= 4.5;
  const passesAALarge = ratio >= 3;
  const passesAAA = ratio >= 7;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Contrast Checker</h1>
      <p className="text-gray-400 text-sm mb-5">Check color contrast ratio and WCAG conformance.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-400">Foreground</label>
          <div className="flex items-center gap-2 mt-1">
            <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-12 h-10 p-0 border rounded" />
            <input value={fg} onChange={e => setFg(e.target.value)} className="flex-1 bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400">Background</label>
          <div className="flex items-center gap-2 mt-1">
            <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-12 h-10 p-0 border rounded" />
            <input value={bg} onChange={e => setBg(e.target.value)} className="flex-1 bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="rounded-lg overflow-hidden border border-gray-800">
          <div style={{ background: bg, color: fg }} className="p-6">
            <p className="font-medium">Sample text</p>
            <p className="text-sm text-gray-300 mt-1">The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="px-3 py-2 bg-gray-900 border border-gray-800 rounded">
          <div className="text-xs text-gray-400">Contrast Ratio</div>
          <div className="text-lg font-mono">{ratio.toFixed(2)}:1</div>
        </div>

        <div className={`px-3 py-2 rounded font-semibold ${passesAA ? 'bg-emerald-900 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-900'}`}>
          AA (normal): {passesAA ? 'Pass' : 'Fail'}
        </div>

        <div className={`px-3 py-2 rounded font-semibold ${passesAALarge ? 'bg-emerald-900 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-900'}`}>
          AA (large): {passesAALarge ? 'Pass' : 'Fail'}
        </div>

        <div className={`px-3 py-2 rounded font-semibold ${passesAAA ? 'bg-emerald-900 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-900'}`}>
          AAA (normal): {passesAAA ? 'Pass' : 'Fail'}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>Quick presets:</p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => { setFg('#000000'); setBg('#ffffff'); }} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded">Black on White</button>
          <button onClick={() => { setFg('#ffffff'); setBg('#000000'); }} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded">White on Black</button>
          <button onClick={() => { setFg('#1f2937'); setBg('#ffffff'); }} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded">Gray on White</button>
        </div>
      </div>
    </div>
  );
};

export default ContrastCheckerTool;
