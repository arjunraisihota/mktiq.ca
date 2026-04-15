export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeCityRouteSlug(citySlug: string, cityName: string): string {
  const cleaned = citySlug.replace(/-(on|ontario|ca)$/i, "");
  return toSlug(cleaned || cityName);
}

export function titleCaseKey(input: string): string {
  return input
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatNumber(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  return new Intl.NumberFormat("en-CA").format(value);
}

export function formatPercent(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  return `${value}%`;
}

/** Returns null for missing/zero values so StatGrid can skip the tile entirely. */
export function formatPercentOrNull(value?: number | null): string | null {
  if (value === null || value === undefined || Number.isNaN(value) || value === 0) {
    return null;
  }
  return `${value}%`;
}

export function cleanText(value?: string | null): string {
  if (!value) return "Data not available for this neighbourhood yet.";
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : "Data not available for this neighbourhood yet.";
}
