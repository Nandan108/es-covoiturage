import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AdminEventFormValues, AdminEvent } from "./types";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}

type DataResponse<T> = { data: T };

const getXsrfToken = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const baseQuery = fetchBaseQuery({
  baseUrl: "/api/admin",
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getXsrfToken();
    if (token) {
      headers.set("X-XSRF-TOKEN", token);
    }
    return headers;
  },
});

const toFormData = (values: AdminEventFormValues, isUpdate = false) => {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("type", values.type);
  formData.append("start_date", values.start_date);
  formData.append("days", String(values.days));
  formData.append("private", values.private ? "1" : "0");
  formData.append("loc_name", values.loc_name ?? "");
  formData.append("loc_address", values.loc_address);
  formData.append("loc_lat", String(values.loc_lat));
  formData.append("loc_lng", String(values.loc_lng));
  if (values.loc_original_link) {
    formData.append("loc_original_link", values.loc_original_link);
  } else {
    formData.append("loc_original_link", "");
  }
  if (values.original_event_id !== null && values.original_event_id !== undefined) {
    formData.append("original_event_id", String(values.original_event_id));
  } else {
    formData.append("original_event_id", "");
  }
  if (values.image instanceof File) {
    formData.append("image", values.image);
  } else if (!isUpdate && values.image === null) {
    formData.append("image", "");
  }
  return formData;
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery,
  tagTypes: ["AdminEvent", "AdminEvents"],
  endpoints: (builder) => ({
    currentAdmin: builder.query<AdminUser, void>({
      query: () => ({ url: "me" }),
    }),
    login: builder.mutation<{ admin: AdminUser }, { email: string; password: string }>({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "logout", method: "POST" }),
    }),
    listEvents: builder.query<AdminEvent[], void>({
      query: () => ({ url: "events" }),
      transformResponse: (response: DataResponse<AdminEvent[]>) => response.data,
      providesTags: (result) =>
        result
          ? ["AdminEvents", ...result.map((e) => ({ type: "AdminEvent" as const, id: e.hashId }))]
          : ["AdminEvents"],
    }),
    getEvent: builder.query<AdminEvent, string>({
      query: (hashId) => ({ url: `events/${hashId}` }),
      transformResponse: (response: DataResponse<AdminEvent>) => response.data,
      providesTags: (_res, _err, id) => [{ type: "AdminEvent", id }],
    }),
    createEvent: builder.mutation<AdminEvent, AdminEventFormValues>({
      query: (values) => ({
        url: "events",
        method: "POST",
        body: toFormData(values),
      }),
      transformResponse: (response: DataResponse<AdminEvent>) => response.data,
      invalidatesTags: ["AdminEvents"],
    }),
    updateEvent: builder.mutation<AdminEvent, { hashId: string; values: AdminEventFormValues }>({
      query: ({ hashId, values }) => {
        const body = toFormData(values, true);
        body.append("_method", "PUT");
        return {
          url: `events/${hashId}`,
          method: "POST",
          body,
        };
      },
      transformResponse: (response: DataResponse<AdminEvent>) => response.data,
      invalidatesTags: (_res, _err, arg) => [{ type: "AdminEvent", id: arg.hashId }, "AdminEvents"],
    }),
    deleteEvent: builder.mutation<{ message: string }, string>({
      query: (hashId) => ({ url: `events/${hashId}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [{ type: "AdminEvent", id }, "AdminEvents"],
    }),
  }),
});

export const {
  useCurrentAdminQuery,
  useLoginMutation,
  useLogoutMutation,
  useListEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = adminApi;
