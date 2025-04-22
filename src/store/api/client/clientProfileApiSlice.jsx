import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientProfileApiSlice = createApi({
    reducerPath: 'clientProfile',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getClientProfile: builder.query({
            query: () => `/users/auth/profile`,
        }),
        updateClientProfile: builder.mutation({
            query: (updatedData) => ({
                url: `/users/auth/update`,
                method: 'POST',
                body: updatedData,
                formData: true
            }),
        }),
    }),
});

export const { useGetClientProfileQuery, useUpdateClientProfileMutation } = clientProfileApiSlice;