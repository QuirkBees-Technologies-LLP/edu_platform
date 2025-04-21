import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientProfileApiSlice = createApi({
    reducerPath: 'clientProfile',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getClientProfile: builder.query({
            query: ({ page = 1, limit = 10 }) => `/admin/educator/list?page=${page}&limit=${limit}`,
        }),
        updateClientProfile: builder.mutation({
            query: (updatedTrade) => ({
                url: `/admin/idea/updated/${updatedTrade.get("id")}`,
                method: 'POST',
                body: updatedTrade,
                formData: true
            }),
        }),
    }),
});

export const { useGetClientProfileQuery, useUpdateClientProfileMutation } = clientProfileApiSlice;