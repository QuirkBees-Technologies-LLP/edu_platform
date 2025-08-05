import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientLanguageApiSlice = createApi({
    reducerPath: 'clientLanguage',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getLanguage: builder.query({
      query: () => `/users/language/`,
    }),
    }),
});

export const { useGetLanguageQuery } = clientLanguageApiSlice;