import type { MetadataRoute } from "next";
import { getAllRouteParams } from "@/lib/data";
import { CITY_RANKING_PAGES } from "@/lib/rankings";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const { cityParams, neighbourhoodParams } = getAllRouteParams();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1
    }
  ];

  const cityRoutes: MetadataRoute.Sitemap = cityParams.map((param) => ({
    url: absoluteUrl(`/${param.city}`),
    changeFrequency: "weekly",
    priority: 0.9
  }));

  const neighbourhoodRoutes: MetadataRoute.Sitemap = neighbourhoodParams.map((param) => ({
    url: absoluteUrl(`/${param.city}/${param.neighbourhood}`),
    changeFrequency: "weekly",
    priority: 0.8
  }));

  const rankingRoutes: MetadataRoute.Sitemap = cityParams.flatMap((param) =>
    CITY_RANKING_PAGES.map((page) => ({
      url: absoluteUrl(`/${param.city}/${page.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.75
    }))
  );

  return [...staticRoutes, ...cityRoutes, ...neighbourhoodRoutes, ...rankingRoutes];
}
