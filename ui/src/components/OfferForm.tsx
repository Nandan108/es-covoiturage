import { Form } from "react-router";
import type { Offer, EventDetail } from "../types";
import OfferRoles from "./OfferRoles";
import EventMap, { type MapActions } from "./map/EventMap";
import { useRef, useState } from "react";
import Leaflet from "leaflet";
import LocationSearch from "./locationSearch";
import { Legend } from "./map/Legend";
// import type { AutocompleteInputHandle } from "./AutocompleteInput";

export default function OfferForm({ event, offer }: { event: EventDetail; offer?: Offer }) {
  // const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const addressRef = useRef<HTMLInputElement>(null);
  const [latLng, setLatLng] = useState<L.LatLng | null>(
    offer ? Leaflet.latLng(offer.lat, offer.lng) : null
  );

  const editing = offer != null;
  const mapRef = useRef<MapActions>(null);
  const locationSearchRef = useRef<HTMLInputElement>(null);

  const form = {
    eventHash: event.hashId,
    name: offer?.name ?? "",
    address: offer?.address ?? "",
    lat: offer?.lat ?? null,
    lng: offer?.lng ?? null,
    notes: offer?.notes ?? "",
    phone: offer?.phone ?? "",
    email: offer?.email ?? "",
    email_is_public: offer?.email_is_public ?? true,
    driver_seats: offer?.driver_seats ?? 0,
    pasngr_seats: offer?.pasngr_seats ?? 0,
  };

  const handleSelectLocation = (lat: number, lng: number) => {
    // move marker to selected location
    setLatLng(Leaflet.latLng(lat, lng));
    // move map to selected location
    // setBounds(Leaflet.latLngBounds(Leaflet.latLng(lat, lng), Leaflet.latLng(lat, lng)));
    mapRef?.current?.centerOn(Leaflet.latLng(lat, lng));
  };

  return (
    <div className="mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">
        {editing ? "Modifier une offre" : "Nouvelle offre / demande"}
      </h1>

      <Form method="post" className="space-y-6">
        <input type="hidden" name="eventHash" defaultValue={form.eventHash} />
        <input type="hidden" name="id" defaultValue={offer?.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="block text-sm mb-1">Nom</span>
            <input className="input" name="name" defaultValue={form.name} required />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Email</span>
            <input className="input" name="email" type="email" defaultValue={form.email} required />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Téléphone</span>
            <input className="input" name="phone" type="tel" defaultValue={form.phone} />
          </label>

          <OfferRoles />

          <label className="block">
            <div className="block text-sm mb-1">
              Votre lieu de départ <i className="text-gray-500 text-xs">(affiché sur l'offre)</i>
            </div>
            <input ref={addressRef} className="input" name="address" defaultValue={form.address} />
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="address" id="address_label">
            Cherchez votre lieu de départ ici ou indiquez le directement sur la carte.
          </label>
          <LocationSearch
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onFocus={() => setSearchQuery(searchQuery || (addressRef.current?.value ?? ""))}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Adresse, ville, code postal, pays…"
            aria-labelledby="address_label"
            ref={locationSearchRef}
            onSelectLocation={handleSelectLocation}
          />
        </div>

        <div className="form-group mt-2 mb-1 text-slate-500">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="mr-4">Coordonnées de votre lieu de départ: </span>
            <div className="flex items-center mt-2 sm:mt-0">
              <span>
                lat:
                <input
                  type="text"
                  name="lat"
                  id="lat"
                  value={latLng?.lat ?? form.lat ?? ""}
                  className="py-0 px-1 w-20 mx-2 bg-neutral-300 border border-neutral-400"
                  readOnly
                />
              </span>
              <span>
                lng:
                <input
                  type="text"
                  name="lng"
                  id="lng"
                  value={latLng?.lng ?? form.lng ?? ""}
                  className="py-0 px-1 w-20 mx-2 bg-neutral-300 border border-neutral-400"
                  readOnly
                />
              </span>
            </div>
          </div>
        </div>
        <Legend mode="edit" />

        <EventMap
          ref={mapRef}
          event={event}
          // onBoundsChange={setBounds}
          initialPosition={latLng}
          setLocation={(latLng) => {
            setLatLng(latLng);
          }}
          className="mb-4 h-96 w-full overflow-hidden bg-black/30"
        />

        <label className="block">
          <span className="block text-sm mb-1">Notes / Précisions</span>
          <textarea name="notes" className="input" defaultValue={form.notes ?? ""} />
        </label>

        {/* <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="block text-sm mb-1">Afficher mon email publiquement</span>
            <input
              name="email_is_public"
              type="checkbox"
              className="mr-2 align-middle"
              defaultChecked={!!form.email_is_public}
            />
          </label>
        </div> */}

        <div className="flex gap-3">
          <button type="submit" className="btn">
            {editing ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </Form>
    </div>
  );
}
