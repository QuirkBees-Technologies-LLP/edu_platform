import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientEducatorApiSlice = createApi({
  reducerPath: "ClientEducator",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Educator"],
  endpoints: (builder) => ({
    getEducatorsList: builder.query({
      query: ({
        search = "",
        tab = "all",
        category = "",
        page = 1,
        limit = 9,
      }) => {
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (tab === "following") params.append("tab", tab);
        if (category) params.append("category", category);

        params.append("page", page);
        params.append("limit", limit);

        return `/users/educator-course?${params.toString()}`;
      },
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
      providesTags: ["Educator"],
    }),
    getCommonCategory: builder.query({
      query: () => `/common/category/get`,
      providesTags: ["Educator"],
    }),
  }),
});

export const {
  useGetEducatorsListQuery,
  useToggleFollowMutation,
  useGetClientEducatorAcademyCategoryQuery,
  useGetCommonCategoryQuery,
} = clientEducatorApiSlice;
