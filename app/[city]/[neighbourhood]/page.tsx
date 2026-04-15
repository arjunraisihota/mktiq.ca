import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BackToCityButton } from "@/components/back-to-city-button";
import { CityRankingLinks } from "@/components/city-ranking-links";
import { DecisionHero } from "@/components/decision-hero";
import { FAQSection } from "@/components/faq-section";
import { NeighbourhoodGrid } from "@/components/neighbourhood-grid";
import { SchemaScript } from "@/components/schema-script";
import { StatGrid } from "@/components/stat-grid";
import { TrackRecentlyViewed } from "@/components/track-recently-viewed";
import { getAllRouteParams, getNeighbourhoodBySlug } from "@/lib/data";
import { neighbourhoodFaq } from "@/lib/faq";
import { getNeighbourhoodPageModel } from "@/lib/page-model";
import { absoluteUrl, breadcrumbSchema, faqSchema, neighbourhoodMetadata } from "@/lib/seo";
import { buildScoredCityModels } from "@/lib/signals";
import type { DerivedNeighbourhoodModel, NeighbourhoodRecord, RankingBadge } from "@/lib/types";
import { titleCaseKey } from "@/lib/utils";

interface NeighbourhoodPageProps {
  params: Promise<{ city: string; neighbourhood: string }>;
}

export async function generateStaticParams() {
  return getAllRouteParams().neighbourhoodParams;
}

export async function generateMetadata({ params }: NeighbourhoodPageProps): Promise<Metadata> {
  const { city, neighbourhood } = await params;
  const pageData = getNeighbourhoodBySlug(city, neighbourhood);
  if (!pageData) return {};

  return neighbourhoodMetadata(
    pageData.city.cityName,
    pageData.city.cityRouteSlug,
    pageData.neighbourhood.name || pageData.neighbourhood.slug,
    pageData.neighbourhood.slug
  );
}

// ---- Helpers ----

function householdInsights(hood: NeighbourhoodRecord): Record<string, string> | null {
  const insights: [string, string][] = [];

  const ownerPct = hood.sections?.renters_and_owners?.values?.owner;
  const renterPct = hood.sections?.renters_and_owners?.values?.renter;
  if (ownerPct != null && ownerPct > 0) {
    if (ownerPct >= 75) insights.push(["Strongly owner-occupied", `${ownerPct}%`]);
    else if (ownerPct >= 55) insights.push(["Owner-majority", `${ownerPct}%`]);
    else if (renterPct != null && renterPct >= 55) insights.push(["Renter-heavy mix", `${renterPct}% renters`]);
    else insights.push(["Balanced tenure", `${ownerPct}% owners`]);
  }

  const familiesPct = hood.demographics?.families_with_kids_pct;
  const solosPct = hood.demographics?.one_person_household_pct;
  const couplesPct = hood.demographics?.couples_no_kids_pct;

  if (familiesPct != null) {
    if (familiesPct >= 38) insights.push(["Family-oriented", `${familiesPct}%`]);
    else if (familiesPct <= 22) insights.push(["Not family-oriented", `${familiesPct}%`]);
  }
  if (insights.length < 2 && solosPct != null && solosPct >= 33) {
    insights.push(["Solo-household heavy", `${solosPct}%`]);
  }
  if (insights.length < 2 && couplesPct != null && couplesPct >= 38) {
    insights.push(["Couples without kids", `${couplesPct}%`]);
  }

  return insights.length >= 2 ? Object.fromEntries(insights.slice(0, 3)) : null;
}

function stabilityInsights(hood: NeighbourhoodRecord): Record<string, string> | null {
  const insights: [string, string][] = [];

  const moved5yr = hood.housing?.moved_within_5yr_pct;
  const moved1yr = hood.housing?.moved_within_1yr_pct;

  if (moved5yr != null) {
    if (moved5yr >= 55) insights.push(["High turnover area", `${moved5yr}% moved in 5 yrs`]);
    else if (moved5yr >= 40) insights.push(["Moderate turnover", `${moved5yr}% moved in 5 yrs`]);
    else insights.push(["Long-tenure residents", `${100 - moved5yr}% stayed 5+ yrs`]);
  }
  if (moved1yr != null && moved1yr >= 14) {
    insights.push(["High recent movement", `${moved1yr}% last year`]);
  }
  if (hood.homes?.mostly_older_homes === true) {
    insights.push(["Older home stock", "Pre-1981 majority"]);
  }

  return insights.length >= 1 ? Object.fromEntries(insights.slice(0, 3)) : null;
}

