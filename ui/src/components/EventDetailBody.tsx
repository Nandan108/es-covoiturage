import { useRef, useState } from "react"
import { usePartitionOffersByBounds } from "../hooks/usePartitionOffersByBounds"
import { OffersGrid } from "./map/OffersGrid"
import type { EventDetail } from "../types"
import EventCard from "./EventCard"
import { Link } from "react-router-dom"
import { Legend } from "./map/Legend"
import type { MapActions } from "./map/EventMap"
import EventMap from "./map/EventMap"
import Leaflet from "leaflet";

// function gmaps(lat: number, lng: number, label?: string) {
//   return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}${label ? `&query_place_id=${encodeURIComponent(label)}` : ''}`
// }

function EventDetailBody({ event }: { event: EventDetail }) {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)
  const { inBounds, outOfBounds } = usePartitionOffersByBounds(event.offers, bounds) // , { padding: 0.05 }
  const initialPosition = event.loc_lat && event.loc_lng ? Leaflet.latLng(event.loc_lat, event.loc_lng) : null
  const mapRef = useRef<MapActions>(null)
  const focus = (offerId: number) => mapRef.current?.focusOffer(offerId, { maxZoom: 15, openPopup: true })

  return (
    <div className="p-4 space-y-4">
      <EventCard e={event} />

      <div>
        <Link
          className="btn flex items-center justify-center mb-4"
          to={`/events/${event.hashId}/offers/new`}
        >
          <span className="mr-3">➕</span>
          <span>Ajouter une offre ou une demande de covoiturage</span>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-center gap-x-6">
          <Legend />
          <a
            className="block text-slate-500"
            target="_blank"
            href={event.loc_original_link}
          >
            Ouvrir sur Google Maps
          </a>
        </div>

        <EventMap
          ref={mapRef}
          event={event}
          initialPosition={initialPosition}
          onBoundsChange={setBounds}
          className="mb-4 h-96 w-full overflow-hidden bg-black/30"
        />
      </div>

      <div className="offers-container">
        <OffersGrid title="Sur la carte" offers={inBounds} onFocusClick={focus} />
        <OffersGrid title="Autres offres (hors cadre)" offers={outOfBounds} onFocusClick={focus} dim />
      </div>
    </div>
  )
}

export default EventDetailBody