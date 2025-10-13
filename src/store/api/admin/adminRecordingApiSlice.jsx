import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminRecordingApiSlice = createApi({
  reducerPath: "adminRecording",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAdminRecording: builder.query({
      query: () => `/admin/recording`,
    }),
    getAdminRecordingByCallID: builder.query({
      query: (id) => `/admin/recording?call_id=${id}`,
    }),
    getAdminRecordingByUserID: builder.query({
      query: ({ user_id, page = 1, limit = 10 }) =>
        `/admin/recording?user_id=${user_id}&page=${page}&limit=${limit}`,
    }),
    saveAdminRecording: builder.mutation({
      query: (data) => ({
        url: "/admin/recording",
        method: "POST",
        body: data,
        formData: true,
      }),
    }),
    updateAdminRecording: builder.mutation({
      query: ({ formData, id }) => ({
        url: `/admin/recording/${id}`,
        method: "PUT",
        body: formData,
        formData: true,
      }),
    }),
    deleteAdminRecording: builder.mutation({
      query: (id) => ({
        url: `/admin/recording/${id}`,
        method: "DELETE",
      }),
    }),

    createEducatorRecording: builder.mutation({
      query: (data) => ({
        url: "/admin/recording/manual",
        method: "POST",
        body: data,
        formData: true,
      }),
    }),
  }),
});

export const {
  useGetAdminRecordingQuery,
  useLazyGetAdminRecordingByUserIDQuery,
  useGetAdminRecordingByCallIDQuery,
  useLazyGetAdminRecordingQuery,
  useSaveAdminRecordingMutation,
  useUpdateAdminRecordingMutation,
  useDeleteAdminRecordingMutation,
  useCreateEducatorRecordingMutation
} = adminRecordingApiSlice;
