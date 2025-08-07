import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorAcademyCategoryApiSlice = createApi({
    reducerPath: 'educatorAcademyCategory',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorAcademyCategory: builder.query({
            query: () => `/admin/category/list`,
        }),
        getLanguageList: builder.query({
            query: () => `/admin/language/list`,
        }),
        getCoursesTypes: builder.query({
            query: () => `/admin/course-type/list`,
        }),
    }),
});

export const { useGetEducatorAcademyCategoryQuery, useGetLanguageListQuery, useGetCoursesTypesQuery } = educatorAcademyCategoryApiSlice;