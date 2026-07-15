import React, { useState, useRef } from 'react';
import CopyButton from '../../components/CopyButton';

const ImageBase64Tool: React.FC = () => {
  const [dataUrl, setDataUrl] = useState('');
  const [b64Input, setB64Input] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [info, setInfo] = useState<{ name: string; size: string; type: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setInfo({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, type: file.type });
    const reader = new FileReader();
    reader.onload = e => setDataUrl((e.target?.result as string) ?? '');
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const decodeB64 = () => {
    try {
      const src = b64Input.startsWith('data:') ? b64Input : `data:image/png;base64,${b64Input}`;
      setImagePreview(src);
    } catch { setImagePreview(''); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Image ↔ Base64</h1>
      <p className="text-gray-400 text-sm mb-5">Convert images to Base64 data URIs and vice versa.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image → Base64 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Image → Base64</h2>
          <div
            onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-700 hover:border-indigo-600 rounded-xl p-8 text-center cursor-pointer transition-colors mb-3">
            <p className="text-gray-400 text-sm">Drop image here or click to browse</p>
            <p className="text-gray-600 text-xs mt-1">PNG, JPG, GIF, SVG, WebP</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {info && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400 mb-3 space-y-0.5">
              <p>📁 {info.name}</p>
              <p>📐 {info.size} · {info.type}</p>
            </div>
          )}

          {dataUrl && (
            <>
              <img src={dataUrl} alt="Preview" className="w-full max-h-48 object-contain bg-gray-900 rounded-lg mb-3" />
              <div className="flex gap-2">
                <CopyButton text={dataUrl} />
                <CopyButton text={dataUrl.split(',')[1] ?? ''} />
              </div>
              <textarea value={dataUrl} readOnly rows={5}
                className="mt-2 w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs font-mono text-gray-400 resize-none" />
            </>
          )}
        </div>

        {/* Base64 → Image */}
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Base64 → Image</h2>
          <textarea value={b64Input} onChange={e => setB64Input(e.target.value)} rows={8}
            placeholder="Paste Base64 string or data URI here…"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-xs font-mono text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none mb-3 placeholder-gray-700" />
          <button onClick={decodeB64} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors mb-3">Decode & Preview</button>
          {imagePreview && (
            <img src={imagePreview} alt="Decoded" className="w-full max-h-64 object-contain bg-gray-900 rounded-lg border border-gray-800" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageBase64Tool;
