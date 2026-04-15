"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { NeighbourhoodRecord } from "@/lib/types";

interface Props {
  cityRouteSlug: string;
  neighbourhoods: NeighbourhoodRecord[];
}

export function NeighbourhoodSearch({ cityRouteSlug, neighbourhoods }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return neighbourhoods;
    return neighbourhoods.filter((n) => (n.name || n.slug).toLowerCase().includes(needle));
  }, [neighbourhoods, query]);

  return (
    <section className="space-y-5">
      <div className="max-w-md">
        <label htmlFor="neighbourhood-search" className="mb-2 block text-sm font-medium text-ink">
          Find a neighbourhood
        </label>
        <input
          id="neighbourhood-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search neighbourhoods"
          className="w-full rounded-md border border-edge bg-white px-4 py-2.5 text-sm text-ink outline-none ring-brand transition focus:ring-2"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((n) => (
          <Link
            key={n.slug}
            href={`/${cityRouteSlug}/${n.slug}`}
            className="rounded-lg border border-edge bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <p className="font-medium text-ink">{n.name || n.slug}</p>
            <p className="mt-1 line-clamp-2 text-sm text-stone">{n.description || "Neighbourhood profile and local data insights."}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
