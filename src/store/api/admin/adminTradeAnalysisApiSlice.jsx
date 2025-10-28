import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminTradeAnalysisApiSlice = createApi({
    reducerPath: 'adminTradeAnalysis',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAdminTradeAnalysis: builder.query({
            query: ({ page = 1, limit = 10 , category = ""}) => `/admin/trade-analysis/?page=${page}&limit=${limit}&category=${category}`,
        }),
        createAdminTradeAnalysis: builder.mutation({
            query: (data) => ({
                url: '/admin/trade-analysis/',
                method: 'POST',
                body: data,
            }),
        }),
        updateAdminTradeAnalysis: builder.mutation({
            query: (updatedTrade) => ({
                url: `/admin/trade-analysis/${updatedTrade.get("id")}`,
                method: 'PUT',
                body: updatedTrade,
                formData: true
            }),
        }),
        deleteAdminTradeAnalysis: builder.mutation({
            query: (id) => ({
                url: `/admin/trade-analysis/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useGetAdminTradeAnalysisQuery, useLazyGetAdminTradeAnalysisQuery, useCreateAdminTradeAnalysisMutation, useUpdateAdminTradeAnalysisMutation, useDeleteAdminTradeAnalysisMutation } = adminTradeAnalysisApiSlice;