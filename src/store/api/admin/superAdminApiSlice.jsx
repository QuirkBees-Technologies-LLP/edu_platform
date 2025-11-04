import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const superAdminApiSlice = createApi({
  reducerPath: "superAdmin",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Admin", "Logs"],
  endpoints: (builder) => ({
    getAdmins: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        role = "",
        status = "",
      }) => {
        let url = `/admin/super-admin/list?page=${page}&limit=${limit}`;

        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (role) url += `&role=${role}`;
        if (status) url += `&status=${status}`;

        return url;
      },
      providesTags: ["Admin"],
    }),

    createAdmin: builder.mutation({
      query: (data) => ({
        url: "/admin/super-admin/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),

    updateAdmin: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/super-admin/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Admin"],
    }),

    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/super-admin/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),

    getAdminById: builder.query({
      query: (id) => `/admin/super-admin/get/${id}`,
      providesTags: ["Admin"],
    }),
  }),
});

export const {
  useGetAdminsQuery,
  useLazyGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetAdminByIdQuery,
} = superAdminApiSlice;
