import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityRankingPageView } from "@/components/city-ranking-page-view";
import { SchemaScript } from "@/components/schema-script";
import { getAllRouteParams } from "@/lib/data";
import { getCityRankingPageModel } from "@/lib/page-model";
import { getCityRankingDefinition, renderCityRankingText } from "@/lib/rankings";
import { absoluteUrl, breadcrumbSchema, cityCollectionMetadata, itemListSchema } from "@/lib/seo";

interface RankingPageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return getAllRouteParams().cityParams;
}

export async function generateMetadata({ params }: RankingPageProps): Promise<Metadata> {
  const { city } = await params;
  const page = getCityRankingPageModel(city, "most-stable");
  const definition = getCityRankingDefinition("most-stable");
  if (!page || !definition) return {};

  const title = `${renderCityRankingText(definition.titleTemplate, page.cityData.cityName)} | mktIQ`;
  const description = renderCityRankingText(definition.descriptionTemplate, page.cityData.cityName);
  return cityCollectionMetadata(title, description, `/${page.cityData.cityRouteSlug}/most-stable`);
}

export default async function MostStablePage({ params }: RankingPageProps) {
  const { city } = await params;
  const page = getCityRankingPageModel(city, "most-stable");
  const definition = getCityRankingDefinition("most-stable");
  if (!page || !definition) notFound();

  const title = renderCityRankingText(definition.titleTemplate, page.cityData.cityName);
  const intro = renderCityRankingText(definition.descriptionTemplate, page.cityData.cityName);

  return (
    <>
      <SchemaScript
        data={breadcrumbSchema([
          { name: "Home", url: absoluteUrl("/") },
          { name: page.cityData.cityName, url: absoluteUrl(`/${page.cityData.cityRouteSlug}`) },
          { name: title, url: absoluteUrl(`/${page.cityData.cityRouteSlug}/most-stable`) }
        ])}
      />
      <SchemaScript
        data={itemListSchema(
          page.items.slice(0, 10).map((item) => ({
            name: item.neighbourhoodName,
            url: absoluteUrl(`/${page.cityData.cityRouteSlug}/${item.neighbourhoodSlug}`)
          }))
        )}
      />
      <CityRankingPageView
        cityName={page.cityData.cityName}
        cityRouteSlug={page.cityData.cityRouteSlug}
        activeSlug="most-stable"
        title={title}
        intro={intro}
        items={page.items}
      />
    </>
  );
}
