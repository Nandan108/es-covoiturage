// src/components/map/EventMap.tsx
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import type L from "leaflet";
import { L as Leaflet } from "./markerIcons";
import BoundsWatcher from "./BoundsWatcher";
import { iconForOffer, icons } from "./markerIcons";
import type { Offer } from "../../types";

export type MapActions = {
  focusOffer: (
    offerId: number,
    opts?: { paddingRatio?: number; maxZoom?: number; openPopup?: boolean }
  ) => void;
  locate: () => void;
  centerOn: (latLng: L.LatLng) => void;
};

type Props = {
  event: { loc_lat: number; loc_lng: number; loc_name: string; hashId: string; offers: Offer[] };
  initialPosition: L.LatLng | null;
  onBoundsChange?: (b: L.LatLngBounds) => void;
  zoom?: number;
  className?: string;
  setLocation?: (latLng: L.LatLng) => void; // if set, allow user to pick location
};

const EventMap = forwardRef<MapActions, Props>(function (
  { event, onBoundsChange, zoom = 13, className = "h-96 w-full", setLocation, initialPosition },
  ref
) {
  // Marker registry
  const markersRef = useRef(new Map<number, L.Marker>());
  const centerLL = useMemo(
    () => Leaflet.latLng(event.loc_lat, event.loc_lng),
    [event.loc_lat, event.loc_lng]
  );

  function registerMarker(id: number) {
    return (m: L.Marker | null) => {
      if (m) markersRef.current.set(id, m);
      else markersRef.current.delete(id);
    };
  }

  // Bridge to Leaflet Map instance
  const MapApi = () => {
    const map = useMap();

    // Store currently open popup + its marker position
    const lastPopupRef = useRef<{ popup: L.Popup; marker: L.Marker } | null>(null);

    // If the map moves such that the open popup's marker is out of view, close it
    // Leaflet doesn't do this automatically, and if we don't do it the map moves
    // back to show the popup.
    map.on("popupopen", (e) => {
      const popup = e.popup;
      const marker = (popup as { _source?: L.Marker })._source;
      if (!marker || typeof marker.getLatLng !== "function") return;

      lastPopupRef.current = { popup, marker };

      const checkPopupPosition = () => {
        if (!map.getBounds().contains(marker.getLatLng())) {
          marker.closePopup();
          map.off("move", checkPopupPosition);
          map.off("zoomend", checkPopupPosition);
        }
      };

      map.on("move", checkPopupPosition);
      map.on("zoomend", checkPopupPosition);
    });

    // Expose imperative API to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        // Focus the map on a specific offer
        focusOffer(offerId, opts) {
          const m = markersRef.current.get(offerId);
          if (!m) return;

          const offerLL = m.getLatLng();
          const paddingRatio = opts?.paddingRatio ?? 0.1;
          const maxZoom = opts?.maxZoom ?? 16;

          // Build bounds that include event center + chosen offer, then pad ~10%
          const bounds = Leaflet.latLngBounds(centerLL, offerLL).pad(paddingRatio);

          console.log("Focusing map on offer", offerId, "at", offerLL, "with bounds", bounds);

          // Fit to those bounds; cap zoom so we don’t over-zoom on very close points
          if (opts?.openPopup !== false) {
            m.openPopup();
          }
          map.fitBounds(bounds, { animate: true, maxZoom });
        },
        locate() {
          map.locate().on("locationfound", (e) => setLocation?.(e.latlng));
        },
        centerOn(latLng: L.LatLng) {
          map.flyTo(latLng, map.getZoom());
          //map.setView(latLng, map.getZoom());
        },
      }),
      [map]
    );

    return null;
  };

  const eventMarker = useMemo(
    () => Leaflet.latLng(event.loc_lat, event.loc_lng),
    [event.loc_lat, event.loc_lng]
  );

  function LocationMarker({
    initialPosition,
    popupContent = "Votre point de départ",
  }: {
    initialPosition?: L.LatLng | null;
    popupContent?: React.ReactNode;
  }) {
    const [position, setPosition] = useState<L.LatLng | null>(initialPosition || null);
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        setLocation?.(e.latlng);
        setPosition(e.latlng);
      },
    });

    if (position) {
      return (
        <Marker position={position}>
          <Popup>{popupContent}</Popup>
        </Marker>
      );
    }
  }

  return (
    <MapContainer
      center={initialPosition || [event.loc_lat, event.loc_lng]}
      zoom={zoom}
      wheelPxPerZoomLevel={300}
      scrollWheelZoom
      className={className}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapApi />
      {onBoundsChange && <BoundsWatcher onBoundsChange={onBoundsChange} debounceMs={200} />}

      {/* Event location */}
      <Marker position={eventMarker} icon={icons.event}>
        <Popup>Lieu de la rencontre<hr /> {event.loc_name}</Popup>
      </Marker>

      {/* Offer markers */}
      {event.offers.map((o) => {
        const roles = [o.pasngr_seats ? "Passenger" : null, o.driver_seats ? "Driver" : null]
          .filter(Boolean)
          .join(" or ");
        return (
          <Marker
            key={o.id}
            ref={registerMarker(o.id)}
            position={[o.lat, o.lng]}
            icon={iconForOffer(o)}
          >
            <Popup className="text-nowrap fit-content">
              <b>{o.name}</b> ({roles})<br />
              {o.address}
              <br />
              {o.phone && (
                <>
                  <b>Tél:</b> {o.phone}
                </>
              )}
            </Popup>
          </Marker>
        );
      })}
      {setLocation && <LocationMarker initialPosition={initialPosition} />}
    </MapContainer>
  );
});

export default EventMap;
