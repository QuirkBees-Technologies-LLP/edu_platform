
import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminCoursesTypesApiSlice = createApi({
    reducerPath: 'adminCoursesTypes',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAdminCoursesTypes: builder.query({
            query: ({ page = 1, limit = 10 ,search="" }) => `/admin/course-type?page=${page}&limit=${limit}&search=${search}`,
        }),
       
        createAdminCoursesTypes: builder.mutation({
            query: (data) => ({
                url: '/admin/course-type/',
                method: 'POST',
                body: data,
            }),
        }),
        updateAdminCoursesTypes: builder.mutation({
            query: (updatedTrade) => ({
                url: `/admin/course-type/${updatedTrade.id}`,
                method: 'PUT',
                body: updatedTrade,
            }),
        }),
        deleteAdminCoursesTypes: builder.mutation({
            query: (id) => ({
                url: `/admin/course-type/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useLazyGetAdminCoursesTypesQuery, useCreateAdminCoursesTypesMutation, useUpdateAdminCoursesTypesMutation, useDeleteAdminCoursesTypesMutation } = adminCoursesTypesApiSlice;