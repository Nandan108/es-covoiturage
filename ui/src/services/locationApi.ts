import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const locationIqKey = import.meta.env.VITE_LOCATIONIQ_KEY;

if (!locationIqKey) {
  throw new Error("VITE_LOCATIONIQ_KEY is not set");
}

export type Loc = {
  lat: string;
  lon: string;
  address: {
    name?: string;
    house_number?: string;
    road?: string;
    postcode?: string;
    city?: string;
    country?: string;
  };
};

export const locationApi = createApi({
  reducerPath: "locationApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.locationiq.com/v1/" }),
  endpoints: (builder) => ({
    autocomplete: builder.query<Loc[], { query: string }>({
      query: ({ query }) => ({
        url: "autocomplete",
        params: {
          key: locationIqKey,
          limit: 10,
          dedupe: 1,
          "accept-language": "fr",
          normalizeaddress: 1,
          countrycodes: "fr,ch,be,ge,it,ca",
          q: query,
        },
      }),
    }),
  }),
});

export const { useAutocompleteQuery } = locationApi;
