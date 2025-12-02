import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientTradeIdeasApiSlice = createApi({
  reducerPath: "clientTradeIdeas",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getClientTradeIdeas: builder.query({
      query: ({ page = 1, limit = 10, status = "", category = [] }) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);

        if (status) params.set("status", status);

        if (Array.isArray(category) && category.length > 0) {
          category.forEach((id) => params.append("categoryId", id));
        }

        return `/users/idea/get?${params.toString()}`;
      },
    }),
    getClientTradeAnalysis: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        // timeframe = "",
        markets = "",
      }) => {
        const params = new URLSearchParams({
          page,
          limit,
          search,
          //   timeframe,
          markets,
        });

        return `/users/trade-analysis/list?${params.toString()}`;
      },
    }),
    getClientCryptoAnalysis: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        // timeframe = "",
        // markets = "",
      }) => {
        const params = new URLSearchParams({
          page,
          limit,
          search,
          //   timeframe,
          // markets,
        });

        return `/users/crypto-analysis/list?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useGetClientTradeIdeasQuery,
  useGetClientTradeAnalysisQuery,
  useGetClientCryptoAnalysisQuery,
} = clientTradeIdeasApiSlice;
