import { useRef, useState, useEffect, lazy, Suspense, useCallback } from "react"
import { usePartitionOffersByBounds } from "@/hooks/usePartitionOffersByBounds"
import { OffersGrid } from "./map/OffersGrid"
import type { EventDetail } from "@/types/types"
import EventCard from "./EventCard"
import { Link, useNavigate } from "react-router"
import { Legend } from "./map/Legend"
import type { MapActions } from "./map/EventMap"
import Leaflet from "leaflet";
import { useI18n } from "@/i18n/I18nProvider";

const EventMap = lazy(() => import("./map/EventMap"));

// function gmaps(lat: number, lng: number, label?: string) {
//   return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}${label ? `&query_place_id=${encodeURIComponent(label)}` : ''}`
// }

function EventDetailBody({ event, offerId }: { event: EventDetail, offerId: number | null }) {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)
  const { inBounds, outOfBounds } = usePartitionOffersByBounds(event.offers, bounds) // , { padding: 0.05 }
  const initialPosition = event.loc_lat && event.loc_lng ? Leaflet.latLng(event.loc_lat, event.loc_lng) : null
  const mapRef = useRef<MapActions | null>(null)
  const [mapReady, setMapReady] = useState(false);
  const { t } = useI18n();
  const navigate = useNavigate();
  const handleMapRef = useCallback((instance: MapActions | null) => {
    mapRef.current = instance;
    setMapReady(instance !== null);
  }, []);
  const handleOfferPopupClose = useCallback((closedOfferId: number) => {
    if (offerId !== closedOfferId) return;
    navigate(`/events/${event.hashId}`, { replace: true });
  }, [offerId, event.hashId, navigate]);

  // On page load and on change of offerId value,
  // focus on the corresponding offer, if offerId is set
  useEffect(() => {
    const offer = offerId ? event.offers.find(o => o.id === offerId) : null;
    if (!offer) return;
    if (event.loc_lat && event.loc_lng && offer.lat && offer.lng && mapReady) {
      // wait a tick to make sure the map is rendered
      requestAnimationFrame(() => {
        mapRef.current?.focusOffer(offer.id, { openPopup: true })
      })
    }
  }, [offerId, event, mapReady])


  return (
    <div className="p-4 space-y-4">
      <EventCard e={event} />

      <div>
        <Link
          className="btn flex items-center justify-center mb-4"
          to={`/events/${event.hashId}/offers/new`}
        >
          <span className="mr-3">➕</span>
          <span>{t("events.addOffer")}</span>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-center gap-x-6">
          <Legend />
          <a
            className="block text-slate-500"
            target="_blank"
            href={event.loc_original_link}
          >
            {t("events.openMaps")}
          </a>
        </div>

        <Suspense fallback={<div className="mb-4 h-96 w-full overflow-hidden bg-black/30" />}>
          <EventMap
            ref={handleMapRef}
            event={event}
            initialPosition={initialPosition}
            onBoundsChange={setBounds}
            onOfferPopupClose={handleOfferPopupClose}
            className="mb-4 h-96 w-full overflow-hidden bg-black/30"
          />
        </Suspense>
      </div>

      <div className="offers-container">
        <OffersGrid title={t("events.offers.inBounds")} offers={inBounds} />
        <OffersGrid title={t("events.offers.outOfBounds")} offers={outOfBounds} dim />
      </div>
    </div>
  )
}

export default EventDetailBody
