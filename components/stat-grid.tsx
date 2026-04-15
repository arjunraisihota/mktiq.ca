import { titleCaseKey } from "@/lib/utils";

interface StatGridProps {
  title: string;
  stats: Record<string, string | number | null | undefined>;
  whatThisMeans?: string;
  labelMap?: Record<string, string>;
  compact?: boolean;
}

export function StatGrid({ title, stats, whatThisMeans, labelMap, compact }: StatGridProps) {
  const entries = Object.entries(stats).filter(([, value]) => {
    if (value === null || value === undefined || value === "") return false;
    const str = String(value).trim();
    if (str === "N/A" || str === "0%" || str === "0") return false;
    return true;
  });

  if (!entries.length) return null;

  return (
    <section className={`rounded-xl border border-edge bg-white shadow-card ${compact ? "p-4" : "p-6"}`}>
      <h2 className={`font-semibold text-ink ${compact ? "text-base" : "text-lg"}`}>{title}</h2>
      {!compact && whatThisMeans ? (
        <p className="mt-2 text-sm text-stone">
          <span className="font-semibold text-ink">What this means:</span> {whatThisMeans}
        </p>
      ) : null}
      <div className={`mt-3 grid ${compact ? "gap-2 grid-cols-2" : "gap-3 sm:grid-cols-2 lg:grid-cols-3"}`}>
        {entries.map(([key, value]) => (
          <div key={key} className="rounded-lg border border-edge/80 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-stone">{labelMap?.[key] || titleCaseKey(key)}</p>
            <p className={`mt-1 font-semibold text-ink ${compact ? "text-sm" : "text-base"}`}>{String(value)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
