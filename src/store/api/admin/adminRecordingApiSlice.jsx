import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminRecordingApiSlice = createApi({
    reducerPath: 'adminRecording',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAdminRecording: builder.query({
            query: () => `/admin/recording`,
        }),
        getAdminRecordingByCallID: builder.query({
            query: (id) => `/admin/recording?call_id=${id}`,
        }),
        getAdminRecordingByUserID: builder.query({
            query: (id) => `/admin/recording?user_id=${id}`,
        }),
        saveAdminRecording: builder.mutation({
            query: (data) => ({
                url: '/admin/recording',
                method: 'POST',
                body: data,
                formData: true,
            }),
        }),
        updateAdminRecording: builder.mutation({
            query: ({formData, id}) => ({
                url: `/admin/recording/${id}`,
                method: 'PUT',
                body: formData,
                formData: true
            }),
        }),
        deleteAdminRecording: builder.mutation({
            query: (id) => ({
                url: `/admin/recording/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useGetAdminRecordingQuery, useLazyGetAdminRecordingByUserIDQuery, useGetAdminRecordingByCallIDQuery, useLazyGetAdminRecordingQuery, useSaveAdminRecordingMutation, useUpdateAdminRecordingMutation, useDeleteAdminRecordingMutation } = adminRecordingApiSlice;