import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorTradeIdeasApiSlice = createApi({
    reducerPath: 'educatorTradeIdeas',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorTradeIdeas: builder.query({
            query: ({ page = 1, limit = 10 }) => `/educator/trade-idea/get?page=${page}&limit=${limit}`,
        }),
        createEducatorTradeIdeas: builder.mutation({
            query: (data) => ({
                url: '/educator/trade-idea/create',
                method: 'POST',
                body: data,
            }),
        }),
        updateEducatorTradeIdea: builder.mutation({
            query: (updatedTrade) => ({
                url: `/educator/trade-idea/updated/${updatedTrade.get("id")}`,
                method: 'POST',
                body: updatedTrade,
                formData: true
            }),
        }),
        deleteEducatorTradeIdea: builder.mutation({
            query: (id) => ({
                url: `/educator/trade-idea/remove/${id}`,
                method: 'POST',
            }),
        }),
    }),
});

export const { useGetEducatorTradeIdeasQuery, useLazyGetEducatorTradeIdeasQuery, useCreateEducatorTradeIdeasMutation, useUpdateEducatorTradeIdeaMutation, useDeleteEducatorTradeIdeaMutation } = educatorTradeIdeasApiSlice;