import { useState } from 'react';
import CopyButton from '../../components/CopyButton';

function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function longToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function toBinary(n: number): string {
  return (n >>> 0).toString(2).padStart(32, '0').replace(/(.{8})/g, '$1.').slice(0, -1);
}

interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  subnetMask: string;
  wildcardMask: string;
  totalHosts: number;
  usableHosts: number;
  prefix: number;
  ipClass: string;
  binaryMask: string;
  binaryNetwork: string;
}

function calculate(cidr: string): SubnetInfo {
  const [ip, prefixStr] = cidr.trim().split('/');
  const prefix = parseInt(prefixStr, 10);
  if (!ip || isNaN(prefix) || prefix < 0 || prefix > 32) throw new Error('Invalid CIDR notation');

  const parts = ip.split('.');
  if (parts.length !== 4 || parts.some(p => isNaN(+p) || +p < 0 || +p > 255)) throw new Error('Invalid IP address');

  const maskLong = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
  const ipLong = ipToLong(ip);
  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | (~maskLong >>> 0)) >>> 0;
  const total = Math.pow(2, 32 - prefix);
  const usable = prefix >= 31 ? total : Math.max(0, total - 2);

  const firstOctet = parseInt(ip.split('.')[0], 10);
  const ipClass = firstOctet < 128 ? 'A' : firstOctet < 192 ? 'B' : firstOctet < 224 ? 'C' : firstOctet < 240 ? 'D (Multicast)' : 'E (Reserved)';

  return {
    networkAddress: longToIp(networkLong),
    broadcastAddress: longToIp(broadcastLong),
    firstUsable: prefix >= 31 ? longToIp(networkLong) : longToIp(networkLong + 1),
    lastUsable: prefix >= 31 ? longToIp(broadcastLong) : longToIp(broadcastLong - 1),
    subnetMask: longToIp(maskLong),
    wildcardMask: longToIp(~maskLong >>> 0),
    totalHosts: total,
    usableHosts: usable,
    prefix,
    ipClass,
    binaryMask: toBinary(maskLong),
    binaryNetwork: toBinary(networkLong),
  };
}

const PRESETS = ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '10.10.10.0/30', '0.0.0.0/0'];

export default function SubnetCalculatorTool() {
  const [cidr, setCidr] = useState('192.168.1.0/24');
  let info: SubnetInfo | null = null;
  let error = '';
  try { info = calculate(cidr); } catch (e: any) { error = e.message; }

  const Row = ({ label, value, mono = true }: { label: string; value: string | number; mono?: boolean }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold text-gray-200 ${mono ? 'font-mono' : ''}`}>{value}</span>
        <CopyButton text={String(value)} />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Subnet / CIDR Calculator</h1>
      <p className="text-gray-500 text-sm mb-5">Calculate network ranges, hosts, masks and more from CIDR notation.</p>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map(p => (
          <button key={p} onClick={() => setCidr(p)}
            className="px-2.5 py-1 text-xs rounded-lg border border-white/8 text-gray-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all font-mono">
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mb-5">
        <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">CIDR Notation</label>
        <input
          value={cidr} onChange={e => setCidr(e.target.value)}
          placeholder="e.g. 192.168.1.0/24"
          className={`w-full rounded-xl px-4 py-3 text-xl font-mono focus:outline-none transition-all ${
            error ? 'text-red-400 border-red-500/40' : 'text-indigo-300 border-indigo-500/30 focus:border-indigo-400/60'
          }`}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid', boxShadow: error ? undefined : 'inset 0 0 20px rgba(99,102,241,0.05)' }}
        />
        {error && <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500" />{error}</p>}
      </div>

      {info && (
        <div className="space-y-3">
          {/* Main results */}
          <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)' }}>
            <div className="px-4 py-2.5 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Network Info</span>
            </div>
            <div className="px-4">
              <Row label="Network Address"   value={info.networkAddress} />
              <Row label="Broadcast Address" value={info.broadcastAddress} />
              <Row label="First Usable Host" value={info.firstUsable} />
              <Row label="Last Usable Host"  value={info.lastUsable} />
              <Row label="Subnet Mask"       value={info.subnetMask} />
              <Row label="Wildcard Mask"     value={info.wildcardMask} />
              <Row label="IP Class"          value={info.ipClass} mono={false} />
              <Row label="Total Hosts"       value={info.totalHosts.toLocaleString()} mono={false} />
              <Row label="Usable Hosts"      value={info.usableHosts.toLocaleString()} mono={false} />
            </div>
          </div>

          {/* Binary */}
          <div className="rounded-2xl border border-white/8 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Binary Representation</p>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-20 flex-shrink-0">Network</span>
                <span className="text-emerald-400">{info.binaryNetwork}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-20 flex-shrink-0">Mask</span>
                <span className="text-indigo-400">{info.binaryMask}</span>
              </div>
            </div>
          </div>

          {/* Visual range */}
          <div className="rounded-2xl border border-white/8 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Address Range</p>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-amber-400">{info.networkAddress}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-500/40 via-indigo-500/40 to-emerald-500/40" />
              <span className="text-emerald-400">{info.broadcastAddress}</span>
            </div>
            <p className="text-[11px] text-gray-600 mt-1.5 text-center">/{info.prefix} → {info.usableHosts.toLocaleString()} usable addresses</p>
          </div>
        </div>
      )}
    </div>
  );
}
