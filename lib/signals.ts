import type {
  BaseMetricSnapshot,
  CityPageData,
  NeighbourhoodRecord,
  ScoredNeighbourhoodModel,
  SignalKey,
  SignalRank
} from "@/lib/types";

export const SIGNAL_LABELS: Record<SignalKey, string> = {
  familyFit: "family fit",
  stability: "stability",
  commuterConvenience: "commuter convenience",
  affluence: "household buying power",
  turnover: "turnover",
  housingStockFit: "family-sized housing stock",
  regionalCommuterDependence: "commuter dependence"
};

export const PRIMARY_SIGNAL_KEYS: SignalKey[] = ["familyFit", "stability", "commuterConvenience", "affluence", "housingStockFit"];

type RawScoreMap = Record<SignalKey, number>;

function pct(value?: number | null): number {
  return value ?? 0;
}

function sum(...values: Array<number | null | undefined>): number {
  return values.reduce<number>((acc, value) => acc + pct(value), 0);
}

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function descendingRank(values: number[], currentValue: number): number {
  const sorted = [...values].sort((a, b) => b - a);
  const index = sorted.findIndex((value) => value === currentValue);
  return index >= 0 ? index + 1 : sorted.length;
}

function rankPercentile(rank: number, total: number): number {
  if (!total) return 0;
  return Math.round(((total - rank + 1) / total) * 100);
}

function rawPercentile(values: number[], currentValue: number): number {
  const rank = descendingRank(values, currentValue);
  return rankPercentile(rank, values.length);
}

function computeTenure(neighbourhood: NeighbourhoodRecord) {
  const owner = neighbourhood.sections?.renters_and_owners?.values?.owner;
  const renter = neighbourhood.sections?.renters_and_owners?.values?.renter;

  if (owner !== undefined || renter !== undefined) {
    return {
      ownerPct: pct(owner),
      renterPct: pct(renter)
    };
  }

  if (neighbourhood.homes?.mostly_renter_occupied === true) {
    return {
      ownerPct: 35,
      renterPct: 65
    };
  }

  return {
    ownerPct: 50,
    renterPct: 50
  };
}

function computeKidsPct(neighbourhood: NeighbourhoodRecord): number {
  const broad = neighbourhood.sections?.broad_age_ranges?.values?.["0_to_14_years"];
  if (broad !== undefined) return pct(broad);

  return sum(
    neighbourhood.sections?.specific_age_groups?.values?.["0_to_4_years"],
    neighbourhood.sections?.specific_age_groups?.values?.["5_to_9_years"],
    neighbourhood.sections?.specific_age_groups?.values?.["10_to_14_years"]
  );
}

