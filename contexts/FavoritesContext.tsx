"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface FavoritesContextValue {
  favorites: string[];
  addFavorite: (matchId: string) => void;
  removeFavorite: (matchId: string) => void;
  isFavorite: (matchId: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);
const STORAGE_KEY = "favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  const addFavorite = (matchId: string) => {
    if (!matchId) return;
    setFavorites((prev) => (prev.includes(matchId) ? prev : [...prev, matchId]));
  };

  const removeFavorite = (matchId: string) => {
    setFavorites((prev) => prev.filter((id) => id != matchId));
  };

  const isFavorite = (matchId: string) => favorites.includes(matchId);

  const clearFavorites = () => setFavorites([]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
