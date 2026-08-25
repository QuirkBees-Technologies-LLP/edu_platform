import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientProfileApiSlice = createApi({
    reducerPath: 'clientProfile',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['AlertPairPreferences'],
    endpoints: (builder) => ({
        getClientProfile: builder.query({
            query: () => `/users/auth/profile`,
        }),
        getNotificationPreferences: builder.query({
            query: () => `/users/auth/get-notification-preferences`,
        }),
        updateClientProfile: builder.mutation({
            query: (updatedData) => ({
                url: `/users/auth/update`,
                method: 'POST',
                body: updatedData,
                formData: true
            }),
        }),
        updateNotificationPreferences: builder.mutation({
            query: (preferences) => ({
                url: `/users/auth/notification-preferences`,
                method: 'PUT',
                body: preferences,
            }),
        }),
        completeTour: builder.mutation({
            query: () => ({
                url: `/users/auth/complete-tour`,
                method: 'POST',
            }),
        }),
        getAlertPairPreferences: builder.query({
            query: () => `/users/auth/alert-pair-preferences`,
            providesTags: ['AlertPairPreferences'],
        }),
        updateAlertPairPreferences: builder.mutation({
            query: (preferences) => ({
                url: `/users/auth/alert-pair-preferences`,
                method: 'PUT',
                body: preferences,
            }),
            invalidatesTags: ['AlertPairPreferences'],
        }),
    }),
});

export const { 
    useGetClientProfileQuery, 
    useUpdateClientProfileMutation, 
    useUpdateNotificationPreferencesMutation, 
    useGetNotificationPreferencesQuery,
    useCompleteTourMutation,
    useGetAlertPairPreferencesQuery,
    useUpdateAlertPairPreferencesMutation,
} = clientProfileApiSlice;