import Link from "next/link";
import { CITY_RANKING_PAGES, type CityRankingSlug, renderCityRankingText } from "@/lib/rankings";

interface CityRankingLinksProps {
  cityName: string;
  cityRouteSlug: string;
  activeSlug?: CityRankingSlug;
}

export function CityRankingLinks({ cityName, cityRouteSlug, activeSlug }: CityRankingLinksProps) {
  return (
    <section className="rounded-xl border border-edge bg-white p-6 shadow-card">
      <h2 className="text-2xl font-semibold text-ink">Decision rankings for {cityName}</h2>
      <p className="mt-2 max-w-3xl text-sm text-stone">Use these pages when you want ranked shortlists instead of browsing every neighbourhood one by one.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {CITY_RANKING_PAGES.map((page) => (
          <Link
            key={page.slug}
            href={`/${cityRouteSlug}/${page.slug}`}
            className={`rounded-xl border p-4 transition ${
              activeSlug === page.slug ? "border-ink bg-slate-50" : "border-edge bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand">{page.shortLabel}</p>
            <h3 className="mt-2 text-lg font-semibold text-ink">{renderCityRankingText(page.titleTemplate, cityName)}</h3>
            <p className="mt-2 text-sm text-stone">{page.intro}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
