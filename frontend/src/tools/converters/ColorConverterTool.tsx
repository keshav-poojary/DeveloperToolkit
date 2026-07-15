import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const hexToRgb = (h: string) => {
  const c = h.replace('#','');
  const f = c.length===3 ? c.split('').map(x=>x+x).join('') : c.padEnd(6,'0');
  return { r: parseInt(f.slice(0,2),16), g: parseInt(f.slice(2,4),16), b: parseInt(f.slice(4,6),16) };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  const rn=r/255, gn=g/255, bn=b/255;
  const max=Math.max(rn,gn,bn), min=Math.min(rn,gn,bn);
  let h=0, s=0; const l=(max+min)/2;
  if (max!==min) { const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
    h = max===rn ? ((gn-bn)/d+(gn<bn?6:0))/6 : max===gn ? ((bn-rn)/d+2)/6 : ((rn-gn)/d+4)/6; }
  return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
};

const hslToRgb = (h: number, s: number, l: number) => {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t<0) t+=1; if (t>1) t-=1;
    if (t<1/6) return p+(q-p)*6*t;
    if (t<1/2) return q;
    if (t<2/3) return p+(q-p)*(2/3-t)*6;
    return p;
  };
  const sn=s/100, ln=l/100;
  if (!sn) { const v = Math.round(ln*255); return {r:v,g:v,b:v}; }
  const q = ln<0.5 ? ln*(1+sn) : ln+sn-ln*sn;
  const p = 2*ln-q, hn=h/360;
  return { r: Math.round(hue2rgb(p,q,hn+1/3)*255), g: Math.round(hue2rgb(p,q,hn)*255), b: Math.round(hue2rgb(p,q,hn-1/3)*255) };
};

const rgbToHex = (r: number, g: number, b: number) => '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');

const ColorConverterTool: React.FC = () => {
  const [hex, setHex] = useState('#6366f1');
  const [r, setR] = useState(99); const [g, setG] = useState(102); const [b, setB] = useState(241);
  const [h, setH] = useState(239); const [sl, setSl] = useState(84); const [l, setL] = useState(67);

  const fromHex = (v: string) => {
    setHex(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      const rgb = hexToRgb(v); setR(rgb.r); setG(rgb.g); setB(rgb.b);
      const hsl = rgbToHsl(rgb.r,rgb.g,rgb.b); setH(hsl.h); setSl(hsl.s); setL(hsl.l);
    }
  };
  const fromRgb = (nr: number, ng: number, nb: number) => {
    setR(nr); setG(ng); setB(nb);
    setHex(rgbToHex(nr,ng,nb));
    const hsl = rgbToHsl(nr,ng,nb); setH(hsl.h); setSl(hsl.s); setL(hsl.l);
  };
  const fromHsl = (nh: number, ns: number, nl: number) => {
    setH(nh); setSl(ns); setL(nl);
    const rgb = hslToRgb(nh,ns,nl); setR(rgb.r); setG(rgb.g); setB(rgb.b);
    setHex(rgbToHex(rgb.r,rgb.g,rgb.b));
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5">
      <span className="text-xs font-semibold text-gray-400 w-16">{label}</span>
      <span className="font-mono text-sm text-gray-200">{value}</span>
      <CopyButton text={value} />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Color Converter</h1>
      <p className="text-gray-400 text-sm mb-5">Convert between HEX, RGB, and HSL color formats.</p>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-2xl border-2 border-gray-700 flex-shrink-0" style={{ background: hex }} />
        <div className="flex-1">
          {/* HEX */}
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">HEX</label>
            <input value={hex} onChange={e => fromHex(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          {/* RGB */}
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">RGB</label>
            <div className="grid grid-cols-3 gap-2">
              {[['R', r, (v: number) => fromRgb(v,g,b)], ['G', g, (v: number) => fromRgb(r,v,b)], ['B', b, (v: number) => fromRgb(r,g,v)]].map(([label, val, fn]) => (
                <div key={String(label)} className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">{String(label)}</span>
                  <input type="number" min={0} max={255} value={Number(val)}
                    onChange={e => (fn as Function)(Math.min(255, Math.max(0, Number(e.target.value))))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-6 pr-2 py-2 text-sm text-gray-100 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
              ))}
            </div>
          </div>
          {/* HSL */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">HSL</label>
            <div className="grid grid-cols-3 gap-2">
              {[['H', h, 360, (v: number) => fromHsl(v,sl,l)], ['S', sl, 100, (v: number) => fromHsl(h,v,l)], ['L', l, 100, (v: number) => fromHsl(h,sl,v)]].map(([label, val, max, fn]) => (
                <div key={String(label)} className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">{String(label)}</span>
                  <input type="number" min={0} max={Number(max)} value={Number(val)}
                    onChange={e => (fn as Function)(Math.min(Number(max), Math.max(0, Number(e.target.value))))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-6 pr-2 py-2 text-sm text-gray-100 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Row label="HEX" value={hex.toUpperCase()} />
        <Row label="RGB" value={`rgb(${r}, ${g}, ${b})`} />
        <Row label="HSL" value={`hsl(${h}, ${sl}%, ${l}%)`} />
        <Row label="RGBA" value={`rgba(${r}, ${g}, ${b}, 1)`} />
        <Row label="CSS Var" value={`--color: ${hex.toUpperCase()};`} />
      </div>
    </div>
  );
};

export default ColorConverterTool;
