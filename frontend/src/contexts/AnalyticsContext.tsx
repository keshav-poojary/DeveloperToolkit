import React, { createContext, useContext, useEffect, useState } from 'react';

type AnalyticsData = Record<string, number>;

type AnalyticsContextType = {
  counts: AnalyticsData;
  recordToolUse: (toolId: string) => void;
  topTools: (limit?: number) => Array<{ toolId: string; count: number }>;
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);
const STORAGE_KEY = 'tool_usage_counts';

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [counts, setCounts] = useState<AnalyticsData>({});

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setCounts(JSON.parse(stored));
    } catch (e) {
      setCounts({});
    }
  }, []);

  const persist = (data: AnalyticsData) => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  };

  const recordToolUse = (toolId: string) => {
    setCounts(prev => {
      const next = { ...prev, [toolId]: (prev[toolId] || 0) + 1 };
      persist(next);
      return next;
    });
  };

  const topTools = (limit = 3) =>
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([toolId, count]) => ({ toolId, count }));

  return (
    <AnalyticsContext.Provider value={{ counts, recordToolUse, topTools }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
};

export default AnalyticsContext;
