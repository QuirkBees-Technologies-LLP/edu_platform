import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientTradeIdeasApiSlice = createApi({
  reducerPath: "clientTradeIdeas",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getClientTradeIdeas: builder.query({
      query: ({
        page = 1,
        limit = 9,
        status = "",
        educator="",
        categoryName = [],
        activeIdea = "",
        startDate = "",
        endDate = "",
      }) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);

        if (status) params.set("status", status);
        if (educator) params.set("educator", educator);
        if (activeIdea) params.set("ideaType", activeIdea);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        if (Array.isArray(categoryName) && categoryName.length > 0) {
          categoryName.forEach((name) => params.append("categoryName", name));
        }

        return `/users/idea/get?${params.toString()}`;
      },
    }),

    getClientLiveIdeas: builder.query({
      query: ({
        page = 1,
        limit = 9,
        status = "",
        categoryName = [],
        activeIdea = "",
        educator = "",
        startDate = "",
        endDate = "",
      }) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);

        if (status) params.set("status", status);
        if (activeIdea) params.set("ideaType", activeIdea);
        if (educator) params.set("educator", educator);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        if (Array.isArray(categoryName) && categoryName.length > 0) {
          categoryName.forEach((name) => params.append("categoryName", name));
        }

        return `/users/live-idea/get?${params.toString()}`;
      },
    }),
    getClientTradeAnalysis: builder.query({
      query: ({
        page = 1,
        limit = 9,
        search = "",
        educator = "",
        // timeframe = "",
        markets = "",
      }) => {
        const params = new URLSearchParams({
          page,
          limit,
          search,
          educator,
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
    getLiveTradeIdea: builder.query({
      query: ({ id, page = 1, limit = 9 }) => `/users/live-idea/${id}?page=${page}&limit=${limit}`,
    }),
    getAllEducators: builder.query({
      query: () => `/users/educator-course/list`,
    }),
  }),
});

export const {
  useGetClientTradeIdeasQuery,
  useGetClientLiveIdeasQuery,
  useGetClientTradeAnalysisQuery,
  useGetClientCryptoAnalysisQuery,
  useGetLiveTradeIdeaQuery,
  useGetAllEducatorsQuery,
} = clientTradeIdeasApiSlice;
