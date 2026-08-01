import React, { createContext, useContext, useEffect, useState } from 'react';

type FavoritesContextType = {
  favorites: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const v = localStorage.getItem('favorites');
      if (v) return JSON.parse(v);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try { localStorage.setItem('favorites', JSON.stringify(favorites)); } catch (e) {}
  }, [favorites]);

  const toggle = (id: string) => {
    setFavorites(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const has = (id: string) => favorites.includes(id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, has }}>{children}</FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};

export default FavoritesContext;
