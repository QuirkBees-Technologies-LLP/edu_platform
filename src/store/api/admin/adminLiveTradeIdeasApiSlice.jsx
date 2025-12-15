import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminLiveTradeIdeasApiSlice = createApi({
  reducerPath: 'adminLiveTradeIdeas',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAdminLiveTradeIdeas: builder.query({
      query: ({ page = 1, limit = 10, isview = true, category = "" }) => `/admin/live-idea?page=${page}&limit=${limit}&isview=${isview}&category=${category}`,
    }),
    createAdminLiveTradeIdea: builder.mutation({
      query: (data) => ({
        url: '/admin/live-idea',
        method: 'POST',
        body: data,
      }),
    }),
    updateAdminLiveTradeIdea: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/live-idea/${id}`,
        method: 'PUT',
        body: formData,
        formData: true
      }),
    }),
    deleteAdminLiveTradeIdea: builder.mutation({
      query: (id) => ({
        url: `/admin/live-idea/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const { useGetAdminLiveTradeIdeasQuery, useLazyGetAdminLiveTradeIdeasQuery, useCreateAdminLiveTradeIdeaMutation, useUpdateAdminLiveTradeIdeaMutation, useDeleteAdminLiveTradeIdeaMutation } = adminLiveTradeIdeasApiSlice;