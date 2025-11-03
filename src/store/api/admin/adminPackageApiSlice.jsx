import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminPackageApiSlice = createApi({
  reducerPath: "adminPackage",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Package"],
  endpoints: (builder) => ({
    getPackagesList: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `/admin/package/list?page=${page}&limit=${limit}&search=${search}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Package", id: _id })),
              { type: "Package", id: "LIST" },
            ]
          : [{ type: "Package", id: "LIST" }],
    }),

    createPackage: builder.mutation({
      query: (data) => ({
        url: "/admin/package/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Package", id: "LIST" }],
    }),

    updatePackage: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/package/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Package", id },
        { type: "Package", id: "LIST" },
      ],
    }),

    deletePackage: builder.mutation({
      query: (id) => ({
        url: `/admin/package/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Package", id },
        { type: "Package", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPackagesListQuery,
  useLazyGetPackagesListQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = adminPackageApiSlice;
