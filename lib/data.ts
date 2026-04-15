import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { CityDataFile, CityIndexItem, CityPageData, NeighbourhoodRecord } from "@/lib/types";
import { cleanText, normalizeCityRouteSlug, toSlug } from "@/lib/utils";

const DATA_DIR_CANDIDATES = [
  path.join(process.cwd(), "data", "cities"),
  path.join(process.cwd(), "output"),
  path.join(process.cwd(), "..", "output")
];

function getDataDir(): string {
  for (const dir of DATA_DIR_CANDIDATES) {
    if (fs.existsSync(dir)) return dir;
  }
  throw new Error("No city data directory found. Add JSON files to data/cities.");
}

function readCityFile(fileName: string): CityDataFile {
  const filePath = path.join(getDataDir(), fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as CityDataFile;
}

function buildCityIntro(cityName: string, neighbourhoodCount: number): string {
  return `${cityName} has ${neighbourhoodCount} distinct neighbourhoods, each with a different demographic mix, housing profile, and commute dynamic. Use the guides below to narrow your shortlist.`;
}

export const getCityIndex = cache((): CityIndexItem[] => {
  const dir = getDataDir();
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json"));

  const items = files
    .map((fileName) => {
      const city = readCityFile(fileName);
      const cityName = city.city || toSlug(fileName).replace(/-/g, " ");
      const citySlug = city.city_slug || fileName.replace(/\.json$/, "");
      const cityRouteSlug = normalizeCityRouteSlug(citySlug, cityName);

      return {
        cityName,
        citySlug,
        cityRouteSlug,
        fileName,
        neighbourhoodCount: city.neighbourhoods?.length ?? city.neighbourhood_count ?? 0
      };
    })
    .sort((a, b) => a.cityName.localeCompare(b.cityName));

  return items;
});

export const getCityByRouteSlug = cache((cityRouteSlug: string): CityPageData | null => {
  const cityItem = getCityIndex().find((item) => {
    return item.cityRouteSlug === cityRouteSlug || item.citySlug === cityRouteSlug;
  });

  if (!cityItem) return null;

  const cityFile = readCityFile(cityItem.fileName);

  return {
    ...cityItem,
    intro: buildCityIntro(cityItem.cityName, cityItem.neighbourhoodCount),
    neighbourhoods: (cityFile.neighbourhoods || []).map((n) => ({
      ...n,
      slug: toSlug(n.slug || n.name || "unknown"),
      name: n.name || "Unknown neighbourhood",
      description: cleanText(n.description)
    }))
  };
});

export const getNeighbourhoodBySlug = cache(
  (cityRouteSlug: string, neighbourhoodSlug: string): { city: CityPageData; neighbourhood: NeighbourhoodRecord } | null => {
    const city = getCityByRouteSlug(cityRouteSlug);
    if (!city) return null;

    const neighbourhood = city.neighbourhoods.find((n) => n.slug === neighbourhoodSlug);
    if (!neighbourhood) return null;

    return { city, neighbourhood };
  }
);

export const getAllRouteParams = cache(() => {
  const cities = getCityIndex();
  const cityParams = cities.map((city) => ({ city: city.cityRouteSlug }));

  const neighbourhoodParams = cities.flatMap((city) => {
    const cityData = getCityByRouteSlug(city.cityRouteSlug);
    if (!cityData) return [];
    return cityData.neighbourhoods.map((n) => ({
      city: city.cityRouteSlug,
      neighbourhood: n.slug
    }));
  });

  return { cityParams, neighbourhoodParams };
});

export function getRelatedCities(currentCityRouteSlug: string, count = 4): CityIndexItem[] {
  return getCityIndex().filter((city) => city.cityRouteSlug !== currentCityRouteSlug).slice(0, count);
}

export function getPopularNeighbourhoods(limit = 8): Array<{
  cityName: string;
  cityRouteSlug: string;
  neighbourhoodSlug: string;
  neighbourhoodName: string;
  score: number;
}> {
  const rows = getCityIndex().flatMap((city) => {
    const cityData = getCityByRouteSlug(city.cityRouteSlug);
    if (!cityData) return [];

    return cityData.neighbourhoods.map((n) => {
      const score =
        (n.transit?.stops || 0) +
        (n.schools?.public || 0) * 5 +
        (n.parks?.recreational_facilities || 0);

      return {
        cityName: cityData.cityName,
        cityRouteSlug: cityData.cityRouteSlug,
        neighbourhoodSlug: n.slug,
        neighbourhoodName: n.name || n.slug,
        score
      };
    });
  });

  return rows.sort((a, b) => b.score - a.score).slice(0, limit);
}
