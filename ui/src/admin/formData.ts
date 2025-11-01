import type { AdminEventFormValues, AdminEventType } from "./types";

const toNumber = (value: FormDataEntryValue | null, fallback: number = 0) =>
  typeof value === "string" && value.length ? Number(value) : fallback;

const toIntegerOrNull = (value: FormDataEntryValue | null, fallback: number = 0) =>
  Math.floor(toNumber(value, fallback)) || null;

const toOptionalString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

export const formDataToEventValues = (formData: FormData): AdminEventFormValues => {
  const imageEntry = formData.get("image");
  const image =
    imageEntry instanceof File && imageEntry.size > 0 && imageEntry.name ? imageEntry : null;

  return {
    name: toOptionalString(formData.get("name")),
    type: formData.get("type") as AdminEventType,
    start_date: toOptionalString(formData.get("start_date")),
    days: toNumber(formData.get("days"), 1),
    private: formData.get("private") === "on", // Checkbox returns "on" when checked
    loc_name: toOptionalString(formData.get("loc_name")),
    loc_address: toOptionalString(formData.get("loc_address")),
    loc_lat: toNumber(formData.get("loc_lat")),
    loc_lng: toNumber(formData.get("loc_lng")),
    loc_original_link: toOptionalString(formData.get("loc_original_link")) || undefined,
    original_event_id: toIntegerOrNull(formData.get("original_event_id")),
    image,
  };
};
