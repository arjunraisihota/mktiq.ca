"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/lib/use-recently-viewed";

interface Props {
  cityRouteSlug: string;
  cityName: string;
  neighbourhoodSlug: string;
  neighbourhoodName: string;
  archetype?: string;
}

export function TrackRecentlyViewed({ cityRouteSlug, cityName, neighbourhoodSlug, neighbourhoodName, archetype }: Props) {
  const { trackView } = useRecentlyViewed();

  useEffect(() => {
    trackView({ cityRouteSlug, cityName, neighbourhoodSlug, neighbourhoodName, archetype });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityRouteSlug, neighbourhoodSlug]);

  return null;
}
