import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminProfileApiSlice = createApi({
    reducerPath: 'adminProfile',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAdminProfile: builder.query({
            query: () => `/admin/auth/profile`,
        }),
        updateAdminProfile: builder.mutation({
            query: (updatedData) => ({
                url: `/admin/auth/update`,
                method: 'PUT',
                body: updatedData,
                formData: true
            }),
        }),
    }),
});

export const { useGetAdminProfileQuery, useUpdateAdminProfileMutation } = adminProfileApiSlice;