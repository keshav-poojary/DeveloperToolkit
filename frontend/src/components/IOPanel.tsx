import React from 'react';
import CopyButton from './CopyButton';

interface IOPanelProps {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  mono?: boolean;
  actions?: React.ReactNode;
  error?: string;
  showCopy?: boolean;
}

const IOPanel: React.FC<IOPanelProps> = ({
  label, value, onChange, placeholder, readOnly = false,
  rows = 10, mono = true, actions, error, showCopy = false,
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        {actions}
        {showCopy && <CopyButton text={value} />}
      </div>
    </div>
    <textarea
      value={value}
      onChange={onChange ? e => onChange(e.target.value) : undefined}
      readOnly={readOnly}
      placeholder={placeholder}
      rows={rows}
      className={`w-full rounded-xl px-3.5 py-3 text-sm resize-y focus:outline-none transition-all duration-200 placeholder-gray-700 ${
        mono ? 'font-mono' : ''
      } ${
        readOnly
          ? 'bg-black/30 text-gray-400 cursor-default border border-white/5'
          : 'bg-white/5 text-gray-200 border border-white/8 focus:border-indigo-500/50 focus:bg-white/7 focus:shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
      } ${
        error ? '!border-red-500/50 !bg-red-500/5' : ''
      }`}
    />
    {error && (
      <p className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
        <span className="text-red-500">✗</span> {error}
      </p>
    )}
  </div>
);

export default IOPanel;
