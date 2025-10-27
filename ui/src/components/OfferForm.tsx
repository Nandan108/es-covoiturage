import { Form, useFetcher, useNavigation } from "react-router";
import type { Offer, EventDetail } from "@/types/types";
import OfferRoles from "./OfferRoles";
import { lazy, Suspense, useCallback, useRef, useState } from "react";
import Leaflet from "leaflet";
import LocationSearch from "./locationSearch";
import { Legend } from "./map/Legend";
import EventCard from "./EventCard";
import { FaTrash } from "react-icons/fa";
import { useI18n } from "@/i18n/I18nProvider";
import type { MapActions } from "./map/EventMap";

const EventMap = lazy(() => import("./map/EventMap"));

export default function OfferForm({ event, offer }: { event: EventDetail; offer?: Offer }) {
  const [searchQuery, setSearchQuery] = useState("");
  const addressRef = useRef<HTMLInputElement>(null);
  const [latLng, setLatLng] = useState<L.LatLng | null>(
    offer ? Leaflet.latLng(offer.lat, offer.lng) : null
  );

  const editing = offer != null;
  const mapRef = useRef<MapActions | null>(null);
  const setMapRef = useCallback((instance: MapActions | null) => {
    mapRef.current = instance;
  }, []);
  const locationSearchRef = useRef<HTMLInputElement>(null);

  const fetcher = useFetcher();
  const navigation = useNavigation();
  const { t } = useI18n();

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

  const isSubmitting = navigation.state === "submitting";
  const isDeleting = fetcher.state === "submitting";

  return (
    <div className="mx-auto p-4">
      <EventCard e={event} className="mb-6" />
      <h1 className="text-2xl font-semibold mb-4">
        {editing ? t("offerForm.title.edit") : t("offerForm.title.new")}
      </h1>

      <Form method="post" className="space-y-6">
        <input type="hidden" name="eventHash" defaultValue={form.eventHash} />
        <input type="hidden" name="id" defaultValue={offer?.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="block text-sm mb-1">{t("offerForm.labels.name")}</span>
            <input className="input" name="name" defaultValue={form.name} required />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">{t("offerForm.labels.email")}</span>
            <input className="input" name="email" type="email" defaultValue={form.email} required />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">{t("offerForm.labels.phone")}</span>
            <input className="input" name="phone" type="tel" defaultValue={form.phone} />
          </label>

          <OfferRoles />

          <label className="block">
            <div className="block text-sm mb-1">
              {t("offerForm.labels.location")} <i className="text-gray-500 text-xs">{t("offerForm.labels.locationHint")}</i>
            </div>
            <input ref={addressRef} className="input" name="address" defaultValue={form.address} required/>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="address" id="address_label" className="block text-sm mb-1">
            {t("offerForm.labels.location")}
          </label>
          <LocationSearch
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onFocus={() => setSearchQuery(searchQuery || (addressRef.current?.value ?? ""))}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("locationSearch.placeholder")}
            aria-labelledby="address_label"
            ref={locationSearchRef}
            onSelectLocation={handleSelectLocation}
          />
        </div>

        <div className="form-group mt-2 mb-1 text-slate-500">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="mr-4">{t("offerForm.labels.coordinates")}: </span>
            <div className="flex items-center mt-2 sm:mt-0">
              <span>
                {t("offerForm.labels.lat")}:
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
                {t("offerForm.labels.lng")}:
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

        <Suspense fallback={<div className="mb-4 h-96 w-full bg-black/30" />}>
          <EventMap
            ref={setMapRef}
            event={event}
            // onBoundsChange={setBounds}
            initialPosition={latLng}
            setLocation={(latLng) => {
              setLatLng(latLng);
            }}
            className="mb-4 h-96 w-full overflow-hidden bg-black/30"
          />
        </Suspense>

        <label className="block">
          <span className="block text-sm mb-1">{t("offerForm.labels.notes")}</span>
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

        <div className="flex gap-3 justify-between">
          <button type="submit" className="btn" disabled={isSubmitting || isDeleting}>
            {editing
              ? isSubmitting
                ? t("offerForm.buttons.saving")
                : t("offerForm.buttons.save")
              : isSubmitting
                ? t("offerForm.buttons.creating")
                : t("offerForm.buttons.create")}
          </button>
          {editing && (
            <button
              className="btn bg-red-200 text-red-800"
              type="submit"
              title={t("offerForm.buttons.delete")}
              form="delete-offer-form"
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? t("offerForm.buttons.deleting") : <FaTrash className="inline" />}
            </button>
          )}
        </div>
      </Form>
      <fetcher.Form
        id="delete-offer-form"
        method="delete"
        action={`/events/${event.hashId}/offers/${offer?.id}/edit`}
        style={{ display: "none" }}
      ></fetcher.Form>
    </div>
  );
}
