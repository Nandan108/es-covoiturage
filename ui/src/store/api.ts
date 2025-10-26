// ui/src/store/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { EventSummary, EventDetail, Offer, HashId, Meta } from "@/types/types";
import { getOfferToken, rememberOfferToken } from "@/utils/offerTokens";

type OfferCreatePayload = Omit<
  Offer,
  "id" | "eventHash" | "created_at" | "updated_at" | "token_hash" | "token_expires_at"
> & {
  token_hash?: Offer["token_hash"];
  token_expires_at?: Offer["token_expires_at"];
};

export type Api = typeof api;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (b) => ({
    getEvents: b.query<EventSummary[], void>({
      query: () => "/events",
      transformResponse: (res: { data: EventSummary[]; meta?: Meta }) => res.data,
      keepUnusedDataFor: 60 * 60 * 24, // 24 hours in seconds
    }),

    getEvent: b.query<EventDetail, HashId>({
      query: (id) => `events/${id}`,
      transformResponse: (res: { data: EventDetail }) => res.data,
    }),

    createOffer: b.mutation<
      { offer: Offer; edit_token: string, expires_at: string },
      {
        eventHash: HashId;
        payload: OfferCreatePayload;
      }
    >({
      query: ({ eventHash, payload }) => ({
        url: `events/${eventHash}/offers`,
        method: "POST",
        body: { ...payload },
      }),
      async onQueryStarted({ eventHash, payload }, { dispatch, queryFulfilled }) {
        // 1) Optimistically insert a temporary offer into the event cache
        const tempId = -Date.now(); // negative sentinel id
        const now = new Date().toISOString();
        const tempOffer: Offer = {
          id: tempId,
          eventHash,
          created_at: now,
          updated_at: now,
          ...payload,
          token_hash: payload.token_hash ?? null,
          token_expires_at: payload.token_expires_at ?? null,
        };

        // 1.a) Update the event detail cache
        const patchEvent = dispatch(
          api.util.updateQueryData("getEvent", eventHash, (draft) => {
            draft.offers.push(tempOffer);
          })
        );

        // 1.b) Update the event list cache (if present)
        const patchList = dispatch(
          api.util.updateQueryData("getEvents", undefined, (draft) => {
            const e = draft.find((e) => e.hashId === eventHash);
            if (e && typeof e.offers_count === "number") e.offers_count += 1;
          })
        );

        try {
          const { data: { offer, edit_token, expires_at } } = await queryFulfilled;
          // 2.a) Replace temp offer with server offer
          dispatch(
            api.util.updateQueryData("getEvent", eventHash, (draft) => {
              const i = draft.offers.findIndex((o) => o.id === tempId);
              if (i !== -1) draft.offers[i] = offer;
            })
          );
          // 2.b) Store the edit token
          rememberOfferToken(offer.id, edit_token, expires_at);
        } catch {
          // 3) Roll back if the request failed
          patchEvent.undo();
          patchList.undo();
        }
      },
    }),

    updateOffer: b.mutation<
      Offer,
      {
        offerId: number;
        eventHash: HashId;
        patch: Partial<Omit<Offer, "id" | "event_id" | "created_at">>;
      }
    >({
      query: ({ offerId, eventHash, patch }) => {
        const headers: Record<string, string> = { Accept: "application/json" };
        const token = getOfferToken(offerId);
        if (token) headers["X-Offer-Token"] = token;

        return {
          url: `events/${eventHash}/offers/${offerId}`,
          method: "PATCH",
          body: patch,
          headers,
        };
      },
      async onQueryStarted({ offerId, eventHash, patch }, { dispatch, queryFulfilled }) {
        const prev = dispatch(
          api.util.updateQueryData("getEvent", eventHash, (draft) => {
            const o = draft.offers.find((o) => o.id === offerId);
            if (o) Object.assign(o, patch, { updated_at: new Date().toISOString() });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          prev.undo();
        }
      },
    }),

    deleteOffer: b.mutation<{ success: boolean }, { id: number; eventHash: HashId }>({
      query: ({ id, eventHash }) => {
        const headers: Record<string, string> = {};
        const token = getOfferToken(id);
        if (token) headers["X-Offer-Token"] = token;

        return {
          url: `events/${eventHash}/offers/${id}`,
          method: "DELETE",
          headers,
        };
      },
      async onQueryStarted({ id, eventHash }, { dispatch, queryFulfilled }) {
        const patchEvent = dispatch(
          api.util.updateQueryData("getEvent", eventHash, (draft) => {
            draft.offers = draft.offers.filter((o) => o.id !== id);
          })
        );
        const patchList = dispatch(
          api.util.updateQueryData("getEvents", undefined, (draft) => {
            const e = draft.find((e) => e.hashId === eventHash);
            if (e && typeof e.offers_count === "number") e.offers_count -= 1;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchEvent.undo();
          patchList.undo();
        }
      },
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = api;

const devRoot = "http://127.0.0.1:8000";
const origin = import.meta.env.DEV ? devRoot : "";

export function getApiUrl(path: string) {
  return `${origin}/api/${path.replace(/^\/+/, "")}`;
}

export function getImageUrl(image_url: string) {
  return origin + image_url;
}
