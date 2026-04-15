import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientSocialApiSlice = createApi({
  reducerPath: "ClientSocial",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 300, // cache for 5 minutes across navigation
  endpoints: (builder) => ({
    post: builder.query({
      query: ({ page = 1, limit = 10, socialType = false }) =>
        `/users/post?page=${page}&limit=${limit}&socialType=${socialType}`,
      keepUnusedDataFor: 60, // individual page results cached 60s
    }),
    corporatePost: builder.query({
      query: () => `/users/post/corporate-post`,
    }),
  }),
});

export const { usePostQuery, useCorporatePostQuery } = clientSocialApiSlice;
