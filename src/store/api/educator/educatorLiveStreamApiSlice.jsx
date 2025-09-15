import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorLiveStreamApiSlice = createApi({
  reducerPath: "educatorLiveStream",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getEducatorAcademyCategory: builder.query({
      query: () => `/educator/category`,
    }),
    getLiveSessionList: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/educator/live-stream/list?page=${page}&limit=${limit}`,
    }),
    updateStreamStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/educator/schedule/status/${id}`,
        method: "PUT",
        body: { status },
      }),
    }),
    endCall: builder.mutation({
      query: ({ callId }) => ({
        url: `/educator/live-stream/`,
        method: "POST",
        body: { callId: callId,  },
      }),
    }),
    startCall: builder.mutation({
      query: ({ callId, Id }) => ({
        url: `/educator/live-stream/start`,
        method: "PUT",
        body: { callId: callId, Id: Id },
      }),
    }),
    educatorLiveStreamStatusUpdate: builder.mutation({
      query: ({ callId, status }) => ({
        url: `/educator/live-stream/${callId}/status`,
        method: "PUT",
        body: { status },
      }),
    }),
    educatorChangeLiveStreamStatusUpdate: builder.mutation({
      query: ({ id, status }) => ({
        url: `/educator/live-stream/${id}/live-status`,
        method: "PUT",
        body: { status },
      }),
    }),
  }),
});

export const {
  useGetEducatorAcademyCategoryQuery,
  useLazyGetLiveSessionListQuery,
  useUpdateStreamStatusMutation,
  useEndCallMutation,
  useEducatorLiveStreamStatusUpdateMutation,
  useEducatorChangeLiveStreamStatusUpdateMutation,
  useStartCallMutation,
} = educatorLiveStreamApiSlice;