function commuteInsights(hood: NeighbourhoodRecord): Record<string, string> | null {
  const vehicle = hood.sections?.commute_types?.values?.vehicle ?? 0;
  const transit = hood.sections?.commute_types?.values?.transit ?? 0;
  const walkBike = hood.sections?.commute_types?.values?.walk_bike ?? 0;
  if (vehicle === 0 && transit === 0 && walkBike === 0) return null;

  const insights: [string, string][] = [];

  if (vehicle >= 70) insights.push(["Car-dependent", `${vehicle}%`]);
  else if (vehicle >= 55) insights.push(["Car-majority commuters", `${vehicle}%`]);
  else if (vehicle > 0 && vehicle < 45) insights.push(["Low car dependence", `${vehicle}%`]);

  if (transit >= 20) insights.push(["Transit-accessible", `${transit}%`]);
  else if (transit > 0 && transit < 10) insights.push(["Very low transit use", `${transit}%`]);
  else if (transit >= 10) insights.push(["Limited transit", `${transit}%`]);

  if (walkBike >= 12) insights.push(["Walkable / bikeable", `${walkBike}%`]);

  return insights.length >= 2 ? Object.fromEntries(insights.slice(0, 3)) : null;
}

function educationInsights(hood: NeighbourhoodRecord): Record<string, string> | null {
  const insights: [string, string][] = [];

  const bachelors = hood.education?.bachelors_or_higher_pct;
  const postsecondary = hood.education?.any_postsecondary_pct;

  if (bachelors != null) {
    if (bachelors >= 48) insights.push(["High education profile", `${bachelors}%`]);
    else if (bachelors < 22) insights.push(["Below-average education", `${bachelors}%`]);
  }
  if (postsecondary != null && bachelors != null && postsecondary - bachelors >= 15) {
    insights.push(["Strong trades/college mix", `${Math.round(postsecondary - bachelors)}% college-only`]);
  }

  return insights.length >= 2 ? Object.fromEntries(insights.slice(0, 2)) : null;
}

function statsLabel(archetype: string): string {
  switch (archetype) {
    case "Family-first suburb":
    case "Affluent stable enclave":
    case "Mature established neighbourhood":
      return "Who lives here";
    case "Commuter-connected suburb":
      return "Neighbourhood profile";
    default:
      return "What the data shows";
  }
}

function alternativeTradeoffLabel(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes("family")) return "Better for families";
  if (r.includes("stable") || r.includes("established") || r.includes("ownership")) return "More stable";
  if (r.includes("commut")) return "Better for commuters";
  if (r.includes("value") || r.includes("entry") || r.includes("flex")) return "Better for value";
  if (r.includes("similar") || r.includes("different")) return "Different tradeoff";
  return "Consider instead";
}

/** Builds 3–5 relative signals from existing ranking badges, supplemented by threshold-based metrics. */
function relativeSignals(model: DerivedNeighbourhoodModel): RankingBadge[] {
  const signals: RankingBadge[] = [...model.rankingBadges];

  if (signals.length < 5 && model.metrics.ownerPct >= 78 && !signals.some((b) => b.text.includes("stability"))) {
    signals.push({ tone: "positive", text: `${Math.round(model.metrics.ownerPct)}% owner-occupied` });
  }

  if (signals.length < 5 && model.scores.commuterConvenience.percentile <= 30 && !signals.some((b) => b.text.includes("commuter"))) {
    signals.push({ tone: "warning", text: "Below-average transit access" });
  }

  if (signals.length < 5 && model.metrics.condoPct >= 35 && !signals.some((b) => b.text.includes("density"))) {
    signals.push({ tone: "warning", text: "Higher condo density" });
  }

  if (signals.length < 5 && model.scores.affluence.percentile >= 75 && !signals.some((b) => b.text.includes("buying power"))) {
    signals.push({ tone: "positive", text: "Above-average household income" });
  }

  return signals.slice(0, 5);
}

/** Cleans raw census-style keys into readable labels. */
function cleanStatKey(key: string): string {
  const overrides: Record<string, string> = {
    single_detached_house: "Detached house",
    semi_detached_house: "Semi-detached",
    row_house: "Row house",
    low_rise_apartment_condo: "Low-rise apt/condo",
    high_rise_apartment_condo: "High-rise apt/condo",
    "4_or_more_bedrooms": "4+ bedrooms",
    "3_bedrooms": "3 bedrooms",
    "2_bedrooms": "2 bedrooms",
    "1_bedroom": "1 bedroom",
    "1960_or_before": "Before 1961",
    "1961_to_1980": "1961–1980",
    "1981_to_1990": "1981–1990",
    "1991_to_2000": "1991–2000",
    "2001_to_2005": "2001–2005",
    "2006_to_2010": "2006–2010",
    "2011_to_2016": "2011–2016",
    owner: "Owner-occupied",
    renter: "Renter",
    condominium: "Condo",
    not_condominium: "Non-condo",
    vehicle: "Vehicle",
    transit: "Transit",
    walk_bike: "Walk / bike",
    less_than_15_minutes: "Under 15 min",
    "15_to_29_minutes": "15–29 min",
    "30_to_44_minutes": "30–44 min",
    "45_to_59_minutes": "45–59 min",
    "60_minutes_and_over": "60+ min",
  };
  return overrides[key] ?? titleCaseKey(key);
}

