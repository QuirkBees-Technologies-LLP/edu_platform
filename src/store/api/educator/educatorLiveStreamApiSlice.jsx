import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorLiveStreamApiSlice = createApi({
    reducerPath: 'educatorLiveStream',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorAcademyCategory: builder.query({
            query: () => `/educator/category`,
        }),
        getLiveSessionList: builder.query({
            query: ({ page = 1, limit = 10 }) => `/educator/live-stream/list?page=${page}&limit=${limit}`,
        }),
    }),
});

export const { useGetEducatorAcademyCategoryQuery, useLazyGetLiveSessionListQuery } = educatorLiveStreamApiSlice;