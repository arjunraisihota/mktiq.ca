import Link from "next/link";
import { Hero } from "@/components/hero";
import { PopularNeighbourhoods } from "@/components/popular-neighbourhoods";
import { RecentlyViewed } from "@/components/recently-viewed";
import { CitySearch } from "@/components/city-search";
import { getCityByRouteSlug, getCityIndex, getPopularNeighbourhoods } from "@/lib/data";
import { homeMetadata } from "@/lib/seo";

export const metadata = homeMetadata();

export default function HomePage() {
  const cities = getCityIndex();
  const popularNeighbourhoods = getPopularNeighbourhoods(8);
  const totalNeighbourhoods = cities.reduce((acc, city) => acc + city.neighbourhoodCount, 0);
  const featuredCity = cities[0];
  const featuredCityLinks = cities.slice(0, 4).map((city) => {
    const cityData = getCityByRouteSlug(city.cityRouteSlug);
    return {
      city,
      neighbourhoods: (cityData?.neighbourhoods || []).slice(0, 6)
    };
  });

  return (
    <>
      <Hero
        cityCount={cities.length}
        neighbourhoodCount={totalNeighbourhoods}
        featuredCityRoute={featuredCity?.cityRouteSlug || ""}
        featuredCityName={featuredCity?.cityName || "Top"}
      />

      <section className="mx-auto max-w-6xl scroll-mt-24 px-6 py-12 md:py-16" id="cities">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-4xl">Explore cities across Ontario</h2>
        </div>

        <CitySearch cities={cities} />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-6 md:pb-8">
        <div className="rounded-2xl border border-edge bg-white p-6 shadow-card md:p-8">
          <h2 className="text-2xl font-semibold text-ink">Why mktIQ</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-ink">Know what you're buying into</p>
              <p className="mt-2 text-sm text-stone">Demographics, housing mix, and income signals — not just listing prices.</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-ink">Compare without guesswork</p>
              <p className="mt-2 text-sm text-stone">Save areas to your shortlist and compare them side by side across key signals.</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-ink">Built on census data</p>
              <p className="mt-2 text-sm text-stone">Scores are derived from Statistics Canada data, not ad clicks or agent reviews.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-8" id="internal-links">
        <div className="rounded-2xl border border-edge bg-white p-6 shadow-card md:p-8">
          <h2 className="text-2xl font-semibold text-ink">Browse neighbourhoods by city</h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {featuredCityLinks.map(({ city, neighbourhoods }) => (
              <article key={city.citySlug} className="rounded-xl border border-edge bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-ink">{city.cityName}</h3>
                  <Link href={`/${city.cityRouteSlug}`} className="text-sm font-medium text-brand transition hover:underline">
                    View full city page
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  {neighbourhoods.map((hood) => (
                    <Link
                      key={`${city.cityRouteSlug}-${hood.slug}`}
                      href={`/${city.cityRouteSlug}/${hood.slug}`}
                      className="rounded-md border border-edge bg-white px-3 py-1.5 font-medium text-ink transition hover:border-slate-300"
                    >
                      {hood.name}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <RecentlyViewed />

      <PopularNeighbourhoods items={popularNeighbourhoods} />
    </>
  );
}
