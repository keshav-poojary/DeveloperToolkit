import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import CopyButton from '../../components/CopyButton';

const QrCodeTool: React.FC = () => {
  const [text, setText] = useState('https://example.com');
  const [size, setSize] = useState(300);
  const [fg, setFg] = useState('#ffffff');
  const [bg, setBg] = useState('#1e1e2e');
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const generate = async (t: string): Promise<void> => {
    setError('');
    if (!t.trim()) { setDataUrl(''); return; }
    try {
      const url = await QRCode.toDataURL(t, {
        width: size, margin: 2,
        color: { dark: fg, light: bg },
      });
      setDataUrl(url);
    } catch (e: any) { setError(e.message); }
  };

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => void generate(text), 300);
    return () => clearTimeout(debounce.current);
  }, [text, size, fg, bg]);

  const download = () => {
    const a = document.createElement('a');
    a.href = dataUrl; a.download = 'qrcode.png'; a.click();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">QR Code Generator</h1>
      <p className="text-gray-400 text-sm mb-5">Generate QR codes from text or URLs.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Text / URL</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Size: <span className="text-white">{size}px</span></label>
            <input type="range" min={100} max={600} step={50} value={size} onChange={e => setSize(Number(e.target.value))} className="w-full accent-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Foreground</label>
              <input type="color" value={fg} onChange={e => setFg(e.target.value)}
                className="w-full h-9 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Background</label>
              <input type="color" value={bg} onChange={e => setBg(e.target.value)}
                className="w-full h-9 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {error && <p className="text-sm text-red-400">{error}</p>}
          {dataUrl ? (
            <>
              <img src={dataUrl} alt="QR Code" className="rounded-xl border border-gray-700" style={{ width: Math.min(size, 280) }} />
              <div className="flex gap-2">
                <button onClick={download} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
                  ⬇ Download PNG
                </button>
                <CopyButton text={dataUrl} />
              </div>
            </>
          ) : (
            <div className="w-64 h-64 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-gray-600 text-sm">
              QR preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrCodeTool;
