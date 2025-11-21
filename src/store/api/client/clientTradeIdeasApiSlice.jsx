import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientTradeIdeasApiSlice = createApi({
  reducerPath: "clientTradeIdeas",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getClientTradeIdeas: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/users/idea/get?page=${page}&limit=${limit}`,
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
  }),
});

export const { useGetClientTradeIdeasQuery, useGetClientTradeAnalysisQuery } =
  clientTradeIdeasApiSlice;
