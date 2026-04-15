import { cache } from "react";
import { getCityByRouteSlug } from "@/lib/data";
import { CITY_RANKING_PAGES, getCityRankingDefinition, type CityRankingSlug } from "@/lib/rankings";
import { buildScoredCityModels, PRIMARY_SIGNAL_KEYS, SIGNAL_LABELS } from "@/lib/signals";
import type { ComparisonAlternative, DerivedNeighbourhoodModel, ScoredNeighbourhoodModel, SignalKey } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/utils";

type ScoredCityRow = ScoredNeighbourhoodModel;

function roundUpToTen(value: number) {
  return Math.max(10, Math.min(100, Math.ceil(value / 10) * 10));
}

function topBucket(rank: number, total: number) {
  return `Top ${roundUpToTen((rank / total) * 100)}%`;
}

function bottomBucket(rank: number, total: number) {
  return `Bottom ${roundUpToTen(((total - rank + 1) / total) * 100)}%`;
}

function getNearestPeer(current: ScoredCityRow, allRows: ScoredCityRow[], key: SignalKey, direction: "lower" | "higher") {
  const peerPool = allRows.filter((row) => {
    if (row.neighbourhood.slug === current.neighbourhood.slug) return false;
    return direction === "lower"
      ? row.scores[key].value < current.scores[key].value
      : row.scores[key].value > current.scores[key].value;
  });

  return peerPool.sort((a, b) => {
    const aDiff = Math.abs(a.scores[key].value - current.scores[key].value);
    const bDiff = Math.abs(b.scores[key].value - current.scores[key].value);
    return aDiff - bDiff;
  })[0];
}

function buildDecisionTitle(model: ScoredCityRow) {
  const cityName = model.cityName;
  const archetypeLead: Record<string, string> = {
    "Family-first suburb": `One of ${cityName}'s stronger family-oriented neighbourhoods`,
    "Affluent stable enclave": `One of ${cityName}'s more established owner-led neighbourhoods`,
    "Commuter-connected suburb": `One of ${cityName}'s more commuter-practical neighbourhoods`,
    "Transitional growth pocket": `A faster-changing neighbourhood than much of ${cityName}`,
    "Rental-tilted entry area": `One of ${cityName}'s more flexible renter-tilted entry points`,
    "Mature established neighbourhood": `One of ${cityName}'s more established long-hold neighbourhoods`
  };

  const base = archetypeLead[model.primaryArchetype] || `A differentiated neighbourhood in ${cityName}`;

  if (model.metrics.outsideCityPct >= 60) {
    return `${base}, but daily life depends heavily on commuting.`;
  }

  if (model.metrics.condoPct <= 10 && model.metrics.detachedPct >= 60) {
    return `${base}, but it offers very little housing flexibility.`;
  }

  if (model.metrics.olderStockPct >= 50) {
    return `${base}, but older-home upkeep is part of the package.`;
  }

  if (model.scores.turnover.value >= 60) {
    return `${base}, and turnover is higher than it first appears.`;
  }

  return `${base}.`;
}

function buildDecisionSummary(model: ScoredCityRow) {
  switch (model.primaryArchetype) {
    case "Family-first suburb":
      return `If you are buying around schools, bedroom capacity, and kid-heavy household mix, this is a serious contender in ${model.cityName}.`;
    case "Affluent stable enclave":
      return `If you want an established neighbourhood with stronger ownership depth and household buying power, this is one of the safer bets in ${model.cityName}.`;
    case "Commuter-connected suburb":
      return `If commute practicality matters more than neighbourhood theatre, this area deserves a close look.`;
    case "Transitional growth pocket":
      return `If you can tolerate change and churn in exchange for flexibility, this area is more dynamic than the settled pockets in ${model.cityName}.`;
    case "Rental-tilted entry area":
      return `If you need more housing flexibility than the detached-heavy parts of ${model.cityName}, this neighbourhood is easier to work with.`;
    default:
      return `If you are optimizing for long-hold ownership and established streets, this is one of the steadier options in ${model.cityName}.`;
  }
}

