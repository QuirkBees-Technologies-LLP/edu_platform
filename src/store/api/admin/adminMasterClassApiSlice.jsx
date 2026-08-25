import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminMasterClassApiSlice = createApi({
    reducerPath: 'adminMasterClass',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['MasterClasses'],
    endpoints: (builder) => ({
        getAdminMasterClasses: builder.query({
            query: (params = {}) => ({
                url: '/common/master-class',
                params: {
                    isMasterClass: true,
                    isFeatured: true,
                    ...params
                }
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...(result?.data || []).map(({ _id }) => ({ type: 'MasterClasses', id: _id })),
                        { type: 'MasterClasses', id: 'LIST' },
                    ]
                    : [{ type: 'MasterClasses', id: 'LIST' }],
        }),
        createAdminMasterClass: builder.mutation({
            query: (formData) => ({
                url: '/common/master-class',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [
                { type: 'MasterClasses', id: 'LIST' },
            ],
        }),
        updateAdminMasterClass: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/common/master-class/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'MasterClasses', id: 'LIST' },
                { type: 'MasterClasses', id },
            ],
        }),
        deleteAdminMasterClass: builder.mutation({
            query: (id) => ({
                url: `/common/master-class/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'MasterClasses', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetAdminMasterClassesQuery,
    useCreateAdminMasterClassMutation,
    useUpdateAdminMasterClassMutation,
    useDeleteAdminMasterClassMutation,
} = adminMasterClassApiSlice;
