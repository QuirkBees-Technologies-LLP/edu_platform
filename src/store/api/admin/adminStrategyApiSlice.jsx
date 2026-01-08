import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminStrategyApiSlice = createApi({
    reducerPath: 'adminStrategy',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Strategies'],
    endpoints: (builder) => ({
        getAdminStrategies: builder.query({
            query: (params = {}) => ({
                url: '/admin/strategy',
                params: {
                    isDeleted: false,
                    isStrategies: true,
                    ...params
                }
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Strategies', id: _id })),
                        { type: 'Strategies', id: 'LIST' },
                    ]
                    : [{ type: 'Strategies', id: 'LIST' }],
        }),
        createAdminStrategy: builder.mutation({
            query: (formData) => ({
                url: '/admin/strategy',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [
                { type: 'Strategies', id: 'LIST' },
            ],
        }),
        updateAdminStrategy: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/admin/strategy/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Strategies', id: 'LIST' },
                { type: 'Strategies', id },
            ],
        }),
        deleteAdminStrategy: builder.mutation({
            query: (id) => ({
                url: `/admin/strategy/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'Strategies', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetAdminStrategiesQuery,
    useCreateAdminStrategyMutation,
    useUpdateAdminStrategyMutation,
    useDeleteAdminStrategyMutation
} = adminStrategyApiSlice;