function buildWhatThisMeans(model: ScoredCityRow) {
  if (model.primaryArchetype === "Family-first suburb") {
    return `This is a capacity neighbourhood. You buy here for family logistics, larger homes, and a household base that is already built around children and routine. Do not force it to fit if you want condo flexibility or low-friction car-light living.`;
  }

  if (model.primaryArchetype === "Mature established neighbourhood") {
    return `This is a long-hold neighbourhood, not a short-term compromise. The payoff is stability and an established streetscape. The tradeoff is that older-home upkeep and limited housing flexibility are part of the deal.`;
  }

  if (model.primaryArchetype === "Commuter-connected suburb") {
    return `This neighbourhood works because movement works. If daily access matters, it can outperform more static parts of the city. But do not romanticize it as a lifestyle neighbourhood if commuting friction is the main constraint.`;
  }

  if (model.primaryArchetype === "Affluent stable enclave") {
    return `This is a conviction neighbourhood for owner-occupiers. The household profile, education depth, and lower churn all point toward buyers who want predictability, not constant turnover.`;
  }

  return `This neighbourhood has a clear profile. The useful question is not whether it is broadly good. The useful question is whether its strengths match the way your household actually lives.`;
}

function buildChooseThisIf(model: ScoredCityRow) {
  const items: string[] = [];

  if (model.scores.familyFit.percentile >= 70) {
    items.push("You are buying for family logistics, school access, and 3+ bedroom capacity.");
  }

  if (model.scores.stability.percentile >= 70) {
    items.push("You want an owner-led neighbourhood that rewards staying power.");
  }

  if (model.scores.commuterConvenience.percentile >= 70) {
    items.push("You need daily movement to be easier than in much of the city.");
  }

  if (model.scores.affluence.percentile >= 70) {
    items.push("You prefer neighbourhoods with stronger household buying power and education depth.");
  }

  if (model.scores.housingStockFit.percentile >= 70) {
    items.push("You need housing stock that actually supports family-sized living rather than forcing tradeoffs.");
  }

  if (!items.length) {
    items.push("You want a neighbourhood whose tradeoffs are understandable before you commit to a shortlist.");
  }

  return items.slice(0, 3);
}

function buildDoNotChooseIf(model: ScoredCityRow) {
  const items: string[] = [];

  if (model.metrics.condoPct <= 10) {
    items.push("You want condo flexibility or a low-maintenance housing mix. This neighbourhood will not give you much.");
  }

  if (model.scores.commuterConvenience.percentile <= 40) {
    items.push("You need low-friction commuting and car-light daily life. This is not that.");
  }

  if (model.metrics.olderStockPct >= 50) {
    items.push("You want newer-home simplicity. Older-home upkeep is part of the package here.");
  }

  if (model.scores.turnover.value >= 60) {
    items.push("You are optimizing for a settled, low-churn neighbourhood base.");
  }

  if (!items.length) {
    items.push("You are trying to solve for a completely different lifestyle than this neighbourhood was built to support.");
  }

  return items.slice(0, 3);
}

function buildBuyerStrategy(model: ScoredCityRow) {
  const items: string[] = [];

  if (model.scores.familyFit.percentile >= 70) {
    items.push("Prioritize homes closest to the strongest school and park clusters. The family infrastructure is part of the value, not a side detail.");
  }

  if (model.scores.housingStockFit.percentile >= 70) {
    items.push("Focus on 3+ bedroom stock first. That is where this neighbourhood’s fit is strongest.");
  }

  if (model.metrics.outsideCityPct >= 55) {
    items.push("Stress-test the actual commute before bidding. Do not assume suburban organization means easy daily movement.");
  }

  if (model.metrics.olderStockPct >= 50) {
    items.push("Underwrite inspections and capital work early. If you skip that discipline, the streetscape premium can mislead you.");
  }

  if (model.scores.stability.percentile >= 70) {
    items.push("Buy here if your horizon is at least five years. This is a long-hold neighbourhood, not a temporary compromise.");
  }

  if (!items.length) {
    items.push("Open the full signal breakdown before you shortlist properties here. The fit depends on matching the neighbourhood to your actual daily routine.");
  }

  return items.slice(0, 3);
}

