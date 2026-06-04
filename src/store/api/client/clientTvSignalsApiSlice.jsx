import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientTvSignalsApiSlice = createApi({
  reducerPath: "clientTvSignals",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TvSignals", "TvSignalDetail", "TvUnreadCount", "TvFilters"],
  endpoints: (builder) => ({
    getClientTvSignals: builder.query({
      query: ({
        page = 1,
        limit = 12,
        symbol = "",
        signalType = "",
        strategy = "",
        timeframe = "",
        startDate = "",
        endDate = "",
        search = "",
      }) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);

        if (symbol) params.set("symbol", symbol);
        if (signalType) params.set("signalType", signalType);
        if (strategy) params.set("strategy", strategy);
        if (timeframe) params.set("timeframe", timeframe);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        if (search) params.set("search", search);

        return `/users/tv-signals?${params.toString()}`;
      },
      providesTags: [{ type: "TvSignals", id: "LIST" }],
    }),

    getClientTvSignalDetail: builder.query({
      query: (id) => `/users/tv-signals/${id}`,
      providesTags: (result, error, id) => [{ type: "TvSignalDetail", id }],
    }),

    markSignalRead: builder.mutation({
      query: (id) => ({
        url: `/users/tv-signals/${id}/read`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "TvSignals", id: "LIST" },
        { type: "TvSignalDetail", id },
        { type: "TvUnreadCount" },
      ],
    }),

    getUnreadCount: builder.query({
      query: () => `/users/tv-signals/unread-count`,
      providesTags: [{ type: "TvUnreadCount" }],
    }),

    getFilterOptions: builder.query({
      query: () => `/users/tv-signals/filters`,
      providesTags: [{ type: "TvFilters" }],
    }),
  }),
});

export const {
  useGetClientTvSignalsQuery,
  useGetClientTvSignalDetailQuery,
  useMarkSignalReadMutation,
  useGetUnreadCountQuery,
  useGetFilterOptionsQuery,
} = clientTvSignalsApiSlice;
