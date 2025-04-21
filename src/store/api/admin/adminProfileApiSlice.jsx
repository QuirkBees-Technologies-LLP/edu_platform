import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminProfileApiSlice = createApi({
    reducerPath: 'adminProfile',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAdminProfile: builder.query({
            query: ({ page = 1, limit = 10 }) => `/admin/educator/list?page=${page}&limit=${limit}`,
        }),
        updateAdminProfile: builder.mutation({
            query: (updatedTrade) => ({
                url: `/admin/idea/updated/${updatedTrade.get("id")}`,
                method: 'POST',
                body: updatedTrade,
                formData: true
            }),
        }),
    }),
});

export const { useGetAdminProfileQuery, useUpdateAdminProfileMutation } = adminProfileApiSlice;