function buildRiskFlags(model: ScoredCityRow) {
  const items: string[] = [];

  if (model.metrics.movedWithin5yrPct >= 50) {
    items.push(`${formatPercent(model.metrics.movedWithin5yrPct)} of households moved within five years. Expect more churn than the settled parts of the city.`);
  }

  if (model.metrics.outsideCityPct >= 55) {
    items.push(`${formatPercent(model.metrics.outsideCityPct)} of residents commute to another city. If your time budget is tight, this matters.`);
  }

  if (model.metrics.condoPct <= 10) {
    items.push(`${formatPercent(model.metrics.condoPct)} condo share means housing flexibility is thin. Downsizer and low-maintenance options are limited.`);
  }

  if (model.metrics.olderStockPct >= 50) {
    items.push(`${formatPercent(model.metrics.olderStockPct)} of homes were built before 1981. Older-home maintenance is not optional here.`);
  }

  if (model.metrics.renterPct >= 35) {
    items.push(`${formatPercent(model.metrics.renterPct)} renter share makes this less owner-led than the city’s steadier neighbourhoods.`);
  }

  if (!items.length) {
    items.push("No single risk overwhelms this neighbourhood in the current dataset, which means the decision should come down to fit rather than a red-flag metric.");
  }

  return items.slice(0, 4);
}

function buildEvidence(model: ScoredCityRow) {
  return [
    `${formatPercent(model.metrics.familySizedPct)} of homes have 3 or more bedrooms`,
    `${formatPercent(model.metrics.ownerPct)} owner-occupied homes`,
    `${formatPercent(model.metrics.income100kPlusPct)} of households earn $100k+`,
    `${formatNumber(model.metrics.schoolTotal)} local schools and ${formatNumber(model.metrics.parkFacilities)} park facilities`
  ];
}

function buildRankingBadges(model: ScoredCityRow) {
  const bestSignals = [...PRIMARY_SIGNAL_KEYS]
    .sort((a, b) => model.scores[a].rank - model.scores[b].rank)
    .slice(0, 2)
    .map((key) => ({
      tone: "positive" as const,
      text: `${topBucket(model.scores[key].rank, model.scores[key].total)} in ${model.cityName} for ${SIGNAL_LABELS[key]}`
    }));

  const weakestSignal = [...PRIMARY_SIGNAL_KEYS].sort((a, b) => model.scores[b].rank - model.scores[a].rank)[0];
  const warningBadge =
    model.scores[weakestSignal].rank > Math.ceil(model.scores[weakestSignal].total / 2)
      ? {
          tone: "warning" as const,
          text: `${bottomBucket(model.scores[weakestSignal].rank, model.scores[weakestSignal].total)} in ${model.cityName} for ${SIGNAL_LABELS[weakestSignal]}`
        }
      : null;

  return warningBadge ? [...bestSignals, warningBadge] : bestSignals;
}

function buildComparisonLines(model: ScoredCityRow, allRows: ScoredCityRow[]) {
  const lines: string[] = [];
  const strongestSignal = [...PRIMARY_SIGNAL_KEYS].sort((a, b) => model.scores[a].rank - model.scores[b].rank)[0];
  const weakestSignal = [...PRIMARY_SIGNAL_KEYS].sort((a, b) => model.scores[b].rank - model.scores[a].rank)[0];

  const lowerPeer = getNearestPeer(model, allRows, strongestSignal, "lower");
  if (lowerPeer) {
    lines.push(`Stronger for ${SIGNAL_LABELS[strongestSignal]} than ${lowerPeer.neighbourhood.name || lowerPeer.neighbourhood.slug}.`);
  }

  const higherPeer = getNearestPeer(model, allRows, weakestSignal, "higher");
  if (higherPeer) {
    lines.push(`Weaker for ${SIGNAL_LABELS[weakestSignal]} than ${higherPeer.neighbourhood.name || higherPeer.neighbourhood.slug}.`);
  }

  const affluencePeer = model.scores.affluence.percentile >= 60 ? getNearestPeer(model, allRows, "affluence", "lower") : null;
  if (affluencePeer) {
    lines.push(`Stronger for household buying power than ${affluencePeer.neighbourhood.name || affluencePeer.neighbourhood.slug}.`);
  }

  return lines.slice(0, 3);
}

