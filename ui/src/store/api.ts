// ui/src/store/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { EventSummary, EventDetail, Offer, HashId } from "../types";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (b) => ({
    getEvents: b.query<EventSummary[], void>({
      query: () => "events",
    }),

    getEvent: b.query<EventDetail, HashId>({
      query: (id) => `events/${id}`,
    }),

    createOffer: b.mutation<
      // ResultType
      { offer: Offer; edit_token?: string },
      // QueryArg
      {
        eventHash: HashId; // cache key for getEvent()
        payload: Omit<Offer, "id" | "eventHash" | "created_at" | "updated_at">;
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
          const { data } = await queryFulfilled;
          // 2) Replace temp offer with server offer
          dispatch(
            api.util.updateQueryData("getEvent", eventHash, (draft) => {
              const i = draft.offers.findIndex((o) => o.id === tempId);
              if (i !== -1) draft.offers[i] = data.offer;
            })
          );
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
        id: number;
        eventHash: HashId;
        token: string;
        patch: Partial<Omit<Offer, "id" | "event_id" | "created_at">>;
      }
    >({
      query: ({ id, eventHash, token, patch }) => ({
        url: `events/${eventHash}/offers/${id}`,
        method: "PATCH",
        body: patch,
        headers: { "X-Offer-Token": token },
      }),
      async onQueryStarted({ id, eventHash, patch }, { dispatch, queryFulfilled }) {
        const prev = dispatch(
          api.util.updateQueryData("getEvent", eventHash, (draft) => {
            const o = draft.offers.find((o) => o.id === id);
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

    deleteOffer: b.mutation<{ success: boolean }, { id: number; eventHash: HashId; token: string }>(
      {
        query: ({ id, eventHash, token }) => ({
          url: `events/${eventHash}/offers/${id}`,
          method: "DELETE",
          headers: { "X-Offer-Token": token },
        }),
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
      }
    ),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = api;
