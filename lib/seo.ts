import type { Metadata } from "next";

const SITE_NAME = "mktIQ";
const SITE_URL = "https://www.mktiq.ca";
const METADATA_BASE = new URL(SITE_URL);

export function absoluteUrl(pathname: string): string {
  return `${SITE_URL}${pathname}`;
}

export function homeMetadata(): Metadata {
  const title = "mktIQ | Ontario Neighbourhood Intelligence for Real Estate Discovery";
  const description =
    "mktIQ breaks down Ontario neighbourhoods by household composition, housing mix, income, and transit — so you can compare areas and decide with confidence."

  return {
    metadataBase: METADATA_BASE,
    title,
    description,
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      title,
      description,
      url: absoluteUrl("/"),
      siteName: SITE_NAME,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export function cityMetadata(cityName: string, citySlug: string): Metadata {
  const title = `${cityName} Neighbourhood Guide, Demographics & Real Estate Data | mktIQ`;
  const description = `Compare ${cityName} neighbourhoods on household composition, income signals, housing mix, and commute access. Make a sharper decision on where to buy.`;
  const path = `/${citySlug}`;

  return {
    metadataBase: METADATA_BASE,
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: "mktIQ",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export function neighbourhoodMetadata(cityName: string, citySlug: string, neighbourhoodName: string, neighbourhoodSlug: string): Metadata {
  const title = `${neighbourhoodName}, ${cityName} Demographics & Neighbourhood Guide | mktIQ`;
  const description = `${neighbourhoodName} in ${cityName} — household breakdown, income profile, housing mix, and transit access. Everything you need to evaluate fit before you commit.`;
  const path = `/${citySlug}/${neighbourhoodSlug}`;

  return {
    metadataBase: METADATA_BASE,
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: "mktIQ",
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export function cityCollectionMetadata(title: string, description: string, pathname: string): Metadata {
  return {
    metadataBase: METADATA_BASE,
    title,
    description,
    alternates: { canonical: absoluteUrl(pathname) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(pathname),
      siteName: SITE_NAME,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "mktIQ",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description: "Data-driven Ontario neighbourhood intelligence platform for real estate research."
  };
}

export function cityPlaceSchema(cityName: string, cityUrl: string, neighbourhoodCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${cityName}, Ontario`,
    url: cityUrl,
    description: `${cityName} neighbourhood intelligence and real estate market context from mktIQ.`,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Neighbourhood profiles",
        value: neighbourhoodCount
      }
    ]
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function itemListSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url
    }))
  };
}