function buildAlternatives(model: ScoredCityRow, allRows: ScoredCityRow[]): ComparisonAlternative[] {
  const picked = new Set<string>();
  const alternatives: ComparisonAlternative[] = [];

  const reasonBySignal: Array<{ key: SignalKey; reason: string }> = [
    { key: "familyFit", reason: "Stronger family fit" },
    { key: "stability", reason: "More established ownership pattern" },
    { key: "commuterConvenience", reason: "Easier commuting profile" }
  ];

  for (const item of reasonBySignal) {
    const candidate = allRows
      .filter((row) => row.neighbourhood.slug !== model.neighbourhood.slug && !picked.has(row.neighbourhood.slug))
      .sort((a, b) => b.scores[item.key].value - a.scores[item.key].value)[0];

    if (!candidate) continue;

    picked.add(candidate.neighbourhood.slug);
    alternatives.push({
      name: candidate.neighbourhood.name || candidate.neighbourhood.slug,
      href: `/${candidate.cityRouteSlug}/${candidate.neighbourhood.slug}`,
      reason: item.reason
    });
  }

  if (alternatives.length < 3) {
    const closest = allRows
      .filter((row) => row.neighbourhood.slug !== model.neighbourhood.slug && !picked.has(row.neighbourhood.slug))
      .sort((a, b) => {
        const scoreDistance = (candidate: ScoredCityRow) =>
          Math.abs(candidate.scores.familyFit.value - model.scores.familyFit.value) +
          Math.abs(candidate.scores.stability.value - model.scores.stability.value) +
          Math.abs(candidate.scores.commuterConvenience.value - model.scores.commuterConvenience.value);
        return scoreDistance(a) - scoreDistance(b);
      })[0];

    if (closest) {
      alternatives.push({
        name: closest.neighbourhood.name || closest.neighbourhood.slug,
        href: `/${closest.cityRouteSlug}/${closest.neighbourhood.slug}`,
        reason: "Similar profile, different tradeoff mix"
      });
    }
  }

  return alternatives.slice(0, 3);
}

function toDerivedModel(model: ScoredCityRow, allRows: ScoredCityRow[]): DerivedNeighbourhoodModel {
  return {
    cityName: model.cityName,
    cityRouteSlug: model.cityRouteSlug,
    neighbourhoodName: model.neighbourhood.name || model.neighbourhood.slug,
    neighbourhoodSlug: model.neighbourhood.slug,
    confidence: model.confidence,
    primaryArchetype: model.primaryArchetype,
    secondaryArchetypes: model.secondaryArchetypes,
    decisionTitle: buildDecisionTitle(model),
    decisionSummary: buildDecisionSummary(model),
    whatThisMeans: buildWhatThisMeans(model),
    chooseThisIf: buildChooseThisIf(model),
    doNotChooseIf: buildDoNotChooseIf(model),
    buyerStrategy: buildBuyerStrategy(model),
    riskFlags: buildRiskFlags(model),
    evidence: buildEvidence(model),
    rankingBadges: buildRankingBadges(model),
    comparisonLines: buildComparisonLines(model, allRows),
    alternatives: buildAlternatives(model, allRows),
    scores: model.scores,
    metrics: model.metrics
  };
}

export const getCityDerivedModels = cache((cityRouteSlug: string): DerivedNeighbourhoodModel[] => {
  const cityData = getCityByRouteSlug(cityRouteSlug);
  if (!cityData) return [];

  const scored = buildScoredCityModels(cityData);
  return scored.map((row) => toDerivedModel(row, scored));
});

export const getNeighbourhoodPageModel = cache((cityRouteSlug: string, neighbourhoodSlug: string) => {
  const cityData = getCityByRouteSlug(cityRouteSlug);
  if (!cityData) return null;

  const derivedModels = getCityDerivedModels(cityRouteSlug);
  const model = derivedModels.find((item) => item.neighbourhoodSlug === neighbourhoodSlug);
  const neighbourhood = cityData.neighbourhoods.find((item) => item.slug === neighbourhoodSlug);

  if (!model || !neighbourhood) return null;

  return {
    cityData,
    neighbourhood,
    model
  };
});

export const getCityRankingPageModel = cache((cityRouteSlug: string, rankingSlug: CityRankingSlug) => {
  const cityData = getCityByRouteSlug(cityRouteSlug);
  const definition = getCityRankingDefinition(rankingSlug);

  if (!cityData || !definition) return null;

  const items = [...getCityDerivedModels(cityRouteSlug)].sort((a, b) => b.scores[definition.signalKey].value - a.scores[definition.signalKey].value);

  return {
    cityData,
    definition,
    items
  };
});

export function getCityRankingParams() {
  return CITY_RANKING_PAGES.map((page) => page.slug);
}
