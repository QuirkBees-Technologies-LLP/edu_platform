import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorRecordingApiSlice = createApi({
    reducerPath: 'educatorRecording',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorRecording: builder.query({
            query: ({ page = 1, limit = 10 }) => `/educator/recording?page=${page}&limit=${limit}`,
        }),
        saveEducatorRecording: builder.mutation({
            query: (data) => ({
                url: '/educator/recording',
                method: 'POST',
                body: data,
                formData: true,
            }),
        }),
        updateEducatorRecording: builder.mutation({
            query: ({data, id}) => ({
                url: `/educator/recording/${id}`,
                method: 'PUT',
                body: data,
                formData: true
            }),
        }),
        deleteEducatorStreamSchedule: builder.mutation({
            query: (id) => ({
                url: `/educator/recording/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useGetEducatorStreamScheduleQuery, useLazyGetEducatorStreamScheduleQuery, useCreateEducatorStreamScheduleMutation, useUpdateEducatorStreamScheduleMutation, useDeleteEducatorStreamScheduleMutation } = educatorRecordingApiSlice;