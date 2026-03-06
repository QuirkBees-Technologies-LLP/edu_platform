import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminStrategyModelApiSlice = createApi({
    reducerPath: 'adminStrategyModel',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['StrategyModel'],
    endpoints: (builder) => ({
        // GET /admin/strategy — Get all strategies
        getAdminStrategyModels: builder.query({
            query: (params = {}) => ({
                url: '/admin/strategy',
                params: {
                    ...params
                }
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'StrategyModel', id: _id })),
                        { type: 'StrategyModel', id: 'LIST' },
                    ]
                    : [{ type: 'StrategyModel', id: 'LIST' }],
        }),

        // POST /admin/strategy — Create new strategy
        createAdminStrategyModel: builder.mutation({
            query: (formData) => ({
                url: '/admin/strategy',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [
                { type: 'StrategyModel', id: 'LIST' },
            ],
        }),

        // PUT /admin/strategy/:id — Update strategy
        updateAdminStrategyModel: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/admin/strategy/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'StrategyModel', id: 'LIST' },
                { type: 'StrategyModel', id },
            ],
        }),

        // DELETE /admin/strategy/:id — Delete strategy
        deleteAdminStrategyModel: builder.mutation({
            query: (id) => ({
                url: `/admin/strategy/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'StrategyModel', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetAdminStrategyModelsQuery,
    useCreateAdminStrategyModelMutation,
    useUpdateAdminStrategyModelMutation,
    useDeleteAdminStrategyModelMutation,
} = adminStrategyModelApiSlice;
