import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminEducatorsApiSlice = createApi({
    reducerPath: 'adminEducators',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducators: builder.query({
            query: ({ page = 1, limit = 10 }) => `/admin/educator/list?page=${page}&limit=${limit}`,
        }),
       
        createEducator: builder.mutation({
            query: (data) => ({
                url: '/admin/educator/create',
                method: 'POST',
                body: data,
            }),
        }),
        updateEducator: builder.mutation({
            query: (updatedTrade) => ({
                url: `/admin/idea/updated/${updatedTrade.get("id")}`,
                method: 'POST',
                body: updatedTrade,
                formData: true
            }),
        }),
        deleteEducator: builder.mutation({
            query: (id) => ({
                url: `/admin/idea/remove/${id}`,
                method: 'POST',
            }),
        }),
    }),
});

export const { useGetEducatorsQuery, useLazyGetEducatorsQuery, useCreateEducatorMutation, useUpdateEducatorMutation, useDeleteEducatorMutation } = adminEducatorsApiSlice;