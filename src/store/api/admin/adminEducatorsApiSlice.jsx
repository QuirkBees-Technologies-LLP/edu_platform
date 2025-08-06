import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminEducatorsApiSlice = createApi({
    reducerPath: 'adminEducators',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducators: builder.query({
            query: ({ page = 1, limit = 10 ,search="" }) => `/admin/educator/list?page=${page}&limit=${limit}&search=${search}`,
        }),
       
        createEducator: builder.mutation({
            query: (data) => ({
                url: '/admin/educator/create',
                method: 'POST',
                body: data,
            }),
        }),
        updateEducator: builder.mutation({
            query: ({formData, id}) => ({
                url: `/admin/educator/update/${id}`,
                method: 'PUT',
                body: formData,
            }),
        }),
        deleteEducator: builder.mutation({
            query: (id) => ({
                url: `/admin/educator/remove/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useGetEducatorsQuery, useLazyGetEducatorsQuery, useCreateEducatorMutation, useUpdateEducatorMutation, useDeleteEducatorMutation } = adminEducatorsApiSlice;