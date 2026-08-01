import React, { useEffect, useRef } from 'react';

const AdSenseAd: React.FC<{ adSlot?: string }> = ({ adSlot }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // Read Vite env flags (set in frontend/.env or process) to toggle ads and provide slot
  const env: any = typeof import.meta !== 'undefined' ? (import.meta as any).env : process.env;
  const ENABLE_ADS = env?.VITE_ENABLE_ADS === 'true' || env?.VITE_ENABLE_ADS === true;
  const slot = adSlot || env?.VITE_ADSENSE_SLOT || '1234567890';

  useEffect(() => {
    if (!ENABLE_ADS) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // ignore if adsbygoogle isn't ready yet
    }
  }, [ENABLE_ADS]);

  if (!ENABLE_ADS) return null;

  return (
    <div ref={ref} className="px-3 py-2">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-ad-slot={slot}
      />
    </div>
  );
};

export default AdSenseAd;
