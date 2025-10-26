import type { AdminEventFormValues } from "@/admin/types";

export const adminEventDefaults: AdminEventFormValues = {
  name: "",
  type: "retreat",
  start_date: new Date().toISOString().slice(0, 10),
  days: 1,
  private: false,
  loc_name: "",
  loc_address: "",
  loc_lat: 46.5,
  loc_lng: 2.5,
  loc_original_link: "",
  original_event_id: null,
  image: null,
  image_url: null,
};
