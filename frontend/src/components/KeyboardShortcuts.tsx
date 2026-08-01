import React from 'react';

const KeyboardShortcuts: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#0b0b10] rounded-lg p-6 w-full max-w-md border border-white/5">
        <h3 className="text-lg font-bold mb-3">Keyboard shortcuts</h3>
        <ul className="text-sm space-y-2 text-gray-300">
          <li><strong>⌘/Ctrl + K</strong>: Focus search</li>
          <li><strong>?</strong>: Open shortcuts</li>
          <li><strong>Arrow keys</strong>: Navigate lists</li>
          <li><strong>Enter</strong>: Open selected tool</li>
        </ul>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-3 py-1 rounded bg-indigo-600">Close</button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
