import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientSocialApiSlice = createApi({
  reducerPath: "ClientSocial",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    post: builder.query({
      query: ({ page = 1, limit = 10, socialType = false }) =>
        `/users/post?page=${page}&limit=${limit}&socialType=${socialType}`,
    }),
    corporatePost: builder.query({
      query: () => `/users/post/corporate-post`,
    }),
  }),
});

export const { usePostQuery, useCorporatePostQuery } = clientSocialApiSlice;
