export type AdminEventType = "retreat" | "seminar" | "silent-retreat";

export interface AdminEvent {
  id: number;
  hashId: string;
  name: string;
  type: AdminEventType;
  start_date: string;
  days: number;
  private: boolean;
  loc_name: string | null;
  loc_address: string;
  loc_lat: number;
  loc_lng: number;
  loc_original_link: string | null;
  original_event_id: number | null;
  image_id?: number | null;
  image_url?: string | null;
  offers_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminEventFormValues {
  name: string;
  type: AdminEventType;
  start_date: string;
  days: number;
  private: boolean;
  loc_name?: string;
  loc_address: string;
  loc_lat: number;
  loc_lng: number;
  loc_original_link?: string;
  original_event_id: number | null;
  image: File | null;
  image_url?: string | null;
}
