import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientCoursesApiSlice = createApi({
  reducerPath: "clientCourses",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getClientCourses: builder.query({
      query: (educatorId) =>
        `/users/course?instructor=${educatorId}&published=true`,
    }),
    getEducatorWithCourses: builder.query({
      query: (educatorId) => `/users/educator-course/${educatorId}`,
      keepUnusedDataFor: 0,
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
    getSecureVideo: builder.query({
      query: (videoKey) => `/users/educator-course/get-video-url/${videoKey}`,
    }),
  }),
});

export const {
  useGetClientCoursesQuery,
  useGetEducatorWithCoursesQuery,
  useGetClientSingleCoursesQuery,
  useGetClientSingleCourseSectionQuery,
  useGetClientAllCoursesQuery,
  useLazyGetSecureVideoQuery 
} = clientCoursesApiSlice;
