"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { DerivedNeighbourhoodModel } from "@/lib/types";

const STORAGE_KEY = "mktiq-shortlist:v1";

interface ShortlistContextValue {
  items: DerivedNeighbourhoodModel[];
  hydrated: boolean;
  isSaved: (cityRouteSlug: string, neighbourhoodSlug: string) => boolean;
  toggleItem: (item: DerivedNeighbourhoodModel) => void;
  removeItem: (cityRouteSlug: string, neighbourhoodSlug: string) => void;
  clearItems: () => void;
}

const ShortlistContext = createContext<ShortlistContextValue | null>(null);

function isSameItem(item: DerivedNeighbourhoodModel, cityRouteSlug: string, neighbourhoodSlug: string) {
  return item.cityRouteSlug === cityRouteSlug && item.neighbourhoodSlug === neighbourhoodSlug;
}

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<DerivedNeighbourhoodModel[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DerivedNeighbourhoodModel[];
        setItems(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  function isSaved(cityRouteSlug: string, neighbourhoodSlug: string) {
    return items.some((item) => isSameItem(item, cityRouteSlug, neighbourhoodSlug));
  }

  function toggleItem(item: DerivedNeighbourhoodModel) {
    setItems((current) => {
      const exists = current.some((entry) => isSameItem(entry, item.cityRouteSlug, item.neighbourhoodSlug));
      if (exists) {
        return current.filter((entry) => !isSameItem(entry, item.cityRouteSlug, item.neighbourhoodSlug));
      }

      return [item, ...current].slice(0, 12);
    });
  }

  function removeItem(cityRouteSlug: string, neighbourhoodSlug: string) {
    setItems((current) => current.filter((item) => !isSameItem(item, cityRouteSlug, neighbourhoodSlug)));
  }

  function clearItems() {
    setItems([]);
  }

  return (
    <ShortlistContext.Provider value={{ items, hydrated, isSaved, toggleItem, removeItem, clearItems }}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const context = useContext(ShortlistContext);
  if (!context) {
    throw new Error("useShortlist must be used within ShortlistProvider");
  }

  return context;
}
