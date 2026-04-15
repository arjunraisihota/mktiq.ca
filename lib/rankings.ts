import type { SignalKey } from "@/lib/types";

export const CITY_RANKING_PAGES = [
  {
    slug: "best-for-families",
    signalKey: "familyFit",
    shortLabel: "Family Fit",
    titleTemplate: "Best Neighbourhoods in {city} for Families",
    descriptionTemplate: "Ranked family-focused neighbourhoods in {city} based on household mix, schools, parks, and family-sized housing.",
    intro: "If you care most about school access, family-sized homes, parks, and kid-heavy household mix, start with this ranking."
  },
  {
    slug: "most-stable",
    signalKey: "stability",
    shortLabel: "Stability",
    titleTemplate: "Most Stable Neighbourhoods in {city}",
    descriptionTemplate: "The most established neighbourhoods in {city}, ranked by owner occupancy, lower turnover, and settled housing patterns.",
    intro: "If you want owner-led streets, lower churn, and neighbourhoods that reward long-hold ownership, this is the ranking that matters."
  },
  {
    slug: "best-for-commuters",
    signalKey: "commuterConvenience",
    shortLabel: "Commuter Convenience",
    titleTemplate: "Best Neighbourhoods in {city} for Commuters",
    descriptionTemplate: "Neighbourhoods in {city} ranked for commuter practicality using commute times, transit mix, and local accessibility signals.",
    intro: "If your week is shaped by commute time and daily movement friction, these are the neighbourhoods to check first."
  }
] as const satisfies ReadonlyArray<{
  slug: string;
  signalKey: SignalKey;
  shortLabel: string;
  titleTemplate: string;
  descriptionTemplate: string;
  intro: string;
}>;

export type CityRankingSlug = (typeof CITY_RANKING_PAGES)[number]["slug"];

export function getCityRankingDefinition(slug: string) {
  return CITY_RANKING_PAGES.find((page) => page.slug === slug) ?? null;
}

export function renderCityRankingText(template: string, cityName: string) {
  return template.replace("{city}", cityName);
}
