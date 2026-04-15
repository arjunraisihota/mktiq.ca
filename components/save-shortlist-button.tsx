"use client";

import type { DerivedNeighbourhoodModel } from "@/lib/types";
import { useShortlist } from "@/components/shortlist-context";

interface SaveShortlistButtonProps {
  model: DerivedNeighbourhoodModel;
  variant?: "primary" | "secondary";
  className?: string;
}

export function SaveShortlistButton({ model, variant = "primary", className }: SaveShortlistButtonProps) {
  const { hydrated, isSaved, toggleItem } = useShortlist();
  const saved = hydrated && isSaved(model.cityRouteSlug, model.neighbourhoodSlug);
  const baseClassName = "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition";
  const stateClassName =
    variant === "secondary"
      ? saved
        ? "border border-edge bg-slate-100 text-ink hover:bg-slate-200"
        : "border border-ink bg-ink text-white hover:bg-slate-800"
      : saved
        ? "border border-edge bg-white text-ink hover:bg-slate-50"
        : "bg-ink text-white hover:bg-slate-800";
  const resolvedClassName = className ? `${baseClassName} ${stateClassName} ${className}` : `${baseClassName} ${stateClassName}`;

  return (
    <button
      type="button"
      onClick={() => toggleItem(model)}
      className={resolvedClassName}
      aria-pressed={saved}
    >
      {saved ? "Saved to shortlist" : "Save to shortlist"}
    </button>
  );
}
