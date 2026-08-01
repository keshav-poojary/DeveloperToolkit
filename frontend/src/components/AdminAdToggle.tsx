import React from 'react';
import { useAds } from '../contexts/AdsContext';

const AdminAdToggle: React.FC = () => {
  const { enabled, setEnabled } = useAds();
  return (
    <div className="px-3 py-2">
      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => setEnabled(e.target.checked)}
          className="w-4 h-4"
        />
        Enable Ads
      </label>
    </div>
  );
};

export default AdminAdToggle;
