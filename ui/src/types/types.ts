// ui/src/types.ts
export type EventType = "retreat" | "seminar" | "silent-retreat";

export type ISODate = string; // 'YYYY-MM-DD'
export type ISODateTime = string; // 'YYYY-MM-DDTHH:mm:ssZ' (or similar)

export type HashId = string; // e.g. "event_kqYZeLgo"

export interface Offer {
  id: number;
  eventHash: HashId;
  name: string;
  address: string;
  lat: number;
  lng: number;
  // depart: ISODateTime | null;
  notes: string | null;
  phone: string | null;
  email: string | null;
  email_is_public: boolean;
  driver_seats: number;
  pasngr_seats: number;
  token_hash: string | null;
  token_expires_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface EventSummary {
  hashId: HashId;
  name: string;
  type: EventType;
  start_date: ISODate;
  days: number;
  original_event_id: number | null;
  loc_name: string;
  loc_address: string;
  loc_lat: number;
  loc_lng: number;
  loc_original_link: string;
  image_url: string; // static asset path
  offers_count?: number; // optional optimization for the list
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export type Meta = {
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
  from?: number;
  to?: number;
};

export interface EventDetail extends EventSummary {
  offers: Offer[];
}
