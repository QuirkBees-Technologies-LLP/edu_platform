import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientEducatorApiSlice = createApi({
  reducerPath: "ClientEducator",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Educator"],
  endpoints: (builder) => ({
    getEducatorsList: builder.query({
      query: () => `/users/educator-course/`,
      providesTags: ["Educator"],
    }),
    toggleFollow: builder.mutation({
      query: (educatorId) => ({
        url: `/users/auth/${educatorId}/follow`,
        method: "GET",
      }),
      invalidatesTags: ["Educator"],
    }),
  }),
});

export const { useGetEducatorsListQuery, useToggleFollowMutation } =
  clientEducatorApiSlice;
