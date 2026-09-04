import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminLiveTradeIdeasApiSlice = createApi({
  reducerPath: 'adminLiveTradeIdeas',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAdminLiveTradeIdeas: builder.query({
      query: ({ page = 1, limit = 10, isview = true, category = "", search = "", educator = "", status = "" }) => `/admin/live-idea?page=${page}&limit=${limit}&isview=${isview}&category=${category}&search=${search}&educator=${educator}&status=${status}`,
    }),
    createAdminLiveTradeIdea: builder.mutation({
      query: (data) => ({
        url: '/admin/live-idea/create',
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
    ideaExport: builder.mutation({
      query: (payload) => ({
        url: "/admin/live-idea/export-excel", // backend endpoint
        method: "POST",
        body: payload,
        responseHandler: async (response) => {
          const blob = await response.blob();
          return blob;
        },
      }),
    }),
  }),
});

export const { useGetAdminLiveTradeIdeasQuery, useLazyGetAdminLiveTradeIdeasQuery, useCreateAdminLiveTradeIdeaMutation, useUpdateAdminLiveTradeIdeaMutation, useDeleteAdminLiveTradeIdeaMutation,useIdeaExportMutation  } = adminLiveTradeIdeasApiSlice;