import React, { useEffect, useRef, useState } from 'react';
import { useAds } from '../contexts/AdsContext';

const AdSenseAd: React.FC<{ adSlot?: string }> = ({ adSlot }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { enabled } = useAds();
  const [visible, setVisible] = useState(false);

  const env: any = typeof import.meta !== 'undefined' ? (import.meta as any).env : process.env;
  const slot = adSlot || env?.VITE_ADSENSE_SLOT || '1234567890';

  useEffect(() => {
    // Always lazy-load ads when the component mounts; respect `enabled` when pushing ad call.
    if (!ref.current) return;

    let obs: IntersectionObserver | null = null;
    try {
      obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setVisible(true);
        });
      }, { threshold: 0.1 });
      obs.observe(ref.current);
    } catch (e) {}

    return () => { if (obs && ref.current) obs.unobserve(ref.current); };
  }, []);

  useEffect(() => {
    if (!enabled || !visible) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, [enabled, visible]);

  if (!enabled) return null;

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
