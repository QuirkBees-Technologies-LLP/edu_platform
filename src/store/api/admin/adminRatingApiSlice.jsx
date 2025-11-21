import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const ratingApiSlice = createApi({
  reducerPath: "ratingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Rating", "EducatorRatings"],
  endpoints: (builder) => ({
    rateEducator: builder.mutation({
      query: (body) => ({
        url: `/users/rating/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Rating", "EducatorRatings"],
    }),

    getEducatorsRatings: builder.query({
      query: ({ page = 1, limit = 10, search = "", sort = "-avgRating" }) =>
        `/admin/rating/list?page=${page}&limit=${limit}&search=${search}&sort=${sort}`,
      providesTags: ["EducatorRatings"],
    }),
    getMyRatings: builder.query({
      query: ({
        educatorId,
        page = 1,
        limit = 10,
        search = "",
        sort = "-createdAt",
      }) =>
        `/educator/rating?page=${page}&limit=${limit}&search=${search}&sort=${sort}&educatorId=${educatorId}`,

      providesTags: ["Rating"],
    }),
  }),
});

export const {
  useRateEducatorMutation,
  useGetEducatorsRatingsQuery,
  useGetMyRatingsQuery,
  useLazyGetEducatorsRatingsQuery,
} = ratingApiSlice;
