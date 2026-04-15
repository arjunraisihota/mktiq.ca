"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mktiq-recently-viewed:v1";
const MAX_ITEMS = 6;

export interface RecentlyViewedItem {
  cityRouteSlug: string;
  cityName: string;
  neighbourhoodSlug: string;
  neighbourhoodName: string;
  archetype?: string;
  viewedAt: number;
}

function loadItems(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems(items: RecentlyViewedItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded — fail silently
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadItems());
    setHydrated(true);
  }, []);

  const trackView = useCallback(
    (entry: Omit<RecentlyViewedItem, "viewedAt">) => {
      setItems((current) => {
        const filtered = current.filter(
          (item) =>
            !(item.cityRouteSlug === entry.cityRouteSlug && item.neighbourhoodSlug === entry.neighbourhoodSlug)
        );
        const next = [{ ...entry, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
        saveItems(next);
        return next;
      });
    },
    []
  );

  return { items, hydrated, trackView };
}
