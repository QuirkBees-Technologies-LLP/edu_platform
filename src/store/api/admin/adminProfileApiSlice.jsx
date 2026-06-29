import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminProfileApiSlice = createApi({
    reducerPath: 'adminProfile',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        // get admin profile
        getAdminProfile: builder.query({
            query: () => `/admin/auth/profile`,
        }),
        // get admin dashboard
        getAdminDashboard: builder.query({
            query: () => `/admin/dashboard/`,
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

export const { useGetAdminProfileQuery, useGetAdminDashboardQuery, useUpdateAdminProfileMutation } = adminProfileApiSlice;