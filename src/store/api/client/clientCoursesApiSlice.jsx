import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientCoursesApiSlice = createApi({
    reducerPath: 'clientCourses',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getClientCourses: builder.query({
            query: (educatorId) => `/users/course?instructor=${educatorId}&published=true`,
        }),
        getClientSingleCourses: builder.query({
            query: (courseId) => `/users/course/${courseId}`,
        }),
        getClientSingleCourseSection: builder.query({
            query: (courseId) => `/users/course/section/list?course=${courseId}`,
        }),
        getClientAllCourses: builder.query({
            query: () => `/users/course?published=true`,
        }),
    }),
});

export const { useGetClientCoursesQuery, useGetClientSingleCoursesQuery, useGetClientSingleCourseSectionQuery, useGetClientAllCoursesQuery } = clientCoursesApiSlice;
