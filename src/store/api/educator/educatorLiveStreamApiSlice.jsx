import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorLiveStreamApiSlice = createApi({
    reducerPath: 'educatorLiveStream',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorAcademyCategory: builder.query({
            query: () => `/educator/category`,
        }),
        getLiveSessionList: builder.query({
            query: ({ page = 1, limit = 10 }) => `/educator/live-stream/list?page=${page}&limit=${limit}`,
        }),
        updateStreamStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/educator/schedule/status/${id}`,
                method: 'PUT',
                body: { status },
            }),
        }),
        endCall: builder.mutation({
            query: ({ callId }) => ({
                url: `/educator/live-stream/`,
                method: 'POST',
                body: { callId: callId },
            }),
        }),
    }),
});

export const { useGetEducatorAcademyCategoryQuery, useLazyGetLiveSessionListQuery, useUpdateStreamStatusMutation, useEndCallMutation } = educatorLiveStreamApiSlice;