/**
 * Filters and ranks a numeric stat map for display.
 * - Removes null / zero / below-threshold values
 * - Sorts descending
 * - Returns top N entries as a label → "X%" map
 * - Returns null if fewer than 2 values survive
 */
function filterAndRankStats(
  values: Record<string, number | null | undefined>,
  options?: { minValue?: number; maxItems?: number }
): Record<string, string> | null {
  const minValue = options?.minValue ?? 5;
  const maxItems = options?.maxItems ?? 4;

  const filtered = Object.entries(values)
    .filter((entry): entry is [string, number] => {
      const v = entry[1];
      return v !== null && v !== undefined && v > 0 && v >= minValue;
    })
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxItems);

  if (filtered.length < 2) return null;

  return Object.fromEntries(filtered.map(([key, value]) => [cleanStatKey(key), `${value}%`]));
}

// Section keys that are already surfaced elsewhere or add low decision value
const EXCLUDED_SECTION_KEYS = new Set([
  "broad_age_ranges",
  "specific_age_groups",
  "ethnic_origins",
  "visible_minorities",
  "children_per_family",
  "condominium_status",
  "renters_and_owners",
  "commute_types",
  "commute_destination_for_residents",
  "commute_times_of_residents",
  "household_income",
]);

function dynamicStatsFromSections(
  sections: Record<string, { heading: string; values: Record<string, number> | null } | undefined> | null | undefined
) {
  if (!sections) return [];

  return Object.entries(sections)
    .filter(([key, section]) => !EXCLUDED_SECTION_KEYS.has(key) && Boolean(section))
    .map(([, section]) => section!)
    .filter((section) => section.values && Object.keys(section.values).length > 0)
    .slice(0, 4)
    .map((section) => {
      const stats = filterAndRankStats(section.values as Record<string, number>, { maxItems: 5 });
      return stats ? { title: section.heading, stats } : null;
    })
    .filter((card): card is { title: string; stats: Record<string, string> } => card !== null);
}

// ---- Page ----

