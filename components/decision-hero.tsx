import { SaveShortlistButton } from "@/components/save-shortlist-button";
import type { DerivedNeighbourhoodModel } from "@/lib/types";

interface DecisionHeroProps {
  cityName: string;
  neighbourhoodName: string;
  model: DerivedNeighbourhoodModel;
}

const scoreCards = [
  { key: "familyFit", label: "Family Fit", color: "bg-amber-400" },
  { key: "stability", label: "Stability", color: "bg-green-500" },
  { key: "commuterConvenience", label: "Commuter Fit", color: "bg-blue-400" }
] as const;

const ARCHETYPE_BADGE: Record<string, { bg: string; text: string }> = {
  "Family-first suburb":              { bg: "bg-amber-100",  text: "text-amber-800" },
  "Affluent stable enclave":          { bg: "bg-violet-100", text: "text-violet-800" },
  "Commuter-connected suburb":        { bg: "bg-blue-100",   text: "text-blue-800" },
  "Transitional growth pocket":       { bg: "bg-orange-100", text: "text-orange-800" },
  "Rental-tilted entry area":         { bg: "bg-slate-100",  text: "text-slate-700" },
  "Mature established neighbourhood": { bg: "bg-green-100",  text: "text-green-800" },
};

export function DecisionHero({ cityName, neighbourhoodName, model }: DecisionHeroProps) {
  const archetypeStyle = ARCHETYPE_BADGE[model.primaryArchetype] ?? { bg: "bg-slate-100", text: "text-ink" };

  return (
    <section className="rounded-2xl border border-edge bg-white p-6 shadow-card md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Neighbourhood Decision</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.1em]">
        <span className={`rounded-full px-3 py-1 ${archetypeStyle.bg} ${archetypeStyle.text}`}>{model.primaryArchetype}</span>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-brand">{model.confidence} confidence</span>
      </div>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        {neighbourhoodName}, {cityName}
      </h1>
      <p className="mt-3 max-w-4xl text-xl font-semibold leading-snug text-ink">{model.decisionTitle}</p>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-stone md:text-lg">{model.decisionSummary}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SaveShortlistButton model={model} />
        <p className="text-sm text-stone">Save to shortlist and compare with other areas.</p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {scoreCards.map((card) => {
          const score = model.scores[card.key];

          return (
            <div key={card.key} className="rounded-xl border border-edge bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                #{score.rank}
                <span className="ml-1 text-sm font-medium text-stone">/ {score.total}</span>
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full ${card.color}`}
                  style={{ width: `${score.value}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-stone">{score.value} / 100</p>
            </div>
          );
        })}
      </div>

      {model.rankingBadges.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {model.rankingBadges.map((badge) => (
            <span
              key={badge.text}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                badge.tone === "warning" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-ink"
              }`}
            >
              {badge.text}
            </span>
          ))}
        </div>
      ) : null}

      {model.comparisonLines.length ? (
        <div className="mt-6 rounded-xl border border-edge bg-slate-50 p-4">
          <p className="text-sm font-semibold text-ink">Better / worse than</p>
          <ul className="mt-2 space-y-2 text-sm text-stone">
            {model.comparisonLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
