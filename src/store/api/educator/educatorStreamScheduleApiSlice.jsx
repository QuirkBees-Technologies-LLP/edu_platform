import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorStreamScheduleApiSlice = createApi({
  reducerPath: "educatorStreamSchedule",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getEducatorStreamSchedule: builder.query({
      query: ({ page = 1, limit = 10 , search = "" , status = ""}) =>
        `/educator/schedule?page=${page}&limit=${limit}&search=${search}&status=${status}`,
    }),
    createEducatorStreamSchedule: builder.mutation({
      query: (data) => ({
        url: "/educator/schedule",
        method: "POST",
        body: data,
        formData: true,
      }),
    }),
    updateEducatorStreamSchedule: builder.mutation({
      query: ({ data, id }) => ({
        url: `/educator/schedule/${id}`,
        method: "PUT",
        body: data,
        formData: true,
      }),
    }),
    deleteEducatorStreamSchedule: builder.mutation({
      query: (id) => ({
        url: `/educator/schedule/${id}`,
        method: "DELETE",
      }),
    }),
    createRecurrenceSchedule: builder.mutation({
      query: (formData) => ({
        url: "/educator/schedule/recurrence",
        method: "POST",
        body: formData,
      }),
    }),
    updateRecurrenceSchedule: builder.mutation({
      query: ({ data, id }) => ({
        url: `/educator/schedule/recurrence/${id}`,
        method: "PUT",
        body: data,
        formData: true,
      }),
    }),

    createLiveStream: builder.mutation({
      query: (formData) => ({
        url: "/educator/live-stream/create",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetEducatorStreamScheduleQuery,
  useLazyGetEducatorStreamScheduleQuery,
  useCreateEducatorStreamScheduleMutation,
  useUpdateEducatorStreamScheduleMutation,
  useDeleteEducatorStreamScheduleMutation,
  useCreateRecurrenceScheduleMutation,
  useCreateLiveStreamMutation,
  useUpdateRecurrenceScheduleMutation,
} = educatorStreamScheduleApiSlice;
