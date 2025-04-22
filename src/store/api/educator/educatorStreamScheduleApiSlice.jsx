import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorStreamScheduleApiSlice = createApi({
    reducerPath: 'educatorStreamSchedule',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorStreamSchedule: builder.query({
            query: ({ page = 1, limit = 10 }) => `/educator/schedule?page=${page}&limit=${limit}`,
        }),
        createEducatorStreamSchedule: builder.mutation({
            query: (data) => ({
                url: '/educator/schedule',
                method: 'POST',
                body: data,
                formData: true,
            }),
        }),
        updateEducatorStreamSchedule: builder.mutation({
            query: ({data, id}) => ({
                url: `/educator/schedule/${id}`,
                method: 'PUT',
                body: data,
                formData: true
            }),
        }),
        deleteEducatorStreamSchedule: builder.mutation({
            query: (id) => ({
                url: `/educator/schedule/${id}`,
                method: 'POST',
            }),
        }),
    }),
});

export const { useGetEducatorStreamScheduleQuery, useLazyGetEducatorStreamScheduleQuery, useCreateEducatorStreamScheduleMutation, useUpdateEducatorStreamScheduleMutation, useDeleteEducatorStreamScheduleMutation } = educatorStreamScheduleApiSlice;