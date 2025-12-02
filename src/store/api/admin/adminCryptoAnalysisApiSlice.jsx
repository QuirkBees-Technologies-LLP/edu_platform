import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminCryptoAnalysisApiSlice = createApi({
  reducerPath: "adminCryptoAnalysis",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAdminCryptoAnalysis: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/admin/crypto-analysis/?page=${page}&limit=${limit}`,
    }),
    createAdminCryptoAnalysis: builder.mutation({
      query: (data) => ({
        url: "/admin/crypto-analysis/",
        method: "POST",
        body: data,
      }),
    }),
    updateAdminCryptoAnalysis: builder.mutation({
      query: (updatedCrypto) => ({
        url: `/admin/crypto-analysis/${updatedCrypto.get("id")}`,
        method: "PUT",
        body: updatedCrypto,
        formData: true,
      }),
    }),
    deleteAdminCryptoAnalysis: builder.mutation({
      query: (id) => ({
        url: `/admin/crypto-analysis/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAdminCryptoAnalysisQuery,
  useLazyGetAdminCryptoAnalysisQuery,
  useCreateAdminCryptoAnalysisMutation,
  useUpdateAdminCryptoAnalysisMutation,
  useDeleteAdminCryptoAnalysisMutation,
} = adminCryptoAnalysisApiSlice;
