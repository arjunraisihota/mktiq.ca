import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CityRankingLinks } from "@/components/city-ranking-links";
import { CityIntro } from "@/components/city-intro";
import { FAQSection } from "@/components/faq-section";
import { NeighbourhoodGrid } from "@/components/neighbourhood-grid";
import { NeighbourhoodSearch } from "@/components/neighbourhood-search";
import { SchemaScript } from "@/components/schema-script";
import { StatGrid } from "@/components/stat-grid";
import { cityFaq } from "@/lib/faq";
import { getAllRouteParams, getCityByRouteSlug, getRelatedCities } from "@/lib/data";
import { absoluteUrl, breadcrumbSchema, cityMetadata, cityPlaceSchema, faqSchema } from "@/lib/seo";
import { buildScoredCityModels } from "@/lib/signals";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { NeighbourhoodRecord } from "@/lib/types";

interface CityPageProps {
  params: Promise<{ city: string }>;
}

function topNeighbourhoodsBy(
  neighbourhoods: NeighbourhoodRecord[],
  metric: (hood: NeighbourhoodRecord) => number | null | undefined,
  count = 3
) {
  return neighbourhoods
    .map((hood) => ({ hood, value: metric(hood) }))
    .filter((row): row is { hood: NeighbourhoodRecord; value: number } => typeof row.value === "number" && Number.isFinite(row.value))
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

export async function generateStaticParams() {
  return getAllRouteParams().cityParams;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityData = getCityByRouteSlug(city);
  if (!cityData) return {};
  return cityMetadata(cityData.cityName, cityData.cityRouteSlug);
}

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params;
  const cityData = getCityByRouteSlug(city);
  if (!cityData) notFound();

  const faqItems = cityFaq(cityData.cityName);
  const relatedCities = getRelatedCities(cityData.cityRouteSlug);
  const scoredModels = buildScoredCityModels(cityData);

  const breadcrumbItems = [
    { name: "Home", url: absoluteUrl("/") },
    { name: cityData.cityName, url: absoluteUrl(`/${cityData.cityRouteSlug}`) }
  ];

  const summaryStats = {
    neighbourhoods_covered: formatNumber(cityData.neighbourhoodCount)
  };

  const shortlistSections = [
    {
      title: "Family-friendly picks",
      metricLabel: "Families with kids",
      rows: topNeighbourhoodsBy(cityData.neighbourhoods, (hood) => hood.demographics?.families_with_kids_pct),
      format: (value: number) => formatPercent(value)
    },
    {
      title: "Transit-access picks",
      metricLabel: "Transit stops",
      rows: topNeighbourhoodsBy(cityData.neighbourhoods, (hood) => hood.transit?.stops),
      format: (value: number) => formatNumber(value)
    },
    {
      title: "High activity picks",
      metricLabel: "Moved in last year",
      rows: topNeighbourhoodsBy(cityData.neighbourhoods, (hood) => hood.housing?.moved_within_1yr_pct),
      format: (value: number) => formatPercent(value)
    }
  ].filter((section) => section.rows.length > 0);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <SchemaScript data={breadcrumbSchema(breadcrumbItems)} />
      <SchemaScript data={cityPlaceSchema(cityData.cityName, absoluteUrl(`/${cityData.cityRouteSlug}`), cityData.neighbourhoodCount)} />
      <SchemaScript data={faqSchema(faqItems)} />

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: cityData.cityName }]} />

      <CityIntro cityName={cityData.cityName} intro={cityData.intro} />

      <div className="mb-10">
        <StatGrid
          title="At a Glance"
          stats={summaryStats}
          labelMap={{ neighbourhoods_covered: "Neighbourhoods covered" }}
          whatThisMeans="You can explore a broad range of neighbourhood options in one place before narrowing down your shortlist."
        />
      </div>

      <div className="mb-10">
        <CityRankingLinks cityName={cityData.cityName} cityRouteSlug={cityData.cityRouteSlug} />
      </div>

      {shortlistSections.length ? (
        <section className="mb-10 rounded-xl border border-edge bg-white p-6 shadow-card">
          <h2 className="text-2xl font-semibold text-ink">Quick neighbourhood shortlists</h2>
          <p className="mt-2 text-sm text-stone">Compare these starting points, then open each neighbourhood page for full context.</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {shortlistSections.map((section) => (
              <article key={section.title} className="rounded-lg border border-edge bg-slate-50 p-4">
                <h3 className="text-base font-semibold text-ink">{section.title}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {section.rows.map(({ hood, value }) => (
                    <li key={hood.slug}>
                      <Link href={`/${cityData.cityRouteSlug}/${hood.slug}`} className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 transition hover:bg-slate-100">
                        <span className="font-medium text-ink">{hood.name || hood.slug}</span>
                        <span className="text-stone">{section.metricLabel}: {section.format(value)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="rounded-xl border border-edge bg-white p-6 shadow-card">
        <h2 className="text-2xl font-semibold text-ink">All {cityData.cityName} neighbourhood pages</h2>
        <p className="mt-2 text-sm text-stone">
          Every neighbourhood below has a full profile — household composition, housing mix, income signals, and transit access.
        </p>
        <div className="mt-6">
          <NeighbourhoodGrid
            cityRouteSlug={cityData.cityRouteSlug}
            neighbourhoods={cityData.neighbourhoods}
            scoredModels={scoredModels}
          />
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <FAQSection title={`${cityData.cityName} FAQs`} items={faqItems} />

        <section className="rounded-xl border border-edge bg-white p-6 shadow-card">
          <h3 className="text-xl font-semibold text-ink">Explore related cities</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedCities.map((item) => (
              <Link
                key={item.citySlug}
                href={`/${item.cityRouteSlug}`}
                className="rounded-lg border border-edge bg-slate-50 p-4 text-sm font-medium text-ink transition hover:bg-slate-100"
              >
                {item.cityName}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
