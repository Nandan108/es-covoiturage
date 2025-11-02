import { Form, useActionData, useFetcher, useNavigation } from "react-router";
import type { Offer, EventDetail } from "@/types/types";
import OfferRoles from "./OfferRoles";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Leaflet from "leaflet";
import LocationSearch from "./locationSearch";
import { Legend } from "./map/Legend";
import EventCard from "./EventCard";
import { FaTrash } from "react-icons/fa";
import { useI18n } from "@/i18n/I18nProvider";
import type { MapActions } from "./map/EventMap";
import CoordinatesInput from "./CoordinatesInput";
import { useNotifications } from "@/components/notifications/NotificationProvider";

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
  const { notify } = useNotifications();
  const actionData = useActionData<{ error?: string }>();

  const [form, setForm] = useState({
    id: offer?.id,
    eventHash: event.hashId,
    name: offer?.name ?? "",
    address: offer?.address ?? "",
    lat: offer?.lat,
    lng: offer?.lng,
    notes: offer?.notes ?? "",
    phone: offer?.phone ?? "",
    email: offer?.email ?? "",
    email_is_public: offer?.email_is_public ?? true,
    driver_seats: offer?.driver_seats ?? 0,
    pasngr_seats: offer?.pasngr_seats ?? 0,
  });

  const updateLatLng = useCallback(
    (point: L.LatLng) => {
      setLatLng(point);
      setForm((prev) => ({
        ...prev,
        lat: point.lat,
        lng: point.lng,
      }));
    },
    [setForm]
  );

  const handleSelectLocation = (lat: number, lng: number) => {
    const point = Leaflet.latLng(lat, lng);
    updateLatLng(point);
    mapRef.current?.centerOn(point);
  };

  const isSubmitting = navigation.state === "submitting";
  const isDeleting = fetcher.state === "submitting";

  // update form state when roles change

  const handleRoleChange = useMemo(() => {
    return (pssgnr: number, driver: number) => {
      setForm((prev) => ({
        ...prev,
        pasngr_seats: pssgnr,
        driver_seats: driver,
      }));
    };
  }, [setForm]);

  useEffect(() => {
    if (actionData?.error) {
      notify(t("error.network"), "error", { description: t("error.unableToUpdateOffer") });
    }
  }, [actionData, notify, t]);

  useEffect(() => {
    const error = (fetcher.data as { error?: string } | undefined)?.error;
    if (fetcher.state === "idle" && error) {
      notify(t("error.network"), "error", { description: t("error.unableToDeleteOffer") });
    }
  }, [fetcher.data, fetcher.state, notify, t]);

  return (
    <div className="mx-auto p-4">
      <EventCard e={event} className="mb-6" />
      <h1 className="text-2xl font-semibold mb-4">
        {editing ? t("offerForm.title.edit") : t("offerForm.title.new")}
      </h1>

      <Form method="post" className="space-y-6">
        <input type="hidden" name="eventHash" defaultValue={form.eventHash} />
        <input type="hidden" name="id" defaultValue={offer?.id} />

        <div className="flex flex-col sm:grid gap-4 sm:grid-cols-2">
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

          <OfferRoles onRoleChange={handleRoleChange} />

          <label className="block col-span-2">
            <div className="block text-sm mb-1">
              {t("offerForm.labels.location")}{" "}
              <i className="text-gray-500 text-xs">{t("offerForm.labels.locationHint")}</i>
            </div>
            <input
              ref={addressRef}
              className="input"
              name="address"
              defaultValue={form.address}
              required
            />
          </label>

          <label
            htmlFor="offer-form-location-search"
            id="address_label"
            className="block text-sm mb-1"
          >
            <span>{t("locationSearch.label")}</span>
            <LocationSearch
              id="offer-form-location-search"
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onFocus={() => setSearchQuery((prev) => prev || addressRef.current?.value || "")}
              onBlur={() => setSearchQuery("")}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("locationSearch.placeholder")}
              aria-labelledby="address_label"
              ref={locationSearchRef}
              className="input text-sm"
              onSelectLocation={(lat, lng) => {
                handleSelectLocation(lat, lng);
                mapRef.current?.centerOn(Leaflet.latLng(lat, lng));
                setSearchQuery("");
                locationSearchRef.current?.blur();
              }}
            />
          </label>

          <CoordinatesInput
            setLatLng={updateLatLng}
            latLng={latLng}
            label={t("offerForm.labels.coordinates")}
            inputId="offer-coordinates"
            latFieldName="lat"
            lngFieldName="lng"
            inputClassName="input"
            labelClassName="col-span-2"
          />
        </div>

        <Legend mode="edit" />

        <Suspense fallback={<div className="mb-4 h-96 w-full bg-black/30" />}>
          <EventMap
            mode="offerLocSelect"
            editingOffer={form}
            ref={setMapRef}
            event={event}
            // onBoundsChange={setBounds}
            initialPosition={latLng}
            setLocation={updateLatLng}
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
