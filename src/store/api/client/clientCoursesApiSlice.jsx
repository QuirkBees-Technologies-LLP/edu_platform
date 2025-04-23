import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientCoursesApiSlice = createApi({
    reducerPath: 'clientCourses',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getClientCourses: builder.query({
            query: (educatorId) => `/users/course?instructor=${educatorId}`,
        }),
        getClientSingleCourses: builder.query({
            query: (courseId) => `/users/course/${courseId}`,
        }),
        getClientSingleCourseSection: builder.query({
            query: (courseId) => `/users/course/section/list?course=${courseId}`,
        }),
    }),
});

export const { useGetClientCoursesQuery, useGetClientSingleCoursesQuery, useGetClientSingleCourseSectionQuery } = clientCoursesApiSlice;
