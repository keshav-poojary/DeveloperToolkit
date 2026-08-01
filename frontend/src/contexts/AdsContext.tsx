import React, { createContext, useContext, useEffect, useState } from 'react';

type AdsContextType = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
};

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export const AdsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const env: any = typeof import.meta !== 'undefined' ? (import.meta as any).env : process.env;
  const envDefault = env?.VITE_ENABLE_ADS === 'true' || env?.VITE_ENABLE_ADS === true;
  const [enabled, setEnabledState] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('ads_enabled');
      if (v !== null) return v === 'true';
    } catch (e) {}
    return !!envDefault;
  });

  useEffect(() => {
    try { localStorage.setItem('ads_enabled', String(enabled)); } catch (e) {}
  }, [enabled]);

  const setEnabled = (v: boolean) => setEnabledState(v);

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
