import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorCryptoAnalysisApiSlice = createApi({
  reducerPath: "educatorCryptoAnalysis",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getEducatorCryptoAnalysis: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/educator/crypto-analysis/?page=${page}&limit=${limit}`,
    }),
    createEducatorCryptoAnalysis: builder.mutation({
      query: (data) => ({
        url: "/educator/crypto-analysis/",
        method: "POST",
        body: data,
      }),
    }),
    updateEducatorCryptoAnalysis: builder.mutation({
      query: (updatedcrypto) => ({
        url: `/educator/crypto-analysis/${updatedcrypto.get("id")}`,
        method: "PUT",
        body: updatedcrypto,
        formData: true,
      }),
    }),
    deleteEducatorCryptoAnalysis: builder.mutation({
      query: (id) => ({
        url: `/educator/crypto-analysis/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetEducatorCryptoAnalysisQuery,
  useLazyGetEducatorCryptoAnalysisQuery,
  useCreateEducatorCryptoAnalysisMutation,
  useUpdateEducatorCryptoAnalysisMutation,
  useDeleteEducatorCryptoAnalysisMutation,
} = educatorCryptoAnalysisApiSlice;
