import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorLiveStreamApiSlice = createApi({
    reducerPath: 'educatorLiveStream',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorAcademyCategory: builder.query({
            query: () => `/educator/category`,
        }),
    }),
});

export const { useGetEducatorAcademyCategoryQuery } = educatorLiveStreamApiSlice;