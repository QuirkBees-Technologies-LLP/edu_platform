import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorRecordingApiSlice = createApi({
  reducerPath: "educatorRecording",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getEducatorRecording: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/educator/recording?page=${page}&limit=${limit}`,
    }),
    getEducatorRecordingData: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/educator/recording?page=${page}&limit=${limit}`,
    }),
    getEducatorRecordingByCallID: builder.query({
      query: (id) => `/educator/recording?call_id=${id}`,
    }),
    saveEducatorRecording: builder.mutation({
      query: (data) => ({
        url: "/educator/recording",
        method: "POST",
        body: data,
        formData: true,
      }),
    }),
    updateEducatorRecording: builder.mutation({
      query: ({ formData, id }) => ({
        url: `/educator/recording/${id}`,
        method: "PUT",
        body: formData,
        formData: true,
      }),
    }),
    deleteEducatorRecording: builder.mutation({
      query: (id) => ({
        url: `/educator/recording/${id}`,
        method: "DELETE",
      }),
    }),
    createEducatorRecording: builder.mutation({
      query: (data) => ({
        url: "/educator/recording/manual",
        method: "POST",
        body: data,
        formData: true,
      }),
    }),
    createTemporaryRecording: builder.mutation({
      query: (data) => ({
        url: "/educator/recording/temporary",
        method: "POST",
        body: data,
        formData: true,
      }),
    }),
    createParmanentRecording: builder.mutation({
      query: (data) => ({
        url: "/educator/recording/permanent",
        method: "POST",
        body: data,
        formData: true,
      }),
    }),
  }),
});

export const {
  useGetEducatorStreamScheduleQuery,
  useGetEducatorRecordingByCallIDQuery,
  useGetEducatorRecordingDataQuery,
  useLazyGetEducatorRecordingQuery,
  useSaveEducatorRecordingMutation,
  useUpdateEducatorRecordingMutation,
  useDeleteEducatorRecordingMutation,
  useCreateEducatorRecordingMutation,
  useCreateTemporaryRecordingMutation,
  useCreateParmanentRecordingMutation,
} = educatorRecordingApiSlice;
