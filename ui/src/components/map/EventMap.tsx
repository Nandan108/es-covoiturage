// src/components/map/EventMap.tsx
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type L from "leaflet";
import { L as Leaflet } from "./markerIcons";
import BoundsWatcher from "./BoundsWatcher";
import { iconForOffer, icons } from "./markerIcons";
import type { Offer } from "@/types/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { Optionalize } from "@/types/types";

export type MapActions = {
  focusOffer: (
    offerId: number,
    opts?: { paddingRatio?: number; maxZoom?: number; openPopup?: boolean }
  ) => void;
  locate: () => void;
  centerOn: (latLng: L.LatLng) => void;
};

type MapMode = "view" | "offerLocSelect" | "eventLocSelect";

type Props = {
  event: { loc_lat: number; loc_lng: number; loc_name: string; hashId: string; offers: Offer[] };
  initialPosition: L.LatLng | null;
  onBoundsChange?: (b: L.LatLngBounds) => void;
  zoom?: number;
  className?: string;
  setLocation?: (latLng: L.LatLng) => void; // if set, allow user to pick location
  mode?: MapMode;
  editingOffer?: Optionalize<Offer, "id" | 'lat' | 'lng' | "created_at" | "updated_at" | "token_hash" | "token_expires_at">;
  onOfferPopupClose?: (offerId: number) => void;
};

function getRoleNameKey(o: { pasngr_seats: number; driver_seats: number }) {
    return o.pasngr_seats && o.driver_seats
      ? "legend.both"
      : o.pasngr_seats
      ? "legend.passenger"
      : "legend.driver";
}

const EventMap = forwardRef<MapActions, Props>(function (
  {
    event,
    onBoundsChange,
    zoom = 13,
    className = "h-96 w-full",
    setLocation,
    initialPosition,
    mode = "view",
    editingOffer,
    onOfferPopupClose,
  },
  ref
) {
  const { t } = useI18n();

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
  const getOfferIdForMarker = (marker: L.Marker | undefined | null) => {
    if (!marker) return null;
    for (const [offerId, registeredMarker] of markersRef.current.entries()) {
      if (registeredMarker === marker) {
        return offerId;
      }
    }
    return null;
  };

  const MapApi = () => {
    const map = useMap();

    // Store currently open popup + its marker position
    const lastPopupRef = useRef<{ popup: L.Popup; marker: L.Marker; cleanup: () => void } | null>(null);

    // If the map moves such that the open popup's marker is out of view, close it
    // Leaflet doesn't do this automatically, and if we don't do it the map moves
    // back to show the popup.
    map.on("popupopen", (e) => {
      const popup = e.popup;
      const marker = (popup as { _source?: L.Marker })._source;
      if (!marker || typeof marker.getLatLng !== "function") return;

      // make sure map is scrolled into view if popup is opened offscreen
      const container = map.getContainer();
      const rect = container.getBoundingClientRect();
      if (rect.top < 0) {
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Clean up any prior popup watchers
      lastPopupRef.current?.cleanup();

      // Set up new popup watcher
      const cleanup = () => {
        map.off("moveend", checkPopupPosition);
        map.off("zoomend", checkPopupPosition);
      };
      const checkPopupPosition = () => {
        if (!map.getBounds().contains(marker.getLatLng())) {
          cleanup();
          marker.closePopup();
        }
      };

      lastPopupRef.current = { popup, marker, cleanup };

      map.on("moveend", checkPopupPosition);
      map.on("zoomend", checkPopupPosition);
    });

    map.on("popupclose", (e) => {
      const popup = e.popup;
      const marker = (popup as { _source?: L.Marker })._source;

      if (lastPopupRef.current?.popup === popup) {
        lastPopupRef.current.cleanup();
        lastPopupRef.current = null;
      }

      const closedOfferId = getOfferIdForMarker(marker);
      if (closedOfferId != null) {
        onOfferPopupClose?.(closedOfferId);
      }
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

          // Fit to those bounds; cap zoom so we don't over-zoom on very close points
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
    popupContent,
    icon,
  }: {
    initialPosition?: L.LatLng | null;
    popupContent?: React.ReactNode;
    icon?: L.Icon;
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
        <Marker position={position} icon={icon || icons.default}>
          <Popup>{popupContent}</Popup>
        </Marker>
      );
    }
  }

  // Get the appropriate icon and popup content based on mode
  const getLocationMarkerProps = () => {
    switch (mode) {
      case "offerLocSelect": {
        const offerIcon = editingOffer ? iconForOffer(editingOffer) : icons.default;
        const role = editingOffer
          ? t(getRoleNameKey(editingOffer))
          : t("legend.origin");
        return {
          icon: offerIcon,
          popupContent:
            t("legend.origin", { role }) || `${t("legend.origin")} (${role})`,
        };
      }
      case "eventLocSelect":
        return {
          icon: icons.event,
          popupContent: t("legend.event") || "Event location",
        };

      default: // "view"
        return {
          icon: icons.default,
          popupContent: t("legend.origin"),
        };
    }
  };

  const locationMarkerProps = getLocationMarkerProps();

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

      {/* Event location - hide in eventLocSelect mode to avoid confusion */}
      {mode !== "eventLocSelect" && (
        <Marker position={eventMarker} icon={icons.event}>
          <Popup>
            Lieu de la rencontre
            <hr /> {event.loc_name}
          </Popup>
        </Marker>
      )}

      {/* Offer markers - hide the editing offer to avoid duplicate markers */}
      {event.offers
        .filter((offer) => mode !== "offerLocSelect" || offer.id !== editingOffer?.id)
        .map((o) => {
          return (
            <Marker
              key={o.id}
              ref={registerMarker(o.id)}
              position={[o.lat, o.lng]}
              icon={iconForOffer(o)}
            >
              <Popup className="text-nowrap fit-content">
                <b>{o.name}</b> ({t(getRoleNameKey(o))})<br />
                {o.address}
                <br />
                {o.phone && (
                  <>
                    <b>
                      {t("offerCard.phone")}
                      {t("colon")}
                    </b>{" "}
                    {o.phone}
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}

      {/* Location picker marker - only show when setLocation is provided */}
      {setLocation && (
        <LocationMarker
          initialPosition={initialPosition}
          popupContent={locationMarkerProps.popupContent}
          icon={locationMarkerProps.icon}
        />
      )}
    </MapContainer>
  );
});

export default EventMap;
