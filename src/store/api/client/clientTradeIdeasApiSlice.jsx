import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientTradeIdeasApiSlice = createApi({
    reducerPath: 'clientTradeIdeas',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getClientTradeIdeas: builder.query({
            query: ({ page = 1, limit = 10 }) => `/users/idea/get?page=${page}&limit=${limit}`,
        }),
        getClientTradeAnalysis: builder.query({
            query: ({ page = 1, limit = 10 }) => `/users/trade-analysis/get?page=${page}&limit=${limit}`,
        }),
    }),
});

export const { useGetClientTradeIdeasQuery, useGetClientTradeAnalysisQuery } = clientTradeIdeasApiSlice;