import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorMasterClassApiSlice = createApi({
    reducerPath: 'educatorMasterClass',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['MasterClass'],
    endpoints: (builder) => ({
        getEducatorMasterClasses: builder.query({
            query: (params = {}) => ({
                url: '/common/master-class/',
                params: {
                    isDeleted: false,
                    ...params
                }
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'MasterClass', id: _id })),
                        { type: 'MasterClass', id: 'LIST' },
                    ]
                    : [{ type: 'MasterClass', id: 'LIST' }],
        }),
        getEducatorMasterClassById: builder.query({
            query: (id) => ({
                url: `/common/master-class/${id}`,
            }),
            providesTags: (result, error, id) => [{ type: 'MasterClass', id }],
        }),
        createEducatorMasterClass: builder.mutation({
            query: (formData) => ({
                url: '/common/master-class/',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [
                { type: 'MasterClass', id: 'LIST' },
            ],
        }),
        updateEducatorMasterClass: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/common/master-class/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'MasterClass', id: 'LIST' },
                { type: 'MasterClass', id },
            ],
        }),
        deleteEducatorMasterClass: builder.mutation({
            query: (id) => ({
                url: `/common/master-class/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'MasterClass', id: 'LIST' },
            ],
        }),
        reorderEducatorMasterClass: builder.mutation({
            query: (data) => ({
                url: '/common/master-class/reorder',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: [{ type: 'MasterClass', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetEducatorMasterClassesQuery,
    useGetEducatorMasterClassByIdQuery,
    useCreateEducatorMasterClassMutation,
    useUpdateEducatorMasterClassMutation,
    useDeleteEducatorMasterClassMutation,
    useReorderEducatorMasterClassMutation
} = educatorMasterClassApiSlice;
