import React, { createContext, useContext, useEffect, useState } from 'react';

type AdsContextType = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
};

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export const AdsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled] = useState<boolean>(() => {
    const seed = import.meta.env?.VITE_ENABLE_ADS;
    const saved = window.localStorage.getItem('ads_enabled');
    if (saved !== null) return saved === 'true';
    return seed === 'true';
  });

  useEffect(() => {
    try { localStorage.setItem('ads_enabled', String(enabled)); } catch (e) {}
  }, [enabled]);

  const setEnabled = () => {}; // No-op setter to satisfy consumers

  return (
    <AdsContext.Provider value={{ enabled, setEnabled }}>{children}</AdsContext.Provider>
  );
};

export const useAds = () => {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds must be used within AdsProvider');
  return ctx;
};

export default AdsContext;
