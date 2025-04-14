import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminTradeIdeasApiSlice = createApi({
    reducerPath: 'adminTradeIdeas',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAdminTradeIdeas: builder.query({
            query: ({ page = 1, limit = 10 }) => `/admin/idea/get?page=${page}&limit=${limit}`,
        }),
        getUsers: builder.query({
            query: () => 'users',
        }),
        getComments: builder.query({
            query: () => 'comments',
        }),
        createTradeIdeas: builder.mutation({
            query: (data) => ({
                url: '/admin/idea/create',
                method: 'POST',
                body: data,
            }),
        }),
        updateTradeIdea: builder.mutation({
            query: (updatedTrade) => ({
                url: `/admin/idea/updated/${updatedTrade.get("id")}`,
                method: 'POST',
                body: updatedTrade,
                formData: true
            }),
        }),
        deleteTradeIdea: builder.mutation({
            query: (id) => ({
                url: `/admin/idea/remove/${id}`,
                method: 'POST',
            }),
        }),
    }),
});

export const { useGetAdminTradeIdeasQuery, useLazyGetAdminTradeIdeasQuery, useGetUsersQuery, useGetCommentsQuery, useCreateTradeIdeasMutation, useUpdateTradeIdeaMutation, useDeleteTradeIdeaMutation } = adminTradeIdeasApiSlice;