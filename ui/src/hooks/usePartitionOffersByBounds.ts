// ui/src/hooks/usePartitionOffersByBounds.ts
import { useMemo } from "react";
import type { Offer } from "../types/types";
import type { LatLngBounds } from "../components/map/markerIcons";
import { L } from "../components/map/markerIcons";

/**
 * Split offers into those currently inside the map bounds vs outside.
 * - `bounds`: pass the current map bounds (or null before the map is ready)
 * - `padding`: grow/shrink bounds by a ratio (e.g. 0.1 = +10% each side)
 */
export function usePartitionOffersByBounds(
  offers: Offer[] | undefined,
  bounds: LatLngBounds,
  { padding = 0 }: { padding?: number } = {}
) {
  return useMemo(() => {
    const inBounds: Offer[] = [];
    const outOfBounds: Offer[] = [];

    if (!offers?.length) {
      return { inBounds, outOfBounds };
    }

    // If no bounds yet (map not ready), treat all as "out" (or flip if you prefer)
    if (!offers?.length || !bounds) return { inBounds, outOfBounds };

    const effective = padding ? bounds.pad(padding) : bounds;

    for (const o of offers) {
      const latlng = L.latLng(o.lat, o.lng);
      // Leaflet's contains() accepts a LatLngExpression, [lat, lng] is fine
      (effective.contains(latlng) ? inBounds : outOfBounds).push(o);
    }

    return { inBounds, outOfBounds };
  }, [offers, bounds, padding]);
}
