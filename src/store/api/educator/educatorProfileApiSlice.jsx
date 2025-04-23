import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorProfileApiSlice = createApi({
    reducerPath: 'educatorProfile',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorProfile: builder.query({
            query: () => `/educator/auth/profile`,
        }),
        updateEducatorProfile: builder.mutation({
            query: (updatedData) => ({
                url: `/educator/auth/update`,
                method: 'PUT',
                body: updatedData,
                formData: true
            }),
        }),
    }),
});

export const { useGetEducatorProfileQuery, useUpdateEducatorProfileMutation } = educatorProfileApiSlice;