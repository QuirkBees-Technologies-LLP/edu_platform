import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientAcademyCategoryApiSlice = createApi({
    reducerPath: 'clientAcademyCategory',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAcademyCategory: builder.query({
            query: () => `/users/category`,
        }),
    }),
});

export const { useGetAcademyCategoryQuery } = clientAcademyCategoryApiSlice;