function computeMetrics(neighbourhood: NeighbourhoodRecord): BaseMetricSnapshot {
  const tenure = computeTenure(neighbourhood);

  return {
    ownerPct: tenure.ownerPct,
    renterPct: tenure.renterPct,
    familySizedPct: sum(neighbourhood.homes?.bedrooms_pct?.["3_bedrooms"], neighbourhood.homes?.bedrooms_pct?.["4_or_more_bedrooms"]),
    kidsPct: computeKidsPct(neighbourhood),
    schoolTotal: sum(neighbourhood.schools?.public, neighbourhood.schools?.catholic, neighbourhood.schools?.private),
    parkFacilities: pct(neighbourhood.parks?.recreational_facilities),
    transitStops: pct(neighbourhood.transit?.stops),
    shortCommutePct: sum(
      neighbourhood.sections?.commute_times_of_residents?.values?.["less_than_15_minutes"],
      neighbourhood.sections?.commute_times_of_residents?.values?.["15_to_29_minutes"]
    ),
    walkBikePct: pct(neighbourhood.sections?.commute_types?.values?.walk_bike),
    transitSharePct: pct(neighbourhood.sections?.commute_types?.values?.transit),
    withinCityPct: pct(neighbourhood.sections?.commute_destination_for_residents?.values?.commute_within_the_city),
    outsideCityPct: pct(neighbourhood.sections?.commute_destination_for_residents?.values?.commute_to_another_city),
    longCommutePct: pct(neighbourhood.sections?.commute_times_of_residents?.values?.["60_minutes_and_over"]),
    income100kPlusPct: sum(
      neighbourhood.sections?.household_income?.values?.["100_000_to_124_999"],
      neighbourhood.sections?.household_income?.values?.["125_000_to_149_999"],
      neighbourhood.sections?.household_income?.values?.["150_000_to_199_999"],
      neighbourhood.sections?.household_income?.values?.["200_000_and_over"]
    ),
    newerStockPct: sum(
      neighbourhood.homes?.construction_period_pct?.["2001_to_2005"],
      neighbourhood.homes?.construction_period_pct?.["2006_to_2010"],
      neighbourhood.homes?.construction_period_pct?.["2011_to_2016"]
    ),
    olderStockPct: sum(
      neighbourhood.homes?.construction_period_pct?.["1960_or_before"],
      neighbourhood.homes?.construction_period_pct?.["1961_to_1980"]
    ),
    detachedPct: pct(neighbourhood.homes?.home_types_pct?.single_detached_house),
    condoPct:
      pct(neighbourhood.sections?.condominium_status?.values?.condominium) ||
      pct(neighbourhood.homes?.condominium_status_pct?.condominium) ||
      sum(neighbourhood.homes?.home_types_pct?.low_rise_apartment_condo, neighbourhood.homes?.home_types_pct?.high_rise_apartment_condo),
    movedWithin1yrPct: pct(neighbourhood.housing?.moved_within_1yr_pct),
    movedWithin5yrPct: pct(neighbourhood.housing?.moved_within_5yr_pct),
    bachelorsPct: pct(neighbourhood.education?.bachelors_or_higher_pct),
    postsecondaryPct: pct(neighbourhood.education?.any_postsecondary_pct)
  };
}

function classifyArchetypes(metrics: BaseMetricSnapshot, scores: RawScoreMap) {
  const matches: string[] = [];

  if (scores.familyFit >= 70 && scores.housingStockFit >= 65 && metrics.ownerPct >= 70 && metrics.kidsPct >= 18) {
    matches.push("Family-first suburb");
  }

  if (scores.affluence >= 65 && scores.stability >= 65 && metrics.ownerPct >= 80 && metrics.income100kPlusPct >= 45) {
    matches.push("Affluent stable enclave");
  }

  if (metrics.outsideCityPct >= 55 && scores.commuterConvenience >= 45 && metrics.shortCommutePct >= 40) {
    matches.push("Commuter-connected suburb");
  }

  if (scores.turnover >= 60 && (metrics.movedWithin5yrPct >= 50 || metrics.movedWithin1yrPct >= 14 || metrics.newerStockPct >= 35)) {
    matches.push("Transitional growth pocket");
  }

  if (metrics.renterPct >= 35 || metrics.condoPct >= 25) {
    matches.push("Rental-tilted entry area");
  }

  if (scores.stability >= 65 && (metrics.olderStockPct >= 50 || metrics.movedWithin5yrPct <= 40) && metrics.ownerPct >= 70) {
    matches.push("Mature established neighbourhood");
  }

  if (!matches.length) {
    if (scores.familyFit >= scores.stability && scores.familyFit >= scores.commuterConvenience) {
      matches.push("Family-first suburb");
    } else if (scores.stability >= scores.commuterConvenience) {
      matches.push("Mature established neighbourhood");
    } else {
      matches.push("Commuter-connected suburb");
    }
  }

  return {
    primaryArchetype: matches[0],
    secondaryArchetypes: matches.slice(1, 3)
  };
}

function computeConfidence(neighbourhood: NeighbourhoodRecord): "High" | "Medium" | "Low" {
  const requiredInputs = [
    neighbourhood.demographics?.families_with_kids_pct,
    neighbourhood.education?.bachelors_or_higher_pct,
    neighbourhood.education?.any_postsecondary_pct,
    neighbourhood.housing?.moved_within_5yr_pct,
    neighbourhood.housing?.moved_within_1yr_pct,
    neighbourhood.homes?.bedrooms_pct?.["3_bedrooms"],
    neighbourhood.homes?.bedrooms_pct?.["4_or_more_bedrooms"],
    neighbourhood.homes?.construction_period_pct?.["2006_to_2010"],
    neighbourhood.transit?.stops,
    neighbourhood.sections?.household_income?.values?.["100_000_to_124_999"],
    neighbourhood.sections?.commute_types?.values?.vehicle,
    neighbourhood.sections?.renters_and_owners?.values?.owner
  ];

  const presentInputs = requiredInputs.filter((value) => value !== null && value !== undefined).length;
  const completeness = presentInputs / requiredInputs.length;

  if (completeness >= 0.85) return "High";
  if (completeness >= 0.65) return "Medium";
  return "Low";
}

