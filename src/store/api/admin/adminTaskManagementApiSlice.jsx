import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminTaskManagementApiSlice = createApi({
  reducerPath: "adminTaskManagement",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => {
        let url = `/admin/ticket?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return url;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Task", id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),

    createTask: builder.mutation({
      query: (formData) => ({
        url: `/admin/ticket/`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    updateTask: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/ticket/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),

    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/admin/ticket/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),

    getTaskById: builder.query({
      query: (id) => `/admin/task/get/${id}`,
      providesTags: (result, error, id) => [{ type: "Task", id }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useLazyGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskByIdQuery,
} = adminTaskManagementApiSlice;
