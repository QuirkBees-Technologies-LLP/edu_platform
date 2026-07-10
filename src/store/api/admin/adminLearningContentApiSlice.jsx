import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminLearningContentApiSlice = createApi({
  reducerPath: "adminLearningContent",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LearningContent", "LearningVideos", "LearningResources"],
  endpoints: (builder) => ({
    // ── Learning Content CRUD ──────────────────────────────────────────

    getLearningContentList: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.contentType)
          queryParams.append("contentType", params.contentType);
        if (params.search) queryParams.append("search", params.search);
        if (params.status !== undefined)
          queryParams.append("status", params.status);
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);
        return `/admin/learning-content?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "LearningContent",
                id: _id,
              })),
              { type: "LearningContent", id: "LIST" },
            ]
          : [{ type: "LearningContent", id: "LIST" }],
    }),

    getLearningContentDetail: builder.query({
      query: (id) => `/admin/learning-content/${id}`,
      providesTags: (result, error, id) => [
        { type: "LearningContent", id },
        { type: "LearningVideos", id: `CONTENT_${id}` },
        { type: "LearningResources", id: `CONTENT_${id}` },
      ],
    }),

    createLearningContent: builder.mutation({
      query: (body) => ({
        url: "/admin/learning-content",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "LearningContent", id: "LIST" }],
    }),

    updateLearningContent: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/learning-content/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "LearningContent", id: "LIST" },
        { type: "LearningContent", id },
      ],
    }),

    deleteLearningContent: builder.mutation({
      query: (id) => ({
        url: `/admin/learning-content/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "LearningContent", id: "LIST" }],
    }),

    toggleLearningContentStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/learning-content/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "LearningContent", id: "LIST" },
        { type: "LearningContent", id },
      ],
    }),

    // ── Video CRUD ─────────────────────────────────────────────────────

    addVideo: builder.mutation({
      query: ({ contentId, formData }) => ({
        url: `/admin/learning-content/${contentId}/videos`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { contentId }) => [
        { type: "LearningVideos", id: `CONTENT_${contentId}` },
        { type: "LearningContent", id: contentId },
      ],
    }),

    updateVideo: builder.mutation({
      query: ({ videoId, contentId, formData }) => ({
        url: `/admin/learning-content/videos/${videoId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { contentId }) => [
        { type: "LearningVideos", id: `CONTENT_${contentId}` },
        { type: "LearningContent", id: contentId },
      ],
    }),

    deleteVideo: builder.mutation({
      query: ({ videoId, contentId }) => ({
        url: `/admin/learning-content/videos/${videoId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { contentId }) => [
        { type: "LearningVideos", id: `CONTENT_${contentId}` },
        { type: "LearningContent", id: contentId },
      ],
    }),

    toggleVideoStatus: builder.mutation({
      query: ({ videoId, status, contentId }) => ({
        url: `/admin/learning-content/videos/${videoId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { contentId }) => [
        { type: "LearningVideos", id: `CONTENT_${contentId}` },
        { type: "LearningContent", id: contentId },
      ],
    }),

    reorderVideos: builder.mutation({
      query: ({ contentId, items }) => ({
        url: `/admin/learning-content/${contentId}/videos/reorder`,
        method: "PUT",
        body: { items },
      }),
      invalidatesTags: (result, error, { contentId }) => [
        { type: "LearningVideos", id: `CONTENT_${contentId}` },
        { type: "LearningContent", id: contentId },
      ],
    }),

    // ── Resource CRUD ──────────────────────────────────────────────────

    uploadResource: builder.mutation({
      query: ({ contentId, formData }) => ({
        url: `/admin/learning-content/${contentId}/resources`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { contentId }) => [
        { type: "LearningResources", id: `CONTENT_${contentId}` },
        { type: "LearningContent", id: contentId },
      ],
    }),

    updateResource: builder.mutation({
      query: ({ resourceId, contentId, formData }) => ({
        url: `/admin/learning-content/resources/${resourceId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { contentId }) => [
        { type: "LearningResources", id: `CONTENT_${contentId}` },
        { type: "LearningContent", id: contentId },
      ],
    }),

    deleteResource: builder.mutation({
      query: ({ resourceId, contentId }) => ({
        url: `/admin/learning-content/resources/${resourceId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { contentId }) => [
        { type: "LearningResources", id: `CONTENT_${contentId}` },
        { type: "LearningContent", id: contentId },
      ],
    }),

    toggleResourceStatus: builder.mutation({
      query: ({ resourceId, status, contentId }) => ({
        url: `/admin/learning-content/resources/${resourceId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { contentId }) => [
        { type: "LearningResources", id: `CONTENT_${contentId}` },
        { type: "LearningContent", id: contentId },
      ],
    }),

    reorderResources: builder.mutation({
      query: ({ contentId, items }) => ({
        url: `/admin/learning-content/${contentId}/resources/reorder`,
        method: "PUT",
        body: { items },
      }),
      invalidatesTags: (result, error, { contentId }) => [
        { type: "LearningResources", id: `CONTENT_${contentId}` },
        { type: "LearningContent", id: contentId },
      ],
    }),
  }),
});

export const {
  // Content
  useGetLearningContentListQuery,
  useLazyGetLearningContentListQuery,
  useGetLearningContentDetailQuery,
  useCreateLearningContentMutation,
  useUpdateLearningContentMutation,
  useDeleteLearningContentMutation,
  useToggleLearningContentStatusMutation,
  // Videos
  useAddVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
  useToggleVideoStatusMutation,
  useReorderVideosMutation,
  // Resources
  useUploadResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useToggleResourceStatusMutation,
  useReorderResourcesMutation,
} = adminLearningContentApiSlice;
