import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminAcademyCategoryApiSlice = createApi({
    reducerPath: 'adminAcademyCategory',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAdminAcademyCategory: builder.query({
            query: ({ page = 1, limit = 10 }) => `/admin/category?page=${page}&limit=${limit}`,
        }),
        createAdminAcademyCategory: builder.mutation({
            query: (data) => ({
                url: '/admin/category',
                method: 'POST',
                body: data,
            }),
        }),
        updateAdminAcademyCategory: builder.mutation({
            query: ({data, id}) => ({
                url: `/admin/category/${id}`,
                method: 'PUT',
                body: data,
                formData: true
            }),
        }),
        deleteAdminAcademyCategory: builder.mutation({
            query: (id) => ({
                url: `/admin/category/${id}`,   
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useLazyGetAdminAcademyCategoryQuery, useCreateAdminAcademyCategoryMutation, useUpdateAdminAcademyCategoryMutation, useDeleteAdminAcademyCategoryMutation} = adminAcademyCategoryApiSlice;