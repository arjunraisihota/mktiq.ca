"use client";

import { useMemo, useState } from "react";
import type { CityIndexItem } from "@/lib/types";
import { CityGrid } from "@/components/city-grid";

export function CitySearch({ cities }: { cities: CityIndexItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return cities;
    return cities.filter((city) => city.cityName.toLowerCase().includes(value));
  }, [cities, query]);

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <label htmlFor="city-search" className="mb-2 block text-sm font-medium text-ink">
          Search by city
        </label>
        <input
          id="city-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a city name (e.g., Hamilton)"
          className="w-full rounded-md border border-edge bg-white px-4 py-2.5 text-sm text-ink outline-none ring-brand transition focus:ring-2"
        />
      </div>
      <CityGrid cities={filtered} />
    </div>
  );
}
