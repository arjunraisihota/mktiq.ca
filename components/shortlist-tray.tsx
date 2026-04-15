"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useShortlist } from "@/components/shortlist-context";
import type { DerivedNeighbourhoodModel, SignalRank } from "@/lib/types";

function itemKey(item: DerivedNeighbourhoodModel) {
  return `${item.cityRouteSlug}/${item.neighbourhoodSlug}`;
}

function formatScore(score: SignalRank) {
  return `#${score.rank}/${score.total} · ${score.value}/100`;
}

export function ShortlistTray() {
  const { items, hydrated, removeItem, clearItems } = useShortlist();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSelectedKeys((current) => {
      const valid = current.filter((key) => items.some((item) => itemKey(item) === key));
      if (valid.length) return valid.slice(0, 3);
      if (!items.length) return [];
      return items.slice(0, 2).map((item) => itemKey(item));
    });
  }, [items]);

  if (!hydrated || !items.length) return null;

  const selectedItems = items.filter((item) => selectedKeys.includes(itemKey(item)));
  const compareReady = selectedItems.length >= 2;

  function toggleSelected(item: DerivedNeighbourhoodModel) {
    const key = itemKey(item);
    setSelectedKeys((current) => {
      if (current.includes(key)) return current.filter((entry) => entry !== key);
      if (current.length >= 3) return current;
      return [...current, key];
    });
  }

  function copyShareLink() {
    const slugs = items.map((item) => `${item.cityRouteSlug}:${item.neighbourhoodSlug}`).join(",");
    const url = `${window.location.origin}/?compare=${encodeURIComponent(slugs)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex justify-center">
      <div className="w-full max-w-6xl rounded-2xl border border-edge bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
        <div className="flex flex-wrap items-start justify-between gap-4 p-4 md:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Shortlist</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">{items.length} saved neighbourhood{items.length === 1 ? "" : "s"}</h2>
            <p className="mt-1 text-sm text-stone">
              {compareReady
                ? `Comparing ${selectedItems.length} neighbourhood${selectedItems.length > 1 ? "s" : ""}.`
                : "Select 2–3 neighbourhoods to compare side by side."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyShareLink}
              className="rounded-md border border-edge px-3 py-2 text-sm font-medium text-ink transition hover:bg-slate-50"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() => clearItems()}
              className="rounded-md border border-edge px-3 py-2 text-sm font-medium text-ink transition hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {isOpen ? "Hide shortlist" : "Open shortlist"}
            </button>
          </div>
        </div>

        {isOpen ? (
          <div className="grid border-t border-edge lg:grid-cols-[0.95fr_1.25fr]">
            <div className="max-h-[60vh] overflow-y-auto p-4 md:p-5">
              <p className="text-sm font-semibold text-ink">Saved areas</p>
              <p className="mt-1 text-sm text-stone">Select up to 3 to compare. Cross-city comparison supported.</p>

              <div className="mt-4 space-y-3">
                {items.map((item) => {
                  const key = itemKey(item);
                  const checked = selectedKeys.includes(key);
                  const disabled = !checked && selectedKeys.length >= 3;

                  return (
                    <article key={key} className={`rounded-xl border p-4 ${checked ? "border-ink bg-slate-50" : "border-edge bg-white"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <label className={`flex flex-1 gap-3 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleSelected(item)}
                            className="mt-1 h-4 w-4 rounded border-edge text-ink focus:ring-ink"
                          />
                          <div>
                            <p className="text-sm font-semibold text-ink">{item.neighbourhoodName}</p>
                            <p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-brand">{item.cityName}</p>
                            <p className="mt-2 text-sm text-stone">{item.decisionTitle}</p>
                          </div>
                        </label>

                        <button
                          type="button"
                          onClick={() => removeItem(item.cityRouteSlug, item.neighbourhoodSlug)}
                          className="text-sm font-medium text-stone transition hover:text-ink"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        {item.rankingBadges.slice(0, 2).map((badge) => (
                          <span key={badge.text} className="rounded-full bg-white px-3 py-1 font-medium text-ink border border-edge">
                            {badge.text}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-3">
                        <Link href={`/${item.cityRouteSlug}/${item.neighbourhoodSlug}`} className="text-sm font-medium text-ink underline-offset-2 transition hover:underline">
                          Open page
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="max-h-[60vh] overflow-auto border-t border-edge p-4 md:p-5 lg:border-l lg:border-t-0">
              <p className="text-sm font-semibold text-ink">Compare shortlist</p>
              {compareReady ? (
                <>
                  <p className="mt-1 text-sm text-stone">Side-by-side tradeoffs for your selected areas.</p>

                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-[760px] table-fixed border-separate border-spacing-0 text-left">
                      <thead>
                        <tr>
                          <th className="w-48 border-b border-edge px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-stone">Signal</th>
                          {selectedItems.map((item) => (
                            <th key={itemKey(item)} className="border-b border-edge px-3 py-3 align-top">
                              <p className="text-sm font-semibold text-ink">{item.neighbourhoodName}</p>
                              <p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-brand">{item.cityName}</p>
                              <Link
                                href={`/${item.cityRouteSlug}/${item.neighbourhoodSlug}`}
                                className="mt-2 inline-flex text-xs font-medium text-ink underline-offset-2 transition hover:underline"
                              >
                                Open full page
                              </Link>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th className="border-b border-edge px-3 py-3 text-sm font-semibold text-ink">Decision</th>
                          {selectedItems.map((item) => (
                            <td key={`${itemKey(item)}-decision`} className="border-b border-edge px-3 py-3 text-sm text-stone">
                              {item.decisionTitle}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th className="border-b border-edge px-3 py-3 text-sm font-semibold text-ink">Family fit</th>
                          {selectedItems.map((item) => (
                            <td key={`${itemKey(item)}-family`} className="border-b border-edge px-3 py-3 text-sm text-stone">
                              {formatScore(item.scores.familyFit)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th className="border-b border-edge px-3 py-3 text-sm font-semibold text-ink">Stability</th>
                          {selectedItems.map((item) => (
                            <td key={`${itemKey(item)}-stability`} className="border-b border-edge px-3 py-3 text-sm text-stone">
                              {formatScore(item.scores.stability)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th className="border-b border-edge px-3 py-3 text-sm font-semibold text-ink">Commuter fit</th>
                          {selectedItems.map((item) => (
                            <td key={`${itemKey(item)}-commuter`} className="border-b border-edge px-3 py-3 text-sm text-stone">
                              {formatScore(item.scores.commuterConvenience)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th className="border-b border-edge px-3 py-3 text-sm font-semibold text-ink">Housing stock</th>
                          {selectedItems.map((item) => (
                            <td key={`${itemKey(item)}-housing`} className="border-b border-edge px-3 py-3 text-sm text-stone">
                              {formatScore(item.scores.housingStockFit)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th className="border-b border-edge px-3 py-3 text-sm font-semibold text-ink">Choose if</th>
                          {selectedItems.map((item) => (
                            <td key={`${itemKey(item)}-choose`} className="border-b border-edge px-3 py-3 text-sm text-stone">
                              <ul className="space-y-2">
                                {item.chooseThisIf.slice(0, 2).map((row) => (
                                  <li key={row}>{row}</li>
                                ))}
                              </ul>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th className="px-3 py-3 text-sm font-semibold text-ink">Key risks</th>
                          {selectedItems.map((item) => (
                            <td key={`${itemKey(item)}-risk`} className="px-3 py-3 text-sm text-stone">
                              <ul className="space-y-2">
                                {item.riskFlags.slice(0, 2).map((row) => (
                                  <li key={row}>{row}</li>
                                ))}
                              </ul>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-edge bg-slate-50 p-5 text-sm text-stone">
                  Select at least 2 saved neighbourhoods to unlock side-by-side comparison.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
