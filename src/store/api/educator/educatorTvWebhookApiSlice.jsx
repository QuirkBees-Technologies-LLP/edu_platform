import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorTvWebhookApiSlice = createApi({
  reducerPath: "educatorTvWebhook",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TvWebhookStatus"],
  endpoints: (builder) => ({
    getTvWebhookStatus: builder.query({
      query: () => `/educator/tv-webhook/status`,
      providesTags: ["TvWebhookStatus"],
    }),
    enableTvWebhook: builder.mutation({
      query: () => ({
        url: "/educator/tv-webhook/enable",
        method: "POST",
      }),
      invalidatesTags: ["TvWebhookStatus"],
    }),
    rotateTvWebhook: builder.mutation({
      query: () => ({
        url: "/educator/tv-webhook/rotate",
        method: "POST",
      }),
      invalidatesTags: ["TvWebhookStatus"],
    }),
    disableTvWebhook: builder.mutation({
      query: () => ({
        url: "/educator/tv-webhook/disable",
        method: "POST",
      }),
      invalidatesTags: ["TvWebhookStatus"],
    }),
  }),
});

export const {
  useGetTvWebhookStatusQuery,
  useEnableTvWebhookMutation,
  useRotateTvWebhookMutation,
  useDisableTvWebhookMutation,
} = educatorTvWebhookApiSlice;
