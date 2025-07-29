import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorTradeAnalysisApiSlice = createApi({
    reducerPath: 'educatorTradeAnalysis',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorTradeAnalysis: builder.query({
            query: ({ page = 1, limit = 10 }) => `/educator/trade-analysis/?page=${page}&limit=${limit}`,
        }),
        createEducatorTradeAnalysis: builder.mutation({
            query: (data) => ({
                url: '/educator/trade-analysis/',
                method: 'POST',
                body: data,
            }),
        }),
        updateEducatorTradeAnalysis: builder.mutation({
            query: (updatedTrade) => ({
                url: `/educator/trade-analysis/${updatedTrade.get("id")}`,
                method: 'PUT',
                body: updatedTrade,
                formData: true
            }),
        }),
        deleteEducatorTradeAnalysis: builder.mutation({
            query: (id) => ({
                url: `/educator/trade-analysis/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useGetEducatorTradeAnalysisQuery, useLazyGetEducatorTradeAnalysisQuery, useCreateEducatorTradeAnalysisMutation, useUpdateEducatorTradeAnalysisMutation, useDeleteEducatorTradeAnalysisMutation } = educatorTradeAnalysisApiSlice;