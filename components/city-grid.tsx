import Link from "next/link";
import type { CityIndexItem } from "@/lib/types";

export function CityGrid({ cities }: { cities: CityIndexItem[] }) {
  if (!cities.length) {
    return (
      <div className="rounded-xl border border-edge bg-white p-6 text-sm text-stone">
        No city matches your search yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cities.map((city) => (
        <Link
          key={city.citySlug}
          href={`/${city.cityRouteSlug}`}
          className="group rounded-xl border border-edge bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-slate-300"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">City Guide</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">{city.cityName}</h3>
          <p className="mt-2 text-sm text-stone">{city.neighbourhoodCount} neighbourhood profiles</p>
          <p className="mt-4 text-sm font-medium text-ink transition group-hover:text-brand">Explore city intelligence</p>
        </Link>
      ))}
    </div>
  );
}
