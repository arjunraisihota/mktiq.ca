"use client";

import Link from "next/link";

interface Props {
  cityName: string;
  cityRouteSlug: string;
}

export function BackToCityButton({ cityName, cityRouteSlug }: Props) {
  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Link
        href={`/${cityRouteSlug}`}
        className="flex items-center gap-1.5 rounded-full border border-edge bg-white px-4 py-2 text-sm font-medium text-ink shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {cityName}
      </Link>
    </div>
  );
}