export function buildScoredCityModels(cityData: CityPageData): ScoredNeighbourhoodModel[] {
  const metricRows = cityData.neighbourhoods.map((neighbourhood) => ({
    neighbourhood,
    metrics: computeMetrics(neighbourhood)
  }));

  const schoolValues = metricRows.map((row) => row.metrics.schoolTotal);
  const parkValues = metricRows.map((row) => row.metrics.parkFacilities);
  const transitStopValues = metricRows.map((row) => row.metrics.transitStops);

  const rawRows = metricRows.map((row) => {
    const schoolPercentile = rawPercentile(schoolValues, row.metrics.schoolTotal);
    const parkPercentile = rawPercentile(parkValues, row.metrics.parkFacilities);
    const transitStopPercentile = rawPercentile(transitStopValues, row.metrics.transitStops);

    const rawScores: RawScoreMap = {
      familyFit: clamp100(
        0.3 * pct(row.neighbourhood.demographics?.families_with_kids_pct) +
          0.2 * row.metrics.familySizedPct +
          0.15 * row.metrics.kidsPct +
          0.2 * schoolPercentile +
          0.15 * parkPercentile
      ),
      stability: clamp100(
        0.35 * row.metrics.ownerPct +
          0.35 * (100 - row.metrics.movedWithin5yrPct) +
          0.2 * (100 - Math.min(100, row.metrics.movedWithin1yrPct * 4)) +
          0.1 * row.metrics.detachedPct
      ),
      commuterConvenience: clamp100(
        0.3 * row.metrics.shortCommutePct +
          0.2 * row.metrics.transitSharePct +
          0.2 * transitStopPercentile +
          0.1 * row.metrics.walkBikePct +
          0.1 * row.metrics.withinCityPct +
          0.1 * (100 - row.metrics.longCommutePct)
      ),
      affluence: clamp100(
        0.5 * row.metrics.income100kPlusPct + 0.25 * row.metrics.bachelorsPct + 0.25 * row.metrics.postsecondaryPct
      ),
      turnover: clamp100(
        0.45 * row.metrics.movedWithin5yrPct +
          0.25 * Math.min(100, row.metrics.movedWithin1yrPct * 4) +
          0.15 * row.metrics.renterPct +
          0.15 * row.metrics.newerStockPct
      ),
      housingStockFit: clamp100(0.4 * row.metrics.familySizedPct + 0.35 * row.metrics.detachedPct + 0.25 * row.metrics.newerStockPct),
      regionalCommuterDependence: clamp100(row.metrics.outsideCityPct)
    };

    return {
      neighbourhood: row.neighbourhood,
      metrics: row.metrics,
      confidence: computeConfidence(row.neighbourhood),
      rawScores,
      ...classifyArchetypes(row.metrics, rawScores)
    };
  });

  const signalKeys = Object.keys(rawRows[0]?.rawScores || {}) as SignalKey[];

  return rawRows.map((row) => {
    const scores = signalKeys.reduce<Record<SignalKey, SignalRank>>((acc, key) => {
      const values = rawRows.map((item) => item.rawScores[key]);
      const rank = descendingRank(values, row.rawScores[key]);
      acc[key] = {
        value: row.rawScores[key],
        rank,
        total: values.length,
        percentile: rankPercentile(rank, values.length)
      };
      return acc;
    }, {} as Record<SignalKey, SignalRank>);

    return {
      cityName: cityData.cityName,
      cityRouteSlug: cityData.cityRouteSlug,
      neighbourhood: row.neighbourhood,
      metrics: row.metrics,
      scores,
      confidence: row.confidence,
      primaryArchetype: row.primaryArchetype,
      secondaryArchetypes: row.secondaryArchetypes
    } satisfies ScoredNeighbourhoodModel;
  });
}
