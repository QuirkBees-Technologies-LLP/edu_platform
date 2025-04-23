import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorProfileApiSlice = createApi({
    reducerPath: 'educatorProfile',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorProfile: builder.query({
            query: ({ page = 1, limit = 10 }) => `/admin/educator/list?page=${page}&limit=${limit}`,
        }),
        updateEducatorProfile: builder.mutation({
            query: (updatedTrade) => ({
                url: `/admin/idea/updated/${updatedTrade.get("id")}`,
                method: 'POST',
                body: updatedTrade,
                formData: true
            }),
        }),
    }),
});

export const { useGetEducatorProfileQuery, useUpdateEducatorProfileMutation } = educatorProfileApiSlice;