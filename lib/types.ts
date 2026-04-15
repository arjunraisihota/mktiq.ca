export type GenericPercentMap = Record<string, number>;

export interface NeighbourhoodSection {
  heading: string;
  items: string[];
  values: Record<string, number> | null;
}

export interface NeighbourhoodRecord {
  slug: string;
  city: string;
  name?: string;
  description?: string | null;
  schools?: {
    public?: number | null;
    catholic?: number | null;
    private?: number | null;
    special_programs?: string[] | null;
  };
  parks?: {
    count?: number | null;
    recreational_facilities?: number | null;
    avg_facilities_per_park?: number | null;
  };
  transit?: {
    stops?: number | null;
  };
  demographics?: {
    families_with_kids_pct?: number | null;
    couples_no_kids_pct?: number | null;
    one_person_household_pct?: number | null;
  };
  education?: {
    bachelors_or_higher_pct?: number | null;
    any_postsecondary_pct?: number | null;
  };
  housing?: {
    moved_within_5yr_pct?: number | null;
    moved_within_1yr_pct?: number | null;
  };
  homes?: {
    summary?: string | null;
    home_types_pct?: GenericPercentMap | null;
    condominium_status_pct?: GenericPercentMap | null;
    bedrooms_pct?: GenericPercentMap | null;
    construction_period_pct?: GenericPercentMap | null;
    tenure_pct?: GenericPercentMap | null;
    mostly_older_homes?: boolean | null;
    mostly_renter_occupied?: boolean | null;
  };
  sections?: Record<string, NeighbourhoodSection> | null;
  section_summaries?: Record<string, string> | null;
  popular_with?: string[] | null;
  url?: string;
  scraped_at?: string;
}

export interface CityDataFile {
  city: string;
  city_slug: string;
  scraped_at?: string;
  neighbourhood_count?: number;
  neighbourhoods: NeighbourhoodRecord[];
}

export interface CityIndexItem {
  cityName: string;
  citySlug: string;
  cityRouteSlug: string;
  fileName: string;
  neighbourhoodCount: number;
}

export interface CityPageData extends CityIndexItem {
  intro: string;
  neighbourhoods: NeighbourhoodRecord[];
}

export type SignalKey =
  | "familyFit"
  | "stability"
  | "commuterConvenience"
  | "affluence"
  | "turnover"
  | "housingStockFit"
  | "regionalCommuterDependence";

export interface SignalRank {
  value: number;
  rank: number;
  total: number;
  percentile: number;
}

export interface BaseMetricSnapshot {
  ownerPct: number;
  renterPct: number;
  familySizedPct: number;
  kidsPct: number;
  schoolTotal: number;
  parkFacilities: number;
  transitStops: number;
  shortCommutePct: number;
  walkBikePct: number;
  transitSharePct: number;
  withinCityPct: number;
  outsideCityPct: number;
  longCommutePct: number;
  income100kPlusPct: number;
  newerStockPct: number;
  olderStockPct: number;
  detachedPct: number;
  condoPct: number;
  movedWithin1yrPct: number;
  movedWithin5yrPct: number;
  bachelorsPct: number;
  postsecondaryPct: number;
}

export interface ScoredNeighbourhoodModel {
  cityName: string;
  cityRouteSlug: string;
  neighbourhood: NeighbourhoodRecord;
  metrics: BaseMetricSnapshot;
  scores: Record<SignalKey, SignalRank>;
  confidence: "High" | "Medium" | "Low";
  primaryArchetype: string;
  secondaryArchetypes: string[];
}

export interface RankingBadge {
  text: string;
  tone: "positive" | "warning";
}

export interface ComparisonAlternative {
  name: string;
  href: string;
  reason: string;
}

export interface DerivedNeighbourhoodModel {
  cityName: string;
  cityRouteSlug: string;
  neighbourhoodName: string;
  neighbourhoodSlug: string;
  confidence: "High" | "Medium" | "Low";
  primaryArchetype: string;
  secondaryArchetypes: string[];
  decisionTitle: string;
  decisionSummary: string;
  whatThisMeans: string;
  chooseThisIf: string[];
  doNotChooseIf: string[];
  buyerStrategy: string[];
  riskFlags: string[];
  evidence: string[];
  rankingBadges: RankingBadge[];
  comparisonLines: string[];
  alternatives: ComparisonAlternative[];
  scores: Record<SignalKey, SignalRank>;
  metrics: BaseMetricSnapshot;
}
