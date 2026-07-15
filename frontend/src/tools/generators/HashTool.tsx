import React, { useState } from 'react';
import CopyButton from '../../components/CopyButton';

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
type Algo = typeof ALGOS[number];

const hashText = async (text: string, algo: Algo): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const buffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Simple MD5 implementation
const md5 = (str: string): string => {
  const rotateLeft = (v: number, n: number) => (v << n) | (v >>> (32 - n));
  const addUnsigned = (a: number, b: number) => {
    const x8 = (a & 0x80000000); const y8 = (b & 0x80000000);
    const x4 = (a & 0x40000000); const y4 = (b & 0x40000000);
    const res = (a & 0x3FFFFFFF) + (b & 0x3FFFFFFF);
    if (x4 & y4) return res ^ 0x80000000 ^ x8 ^ y8;
    if (x4 | y4) { if (res & 0x40000000) return res ^ 0xC0000000 ^ x8 ^ y8; else return res ^ 0x40000000 ^ x8 ^ y8; }
    return res ^ x8 ^ y8;
  };
  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  const I = (x: number, y: number, z: number) => y ^ (x | ~z);
  const FF = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, F(b, c, d)), addUnsigned(x, ac)), s), b);
  const GG = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, G(b, c, d)), addUnsigned(x, ac)), s), b);
  const HH = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, H(b, c, d)), addUnsigned(x, ac)), s), b);
  const II = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, I(b, c, d)), addUnsigned(x, ac)), s), b);

  const wordToHex = (v: number) => {
    let s = '';
    for (let i = 0; i < 4; i++) { const byte = (v >>> (i * 8)) & 0xFF; s += ('0' + byte.toString(16)).slice(-2); }
    return s;
  };

  const utf8 = unescape(encodeURIComponent(str));
  const x: number[] = [];
  for (let i = 0; i < utf8.length * 8; i += 8) x[i >> 5] = (x[i >> 5] ?? 0) | ((utf8.charCodeAt(i / 8) & 0xFF) << (i % 32));
  const len = utf8.length * 8;
  x[len >> 5] = (x[len >> 5] ?? 0) | 0x80 << (len % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
  for (let k = 0; k < x.length; k += 16) {
    const [aa, bb, cc, dd] = [a, b, c, d];
    const w = (i: number) => x[k + i] ?? 0;
    a=FF(a,b,c,d,w(0),7,-680876936); d=FF(d,a,b,c,w(1),12,-389564586); c=FF(c,d,a,b,w(2),17,606105819); b=FF(b,c,d,a,w(3),22,-1044525330);
    a=FF(a,b,c,d,w(4),7,-176418897); d=FF(d,a,b,c,w(5),12,1200080426); c=FF(c,d,a,b,w(6),17,-1473231341); b=FF(b,c,d,a,w(7),22,-45705983);
    a=FF(a,b,c,d,w(8),7,1770035416); d=FF(d,a,b,c,w(9),12,-1958414417); c=FF(c,d,a,b,w(10),17,-42063); b=FF(b,c,d,a,w(11),22,-1990404162);
    a=FF(a,b,c,d,w(12),7,1804603682); d=FF(d,a,b,c,w(13),12,-40341101); c=FF(c,d,a,b,w(14),17,-1502002290); b=FF(b,c,d,a,w(15),22,1236535329);
    a=GG(a,b,c,d,w(1),5,-165796510); d=GG(d,a,b,c,w(6),9,-1069501632); c=GG(c,d,a,b,w(11),14,643717713); b=GG(b,c,d,a,w(0),20,-373897302);
    a=GG(a,b,c,d,w(5),5,-701558691); d=GG(d,a,b,c,w(10),9,38016083); c=GG(c,d,a,b,w(15),14,-660478335); b=GG(b,c,d,a,w(4),20,-405537848);
    a=GG(a,b,c,d,w(9),5,568446438); d=GG(d,a,b,c,w(14),9,-1019803690); c=GG(c,d,a,b,w(3),14,-187363961); b=GG(b,c,d,a,w(8),20,1163531501);
    a=GG(a,b,c,d,w(13),5,-1444681467); d=GG(d,a,b,c,w(2),9,-51403784); c=GG(c,d,a,b,w(7),14,1735328473); b=GG(b,c,d,a,w(12),20,-1926607734);
    a=HH(a,b,c,d,w(5),4,-378558); d=HH(d,a,b,c,w(8),11,-2022574463); c=HH(c,d,a,b,w(11),16,1839030562); b=HH(b,c,d,a,w(14),23,-35309556);
    a=HH(a,b,c,d,w(1),4,-1530992060); d=HH(d,a,b,c,w(4),11,1272893353); c=HH(c,d,a,b,w(7),16,-155497632); b=HH(b,c,d,a,w(10),23,-1094730640);
    a=HH(a,b,c,d,w(13),4,681279174); d=HH(d,a,b,c,w(0),11,-358537222); c=HH(c,d,a,b,w(3),16,-722521979); b=HH(b,c,d,a,w(6),23,76029189);
    a=HH(a,b,c,d,w(9),4,-640364487); d=HH(d,a,b,c,w(12),11,-421815835); c=HH(c,d,a,b,w(15),16,530742520); b=HH(b,c,d,a,w(2),23,-995338651);
    a=II(a,b,c,d,w(0),6,-198630844); d=II(d,a,b,c,w(7),10,1126891415); c=II(c,d,a,b,w(14),15,-1416354905); b=II(b,c,d,a,w(5),21,-57434055);
    a=II(a,b,c,d,w(12),6,1700485571); d=II(d,a,b,c,w(3),10,-1894986606); c=II(c,d,a,b,w(10),15,-1051523); b=II(b,c,d,a,w(1),21,-2054922799);
    a=II(a,b,c,d,w(8),6,1873313359); d=II(d,a,b,c,w(15),10,-30611744); c=II(c,d,a,b,w(6),15,-1560198380); b=II(b,c,d,a,w(13),21,1309151649);
    a=II(a,b,c,d,w(4),6,-145523070); d=II(d,a,b,c,w(11),10,-1120210379); c=II(c,d,a,b,w(2),15,718787259); b=II(b,c,d,a,w(9),21,-343485551);
    a=addUnsigned(a,aa); b=addUnsigned(b,bb); c=addUnsigned(c,cc); d=addUnsigned(d,dd);
  }
  return wordToHex(a)+wordToHex(b)+wordToHex(c)+wordToHex(d);
};

const HashTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});

  const compute = async () => {
    if (!input) return;
    const results: Record<string, string> = { 'MD5': md5(input) };
    for (const algo of ALGOS) {
      results[algo] = await hashText(input, algo);
    }
    setHashes(results);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Hash Generator</h1>
      <p className="text-gray-400 text-sm mb-5">Generate MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes.</p>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Input Text</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={4}
          placeholder="Enter text to hash…"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none placeholder-gray-700" />
      </div>

      <button onClick={compute} className="mb-5 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
        Generate Hashes
      </button>

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-indigo-400">{algo}</span>
                <CopyButton text={hash} />
              </div>
              <p className="font-mono text-xs text-gray-300 break-all">{hash}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HashTool;