export default async function NeighbourhoodPage({ params }: NeighbourhoodPageProps) {
  const { city, neighbourhood } = await params;
  const pageData = getNeighbourhoodPageModel(city, neighbourhood);
  if (!pageData) notFound();

  const { cityData, neighbourhood: hood, model } = pageData;
  const hoodName = hood.name || hood.slug;
  const faqItems = neighbourhoodFaq(hoodName, cityData.cityName);

  const breadcrumbItems = [
    { name: "Home", url: absoluteUrl("/") },
    { name: cityData.cityName, url: absoluteUrl(`/${cityData.cityRouteSlug}`) },
    { name: hoodName, url: absoluteUrl(`/${cityData.cityRouteSlug}/${hood.slug}`) }
  ];

  const profileStats = householdInsights(hood);
  const stabilityStats = stabilityInsights(hood);
  const commuteStats = commuteInsights(hood);
  const educationStats = educationInsights(hood);

  const dynamicSectionCards = dynamicStatsFromSections(hood.sections || null);
  const related = cityData.neighbourhoods.filter((n) => n.slug !== hood.slug).slice(0, 6);
  const scoredModels = buildScoredCityModels(cityData);
  const signals = relativeSignals(model);

  // Pre-filtered stats for the collapsed "Detailed data" section
  const homeTypeStats = hood.homes?.home_types_pct
    ? filterAndRankStats(hood.homes.home_types_pct, { maxItems: 5, minValue: 3 })
    : null;
  const bedroomStats = hood.homes?.bedrooms_pct
    ? filterAndRankStats(hood.homes.bedrooms_pct, { maxItems: 4, minValue: 5 })
    : null;
  const constructionStats = hood.homes?.construction_period_pct
    ? filterAndRankStats(hood.homes.construction_period_pct, { maxItems: 5, minValue: 5 })
    : null;

  const hasDeepData = !!homeTypeStats || !!bedroomStats || !!constructionStats || dynamicSectionCards.length > 0;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <SchemaScript data={breadcrumbSchema(breadcrumbItems)} />
      <SchemaScript data={faqSchema(faqItems)} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: cityData.cityName, href: `/${cityData.cityRouteSlug}` },
          { label: hoodName }
        ]}
      />

      <TrackRecentlyViewed
        cityRouteSlug={cityData.cityRouteSlug}
        cityName={cityData.cityName}
        neighbourhoodSlug={hood.slug}
        neighbourhoodName={hoodName}
        archetype={model.primaryArchetype}
      />

      <BackToCityButton cityName={cityData.cityName} cityRouteSlug={cityData.cityRouteSlug} />

      {/* Decision Hero */}
      <DecisionHero cityName={cityData.cityName} neighbourhoodName={hoodName} model={model} />

      {/* Relative position signals */}
      {signals.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {signals.map((signal) => (
            <span
              key={signal.text}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                signal.tone === "positive"
                  ? "bg-teal-50 text-teal-800 ring-teal-200"
                  : "bg-amber-50 text-amber-800 ring-amber-200"
              }`}
            >
              {signal.text}
            </span>
          ))}
        </div>
      )}

      {/* 1. What this means + Choose / Don't choose */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-edge bg-white p-6 shadow-card">
          <h2 className="text-2xl font-semibold text-ink">What this means</h2>
          <p className="mt-3 text-base leading-relaxed text-stone">{model.whatThisMeans}</p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-brand">Choose This If</h3>
              <ul className="mt-3 space-y-2 text-sm text-stone">
                {model.chooseThisIf.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-brand">Do Not Choose This If</h3>
              <ul className="mt-3 space-y-2 text-sm text-stone">
                {model.doNotChooseIf.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Buyer strategy + Risk flags */}
        <section className="rounded-xl border border-edge bg-white p-6 shadow-card">
          <h2 className="text-2xl font-semibold text-ink">Buyer strategy</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone">
            {model.buyerStrategy.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3 className="mt-8 text-lg font-semibold text-ink">Risk flags</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone">
            {model.riskFlags.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* 3. Stats — decision-filtered */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink">{statsLabel(model.primaryArchetype)}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {profileStats && <StatGrid title="Households" stats={profileStats} compact />}
          {stabilityStats && <StatGrid title="Housing stability" stats={stabilityStats} compact />}
          {commuteStats && <StatGrid title="Commute" stats={commuteStats} compact />}
          {educationStats && <StatGrid title="Education" stats={educationStats} compact />}
        </div>
      </section>

      {/* 4. Tradeoffs / Alternatives */}
      {model.alternatives.length > 0 && (
        <section className="mt-8 rounded-xl border border-edge bg-white p-6 shadow-card">
          <h2 className="text-2xl font-semibold text-ink">Tradeoffs worth considering</h2>
          <p className="mt-2 text-sm text-stone">Other {cityData.cityName} options with different strengths.</p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {model.alternatives.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-edge bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand">{alternativeTradeoffLabel(item.reason)}</p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{item.name}</h3>
                <p className="mt-2 text-sm text-stone">{item.reason}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. Ranking links */}
      <div className="mt-8">
        <CityRankingLinks cityName={cityData.cityName} cityRouteSlug={cityData.cityRouteSlug} />
      </div>

      {/* 6. Detailed data — collapsed */}
      {hasDeepData && (
        <details className="mt-8 rounded-xl border border-edge bg-white shadow-card">
          <summary className="cursor-pointer select-none rounded-xl px-6 py-5 text-lg font-semibold text-ink hover:bg-slate-50">
            Detailed data
          </summary>
          <div className="space-y-4 px-6 pb-6 pt-2">
            {homeTypeStats && (
              <StatGrid
                title="Home types"
                stats={homeTypeStats}
                whatThisMeans="Whether the area skews toward condos, detached homes, or mixed stock."
              />
            )}
            {bedroomStats && (
              <StatGrid
                title="Bedrooms"
                stats={bedroomStats}
                whatThisMeans="Bedroom mix helps you gauge fit for singles, couples, or growing families."
              />
            )}
            {constructionStats && (
              <StatGrid
                title="Construction era"
                stats={constructionStats}
                whatThisMeans="Build era hints at renovation needs, streetscape style, and typical home condition."
              />
            )}
            {dynamicSectionCards.map((card) => (
              <StatGrid key={card.title} title={card.title} stats={card.stats} />
            ))}
          </div>
        </details>
      )}

      {/* 7. Related neighbourhoods */}
      <section className="mt-10 rounded-xl border border-edge bg-white p-6 shadow-card">
        <h2 className="text-2xl font-semibold text-ink">Explore more neighbourhoods in {cityData.cityName}</h2>
        <p className="mt-2 text-sm text-stone">Continue your search with related neighbourhood profiles.</p>
        <div className="mt-6">
          <NeighbourhoodGrid cityRouteSlug={cityData.cityRouteSlug} neighbourhoods={related} scoredModels={scoredModels} />
        </div>
        <Link
          href={`/${cityData.cityRouteSlug}`}
          className="mt-6 inline-flex rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to {cityData.cityName} page
        </Link>
      </section>

      {/* 8. FAQ */}
      <div className="mt-10">
        <FAQSection title={`${hoodName} FAQs`} items={faqItems} />
      </div>
    </section>
  );
}
