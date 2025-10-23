import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientEducatorApiSlice = createApi({
  reducerPath: "ClientEducator",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Educator"],
  endpoints: (builder) => ({
    getEducatorsList: builder.query({
      query: ({ search = "" , category = "" }) =>
        search
          ? `/users/educator-course?search=${encodeURIComponent(search)}&category=${category}`
          : `/users/educator-course?category=${category}`,
      providesTags: ["Educator"],
    }),
    toggleFollow: builder.mutation({
      query: (educatorId) => ({
        url: `/users/auth/${educatorId}/follow`,
        method: "GET",
      }),
      invalidatesTags: ["Educator"],
    }),
    getClientEducatorAcademyCategory: builder.query({
      query: () => `/users/category/list`,
    }),
     providesTags: ["Educator"]
  }),
});

export const {
  useGetEducatorsListQuery,
  useToggleFollowMutation,
  useGetClientEducatorAcademyCategoryQuery,
} = clientEducatorApiSlice;
