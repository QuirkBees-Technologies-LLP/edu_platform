import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientEducatorApiSlice = createApi({
    reducerPath: 'ClientEducator',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({  
        getEducatorsList: builder.query({
            query: () => `/users/educator-course/`,
        }),
    
    }),
});

export const {  useGetEducatorsListQuery } = clientEducatorApiSlice;