import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientTvSignalsApiSlice = createApi({
  reducerPath: "clientTvSignals",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TvSignals", "TvSignalDetail", "TvFilters", "TvFilterPrefs", "TvStrategyPrefs"],
  endpoints: (builder) => ({
    getClientTvSignals: builder.query({
      query: ({
        page = 1,
        limit = 12,
        // Exclusion-based multi-select filters (arrays of unchecked values)
        excludedSymbols = [],
        excludedSignalTypes = [],
        excludedStrategies = [],
        excludedTimeframes = [],
        // Strategy-specific display filters
        entryType = "",          // Defy: "confirmed" | "pending" | ""
        excludedEntryTypes = [], // Defy multi-select exclusion
        // Legacy single-value filters (backward compat)
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

        // Multi-select exclusion params (preferred)
        if (excludedSymbols.length > 0) params.set("excludedSymbols", excludedSymbols.join(","));
        if (excludedSignalTypes.length > 0) params.set("excludedSignalTypes", excludedSignalTypes.join(","));
        if (excludedStrategies.length > 0) params.set("excludedStrategies", excludedStrategies.join(","));
        if (excludedTimeframes.length > 0) params.set("excludedTimeframes", excludedTimeframes.join(","));

        // Defy entry type filter
        if (entryType) params.set("entryType", entryType);
        if (excludedEntryTypes.length > 0) params.set("excludedEntryTypes", excludedEntryTypes.join(","));

        // Legacy single-value fallback
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

    getFilterOptions: builder.query({
      query: () => `/users/tv-signals/filters`,
      providesTags: [{ type: "TvFilters" }],
    }),

    getFilterPreferences: builder.query({
      query: () => `/users/tv-signals/filter-preferences`,
      providesTags: [{ type: "TvFilterPrefs" }],
    }),

    saveFilterPreferences: builder.mutation({
      query: (prefs) => ({
        url: `/users/tv-signals/filter-preferences`,
        method: "PUT",
        body: prefs,
      }),
      invalidatesTags: [{ type: "TvFilterPrefs" }],
    }),

    // ── Strategy-specific filter preferences (Bullseye / Defy) ───────────
    getStrategyFilterPreferences: builder.query({
      query: () => `/users/tv-signals/strategy-filter-preferences`,
      providesTags: [{ type: "TvStrategyPrefs" }],
    }),

    saveStrategyFilterPreferences: builder.mutation({
      query: (prefs) => ({
        url: `/users/tv-signals/strategy-filter-preferences`,
        method: "PUT",
        body: prefs,
      }),
      invalidatesTags: [{ type: "TvStrategyPrefs" }],
    }),
  }),
});

export const {
  useGetClientTvSignalsQuery,
  useGetClientTvSignalDetailQuery,
  useGetFilterOptionsQuery,
  useGetFilterPreferencesQuery,
  useSaveFilterPreferencesMutation,
  useGetStrategyFilterPreferencesQuery,
  useSaveStrategyFilterPreferencesMutation,
} = clientTvSignalsApiSlice;
