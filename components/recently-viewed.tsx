"use client";

import Link from "next/link";
import { useRecentlyViewed } from "@/lib/use-recently-viewed";

export function RecentlyViewed() {
  const { items, hydrated } = useRecentlyViewed();

  if (!hydrated || !items.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-8">
      <div className="rounded-2xl border border-edge bg-white p-6 shadow-card md:p-8">
        <h2 className="text-lg font-semibold text-ink">Recently viewed</h2>
        <p className="mt-1 text-sm text-stone">Pick up where you left off.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <Link
              key={`${item.cityRouteSlug}/${item.neighbourhoodSlug}`}
              href={`/${item.cityRouteSlug}/${item.neighbourhoodSlug}`}
              className="group flex flex-col gap-1 rounded-lg border border-edge bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">
                {item.neighbourhoodName}
              </p>
              <p className="text-xs text-stone">{item.cityName}</p>
              {item.archetype && (
                <p className="mt-1 text-xs font-medium text-stone">{item.archetype}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
