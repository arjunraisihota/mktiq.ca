import Link from "next/link";
import type { NeighbourhoodRecord, ScoredNeighbourhoodModel } from "@/lib/types";

interface Props {
  cityRouteSlug: string;
  neighbourhoods: NeighbourhoodRecord[];
  scoredModels?: ScoredNeighbourhoodModel[];
  title?: string;
}

const ARCHETYPE_STYLES: Record<string, { bg: string; text: string; bar: string }> = {
  "Family-first suburb":           { bg: "bg-amber-50",   text: "text-amber-700",  bar: "bg-amber-400" },
  "Affluent stable enclave":       { bg: "bg-violet-50",  text: "text-violet-700", bar: "bg-violet-400" },
  "Commuter-connected suburb":     { bg: "bg-blue-50",    text: "text-blue-700",   bar: "bg-blue-400" },
  "Transitional growth pocket":    { bg: "bg-orange-50",  text: "text-orange-700", bar: "bg-orange-400" },
  "Rental-tilted entry area":      { bg: "bg-slate-100",  text: "text-slate-600",  bar: "bg-slate-400" },
  "Mature established neighbourhood": { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" },
};

const SCORE_LABELS: Array<{ key: "familyFit" | "stability" | "commuterConvenience"; label: string }> = [
  { key: "familyFit", label: "Family" },
  { key: "stability", label: "Stability" },
  { key: "commuterConvenience", label: "Commute" },
];

export function NeighbourhoodGrid({ cityRouteSlug, neighbourhoods, scoredModels, title = "Neighbourhoods" }: Props) {
  if (!neighbourhoods.length) return null;

  const scoresBySlug = scoredModels
    ? Object.fromEntries(scoredModels.map((m) => [m.neighbourhood.slug, m]))
    : {};

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {neighbourhoods.map((n) => {
          const scored = scoresBySlug[n.slug];
          const archetype = scored?.primaryArchetype;
          const style = archetype ? ARCHETYPE_STYLES[archetype] : null;

          return (
            <Link
              key={n.slug}
              href={`/${cityRouteSlug}/${n.slug}`}
              className="group flex flex-col gap-2 rounded-lg border border-edge bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-ink group-hover:text-brand transition-colors">{n.name || n.slug}</p>
                {archetype && style && (
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${style.bg} ${style.text}`}>
                    {archetype.replace(" neighbourhood", "").replace(" suburb", "").replace(" enclave", "")}
                  </span>
                )}
              </div>

              <p className="line-clamp-2 text-sm text-stone">
                {n.description || "Demographic and housing profile."}
              </p>

              {scored && (
                <div className="mt-1 space-y-1.5">
                  {SCORE_LABELS.map(({ key, label }) => {
                    const score = scored.scores[key];
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-[10px] font-medium text-stone">{label}</span>
                        <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                          <div
                            className={`h-1.5 rounded-full ${style?.bar ?? "bg-brand"}`}
                            style={{ width: `${score.value}%` }}
                          />
                        </div>
                        <span className="w-7 text-right text-[10px] text-stone">{score.value}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
