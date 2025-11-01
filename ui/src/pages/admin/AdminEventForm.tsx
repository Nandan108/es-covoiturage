import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Form, useFetcher, useNavigation } from "react-router";
import type { AdminEventFormValues, AdminEventType } from "@/admin/types";
import { useI18n } from "@/i18n/I18nProvider";
import { getImageUrl } from "@/store/api";
import LocationSearch from "@/components/locationSearch";
import { Legend } from "@/components/map/Legend";
import Leaflet from "leaflet";
import type L from "leaflet";
import type { MapActions } from "@/components/map/EventMap";
import CoordinatesInput from "@/components/CoordinatesInput";

const EventMap = lazy(() => import("@/components/map/EventMap"));

type Props = {
  initialValues: AdminEventFormValues;
  submitLabel: string;
  submittingLabel: string;
  headline: string;
  formAction?: string;
  method?: "post" | "put";
};

const numberFields = new Set<keyof AdminEventFormValues>(["days", "loc_lat", "loc_lng"]);
const adminEventTypes: AdminEventType[] = ["retreat", "seminar", "silent-retreat"];

function AdminEventForm({
  initialValues,
  submitLabel,
  submittingLabel,
  headline,
  formAction,
  method = "post",
}: Props) {
  const { t } = useI18n();
  const [values, setValues] = useState<AdminEventFormValues>(initialValues);
  const [searchQuery, setSearchQuery] = useState("");
  const [latLng, setLatLng] = useState<L.LatLng | null>(() =>
    Number.isFinite(initialValues.loc_lat) && Number.isFinite(initialValues.loc_lng)
      ? Leaflet.latLng(initialValues.loc_lat, initialValues.loc_lng)
      : null
  );

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const locationSearchRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<MapActions | null>(null);
  const setMapRef = useCallback((instance: MapActions | null) => {
    mapRef.current = instance;
  }, []);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValues(initialValues);
    setLatLng(
      Number.isFinite(initialValues.loc_lat) && Number.isFinite(initialValues.loc_lng)
        ? Leaflet.latLng(initialValues.loc_lat, initialValues.loc_lng)
        : null
    );
  }, [initialValues]);

  const deleteFetcher = useFetcher();
  const isDeleting = deleteFetcher.state === "submitting";

  const updateValue = (
    key: keyof AdminEventFormValues,
    value: string | number | boolean | File | null
  ) => {
    setValues((prev) => {
      let next: AdminEventFormValues;
      if (key === "original_event_id") {
        const nextValue = value === "" ? null : Number(value);
        next = { ...prev, original_event_id: Number.isNaN(nextValue) ? null : nextValue };
      } else {
        next = {
          ...prev,
          [key]: numberFields.has(key) ? Number(value) : value,
        } as AdminEventFormValues;
      }
      if ((key === "loc_lat" || key === "loc_lng") && Number.isFinite(Number(value))) {
        const lat = key === "loc_lat" ? Number(value) : next.loc_lat;
        const lng = key === "loc_lng" ? Number(value) : next.loc_lng;
        setLatLng(Leaflet.latLng(lat, lng));
      }
      return next;
    });
  };

  type EditableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  const handleInputChange = (event: ChangeEvent<EditableElement>) => {
    const target = event.currentTarget;
    const { name, value } = target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      updateValue(name as keyof AdminEventFormValues, target.checked);
      return;
    }
    updateValue(name as keyof AdminEventFormValues, value);
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    updateValue("image", file);
  };

  const handleSelectLocation = (lat: number, lng: number) => {
    const point = Leaflet.latLng(lat, lng);
    setLatLng(point);
    setValues((prev) => ({
      ...prev,
      loc_lat: lat,
      loc_lng: lng,
    }));
    mapRef.current?.centerOn(point);
  };

  const handleMapLocation = (point: L.LatLng) => {
    setLatLng(point);
    setValues((prev) => ({
      ...prev,
      loc_lat: point.lat,
      loc_lng: point.lng,
    }));
  };

  const mapEvent = useMemo(
    () => ({
      loc_lat: values.loc_lat,
      loc_lng: values.loc_lng,
      loc_name: values.loc_name || values.name,
      hashId: "admin-preview",
      offers: [],
    }),
    [values.loc_lat, values.loc_lng, values.loc_name, values.name]
  );

  return (
    <>
      <Form method={method} action={formAction} encType="multipart/form-data" className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{headline}</h1>
          {/* <p className="text-sm text-slate-500">{t("admin.events.form.subtitle")}</p> */}
        </div>
        <div className="grid gap-6 grid-cols-4 xs:grid-cols-1">
          <label className="text-sm font-medium text-slate-600 col-span-4 sm:col-span-2 lg:col-span-1">
            {t("admin.events.form.name")}
            <input
              type="text"
              name="name"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              value={values.name}
              onChange={handleInputChange}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-600 col-span-4 sm:col-span-2 lg:col-span-1">
            {t("admin.events.form.type")}
            <select
              name="type"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
              value={values.type}
              onChange={handleInputChange}
              required
            >
              {adminEventTypes.map((type) => (
                <option key={type} value={type}>
                  {t(`admin.events.form.type.${type}` as const)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600 col-span-4 sm:col-span-2 lg:col-span-1">
            {t("admin.events.form.startDate")}
            <input
              type="date"
              name="start_date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              value={values.start_date}
              onChange={handleInputChange}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-600 col-span-4 sm:col-span-2 lg:col-span-1">
            {t("admin.events.form.days")}
            <input
              type="number"
              min={1}
              name="days"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              value={values.days}
              onChange={handleInputChange}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-600 col-span-4 flex flex-row gap-3 items-start">
            {/* Private event toggle */}
            <span>{t("admin.events.form.private")}</span>
            <input
              type="checkbox"
              name="private"
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              checked={values.private}
              onChange={handleInputChange}
            />
          </label>
          <label className="text-sm font-medium text-slate-600  col-span-4 sm:col-span-2 ">
            {t("admin.events.form.locName")}
            <input
              type="text"
              name="loc_name"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              value={values.loc_name ?? ""}
              onChange={handleInputChange}
            />
          </label>
          <label className="text-sm font-medium text-slate-600  col-span-4 sm:col-span-2 ">
            {t("admin.events.form.address")}
            <input
              type="text"
              name="loc_address"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              value={values.loc_address}
              onChange={handleInputChange}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-600 col-span-4 sm:col-span-2">
            {t("admin.events.form.originalLink")}
            <input
              type="url"
              name="loc_original_link"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              value={values.loc_original_link ?? ""}
              onChange={handleInputChange}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 col-span-4 sm:col-span-2">
            {t("admin.events.form.originalId")}
            <input
              type="number"
              name="original_event_id"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              value={values.original_event_id ?? ""}
              onChange={handleInputChange}
              min={1}
            />
          </label>
          <div className="flex items-center gap-4 col-span-4">
            {values.image_url ? (
              <img
                src={getImageUrl(values.image_url)}
                alt={values.name}
                className="h-32 w-48 rounded-lg object-cover shadow cursor-pointer"
                onClick={() => imageInputRef.current?.click()}
              />
            ) : (
              <div className="flex h-32 w-48 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
                {t("admin.events.noImage")}
              </div>
            )}
            <label className="text-sm font-medium text-slate-600">
              <span className="block pb-4">{t("admin.events.form.image")}</span>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="admin-input border-dashed"
                onChange={handleImage}
              />
              <span className="mt-1 block text-xs text-slate-500">
                {t("admin.events.form.imageHint")}
              </span>
            </label>
          </div>
          <div className="col-span-4 sm:col-span-2">
            <label
              htmlFor="admin-event-location-search"
              id="admin-event-location-search-label"
              className="block text-sm font-medium text-slate-600"
            >
              {t("locationSearch.label")}
            </label>
            <LocationSearch
              id="admin-event-location-search"
              ref={locationSearchRef}
              className="admin-input"
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onFocus={() =>
                setSearchQuery((prev) => {
                  if (prev) return prev;
                  const combined = [values.loc_address, values.loc_name].filter(Boolean).join(", ");
                  return combined || "";
                })
              }
              onBlur={() => setSearchQuery("")}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("locationSearch.placeholder")}
              aria-labelledby="admin-event-location-search-label"
              onSelectLocation={(lat, loc) => {
                handleSelectLocation(lat, loc);
                mapRef.current?.centerOn(Leaflet.latLng(lat, loc));
                setSearchQuery("");
                locationSearchRef.current?.blur();
              }}
            />
          </div>

          <CoordinatesInput
            setLatLng={setLatLng}
            latLng={latLng}
            labelClassName="col-span-4 sm:col-span-2 block text-sm font-medium text-slate-600"
            inputClassName="admin-input"
          />
        </div>
        <div>
          <Legend mode="edit" />
          <Suspense fallback={<div className="h-96 w-full rounded-2xl bg-slate-200" />}>
            <EventMap
              mode="eventLocSelect"
              ref={setMapRef}
              event={mapEvent}
              initialPosition={latLng}
              className="h-96 w-full overflow-hidden rounded-2xl bg-black/10"
              setLocation={handleMapLocation}
            />
          </Suspense>
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-6 py-2 text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
          {method === "put" && (
            <button
              type="submit"
              form="delete-form"
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? t("admin.events.deleting") : t("admin.events.delete")}
            </button>
          )}
        </div>
      </Form>
      {method === "put" && <deleteFetcher.Form id="delete-form" method="delete" />}
    </>
  );
}

export default AdminEventForm;
