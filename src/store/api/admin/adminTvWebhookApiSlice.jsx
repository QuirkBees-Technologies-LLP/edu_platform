import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";
import { clientTvSignalsApiSlice } from "../client/clientTvSignalsApiSlice";

export const adminTvWebhookApiSlice = createApi({
  reducerPath: "adminTvWebhook",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TvWebhookConfigs", "TvWebhookSignals", "TvDeliveryHistory"],
  endpoints: (builder) => ({
    // ── Webhook Configs ─────────────────────────────────────────
    getAdminTvWebhooks: builder.query({
      query: (params = {}) => ({
        url: "/admin/tv-webhook",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "TvWebhookConfigs",
                id: _id,
              })),
              { type: "TvWebhookConfigs", id: "LIST" },
            ]
          : [{ type: "TvWebhookConfigs", id: "LIST" }],
    }),

    getAdminTvWebhookById: builder.query({
      query: (id) => `/admin/tv-webhook/${id}`,
      providesTags: (result, error, id) => [
        { type: "TvWebhookConfigs", id },
      ],
    }),

    createAdminTvWebhook: builder.mutation({
      query: (body) => ({
        url: "/admin/tv-webhook",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "TvWebhookConfigs", id: "LIST" }],
    }),

    updateAdminTvWebhook: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/tv-webhook/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "TvWebhookConfigs", id: "LIST" },
        { type: "TvWebhookConfigs", id },
      ],
    }),

    deleteAdminTvWebhook: builder.mutation({
      query: (id) => ({
        url: `/admin/tv-webhook/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "TvWebhookConfigs", id: "LIST" }],
    }),

    regenerateWebhookSecret: builder.mutation({
      query: (id) => ({
        url: `/admin/tv-webhook/${id}/regenerate-secret`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "TvWebhookConfigs", id: "LIST" },
        { type: "TvWebhookConfigs", id },
      ],
    }),

    // ── Signals ─────────────────────────────────────────────────
    getWebhookSignals: builder.query({
      query: ({ id, ...params }) => ({
        url: `/admin/tv-webhook/${id}/signals`,
        params,
      }),
      providesTags: [{ type: "TvWebhookSignals", id: "LIST" }],
    }),

    getAllSignals: builder.query({
      query: (params = {}) => ({
        url: "/admin/tv-webhook/signals/all",
        params,
      }),
      providesTags: [{ type: "TvWebhookSignals", id: "LIST" }],
    }),

    // ── Delivery History ────────────────────────────────────────
    getDeliveryHistory: builder.query({
      query: ({ id, ...params }) => ({
        url: `/admin/tv-webhook/${id}/delivery-history`,
        params,
      }),
      providesTags: [{ type: "TvDeliveryHistory", id: "LIST" }],
    }),

    retrySignalNotification: builder.mutation({
      query: (signalId) => ({
        url: `/admin/tv-webhook/signals/${signalId}/retry-notification`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "TvWebhookSignals", id: "LIST" },
        { type: "TvDeliveryHistory", id: "LIST" },
      ],
    }),

    updateSignal: builder.mutation({
      query: ({ signalId, ...body }) => ({
        url: `/admin/tv-webhook/signals/${signalId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "TvWebhookSignals", id: "LIST" }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            clientTvSignalsApiSlice.util.invalidateTags([
              { type: "TvSignals", id: "LIST" },
              { type: "TvSignalDetail", id: arg.signalId },
              { type: "TvUnreadCount" },
            ])
          );
        } catch (err) {
          console.error("Failed to invalidate client signals:", err);
        }
      },
    }),
  }),
});

export const {
  useGetAdminTvWebhooksQuery,
  useLazyGetAdminTvWebhooksQuery,
  useGetAdminTvWebhookByIdQuery,
  useCreateAdminTvWebhookMutation,
  useUpdateAdminTvWebhookMutation,
  useDeleteAdminTvWebhookMutation,
  useRegenerateWebhookSecretMutation,
  useGetWebhookSignalsQuery,
  useLazyGetWebhookSignalsQuery,
  useGetAllSignalsQuery,
  useGetDeliveryHistoryQuery,
  useLazyGetDeliveryHistoryQuery,
  useRetrySignalNotificationMutation,
  useUpdateSignalMutation,
} = adminTvWebhookApiSlice;
