import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminLiveSessionApiSlice = createApi({
    reducerPath: 'adminLiveSession',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        createLiveSession: builder.mutation({
            query: (payload) => ({
                url: '/admin/stream/create-livestream',
                method: 'POST',
                body: payload,
            }),
        }),
        getLiveSessionList: builder.query({
            query: ({ page = 1, limit = 10 , status = "" ,search="", educator = "" }) => `/admin/stream/list?page=${page}&limit=${limit}&status=${status}&search=${search}&educator=${educator}`,
        }),
    }),
});

export const { useCreateLiveSessionMutation, useLazyGetLiveSessionListQuery } = adminLiveSessionApiSlice;