import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientLiveSessionApiSlice = createApi({
    reducerPath: 'clientLiveSession',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getClientToken: builder.mutation({
            query: (payload) => ({
                url: '/admin/stream/get-token',
                method: 'POST',
                body: payload,
            }),
        }),
        getClientLiveSchedule: builder.query({
            query: (callID) => `/users/schedule/list/${callID}`,
        }),
    }),
});

export const { useGetClientTokenMutation, useGetClientLiveScheduleQuery } = clientLiveSessionApiSlice;