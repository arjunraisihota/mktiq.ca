import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CityRankingLinks } from "@/components/city-ranking-links";
import { SaveShortlistButton } from "@/components/save-shortlist-button";
import type { CityRankingSlug } from "@/lib/rankings";
import type { DerivedNeighbourhoodModel } from "@/lib/types";

interface CityRankingPageViewProps {
  cityName: string;
  cityRouteSlug: string;
  activeSlug: CityRankingSlug;
  title: string;
  intro: string;
  items: DerivedNeighbourhoodModel[];
}

export function CityRankingPageView({ cityName, cityRouteSlug, activeSlug, title, intro, items }: CityRankingPageViewProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: cityName, href: `/${cityRouteSlug}` },
          { label: title }
        ]}
      />

      <header className="rounded-2xl border border-edge bg-white p-6 shadow-card md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">City Ranking</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-stone">{intro}</p>
      </header>

      <div className="mt-8 grid gap-5">
        {items.slice(0, 10).map((item, index) => (
          <article key={item.neighbourhoodSlug} className="rounded-xl border border-edge bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand">Rank #{index + 1}</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{item.neighbourhoodName}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone">{item.decisionTitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <SaveShortlistButton model={item} variant="secondary" />
                <Link
                  href={`/${cityRouteSlug}/${item.neighbourhoodSlug}`}
                  className="inline-flex rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open full page
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="text-sm font-semibold text-ink">Why it ranks here</p>
                <p className="mt-2 text-sm leading-relaxed text-stone">{item.whatThisMeans}</p>
                <ul className="mt-4 space-y-2 text-sm text-stone">
                  {item.evidence.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-edge bg-slate-50 p-4">
                <p className="text-sm font-semibold text-ink">Quick read</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.rankingBadges.map((badge) => (
                    <span
                      key={badge.text}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        badge.tone === "warning" ? "bg-amber-50 text-amber-800" : "bg-white text-ink"
                      }`}
                    >
                      {badge.text}
                    </span>
                  ))}
                </div>

                <ul className="mt-4 space-y-2 text-sm text-stone">
                  {item.comparisonLines.slice(0, 2).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8">
        <CityRankingLinks cityName={cityName} cityRouteSlug={cityRouteSlug} activeSlug={activeSlug} />
      </div>
    </section>
  );
}
