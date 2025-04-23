import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorAcademyCategoryApiSlice = createApi({
    reducerPath: 'educatorAcademyCategory',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorAcademyCategory: builder.query({
            query: () => `/educator/category`,
        }),
    }),
});

export const { useGetEducatorAcademyCategoryQuery } = educatorAcademyCategoryApiSlice;