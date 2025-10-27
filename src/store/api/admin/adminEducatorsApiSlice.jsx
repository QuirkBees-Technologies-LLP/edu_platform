import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminEducatorsApiSlice = createApi({
  reducerPath: "adminEducators",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getEducators: builder.query({
      query: ({ page = 1, limit = 10, search = "" , educator = "" }) =>
        `/admin/educator/list?page=${page}&limit=${limit}&search=${search}&educator=${educator}`,
    }),

    createEducator: builder.mutation({
      query: (data) => ({
        url: "/admin/educator/create",
        method: "POST",
        body: data,
      }),
    }),
    updateEducator: builder.mutation({
      query: ({ formData, id }) => ({
        url: `/admin/educator/update/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),
    deleteEducator: builder.mutation({
      query: (id) => ({
        url: `/admin/educator/remove/${id}`,
        method: "DELETE",
      }),
    }),
    educatorKpis: builder.query({
      query: ({ callId }) => `/educator/kpi/${callId}`,
    }),
    kpis: builder.query({
      query: ({ page = 1, limit = 10, educatorId, startDate, endDate , search="" }) => {
        let url = `/admin/kpi?page=${page}&limit=${limit}`;
        if (educatorId) {
          url += `&educatorId=${educatorId}`;
        }
        if (startDate) {
          url += `&startDate=${startDate}`;
        }

        if (endDate) {
          url += `&endDate=${endDate}`;
        }
        if(search){
          url += `&search=${search}`

        }
        return url;
      },
    }),
    logs: builder.query({
      query: ({ page = 1, limit = 10, startDate, endDate , search="" }) => {
        let url = `/logs?page=${page}&limit=${limit}`;
        
        if (startDate) {
          url += `&startDate=${startDate}`;
        }

        if (endDate) {
          url += `&endDate=${endDate}`;
        }
        if(search){
          url += `&search=${search}`

        }
        return url;
      },
    }),

    kpisExport: builder.mutation({
      query: (payload) => ({
        url: "/educator/kpi/", // backend endpoint
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

export const {
  useGetEducatorsQuery,
  useLazyGetEducatorsQuery,
  useCreateEducatorMutation,
  useUpdateEducatorMutation,
  useDeleteEducatorMutation,
  useEducatorKpisQuery,
  useLazyKpisQuery,
  useLazyLogsQuery,
  useKpisExportMutation,
} = adminEducatorsApiSlice;
