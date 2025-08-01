import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientAcademyCategoryApiSlice = createApi({
  reducerPath: "clientAcademyCategory",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAcademyCategory: builder.query({
      query: () => `/users/category`,
    }),
    getAcademySingleCategory: builder.query({
      query: (categoryId) => `/users/course/category/${categoryId}`,
    }),
    getAcademyCategoryByMainSection: builder.query({
      query: ({ mainSection, language }) =>
        `/users/course/data?mainSection=${mainSection}&language=${language}`,
    }),
  }),
});

export const {
  useGetAcademyCategoryQuery,
  useGetAcademySingleCategoryQuery,
  useGetAcademyCategoryByMainSectionQuery,
} = clientAcademyCategoryApiSlice;
