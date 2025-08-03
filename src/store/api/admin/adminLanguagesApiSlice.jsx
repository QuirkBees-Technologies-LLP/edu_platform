
import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminLanguagesApiSlice = createApi({
    reducerPath: 'adminLanguages',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getLanguages: builder.query({
            query: ({ page = 1, limit = 10 ,search="" }) => `/admin/language?page=${page}&limit=${limit}&search=${search}`,
        }),
       
        createLanguage: builder.mutation({
            query: (data) => ({
                url: '/admin/language/',
                method: 'POST',
                body: data,
            }),
        }),
        UpdateLanguage: builder.mutation({
            query: (updatedTrade) => ({
                url: `/admin/language/${updatedTrade.id}`,
                method: 'PUT',
                body: updatedTrade,
            }),
        }),
        deleteLanguage: builder.mutation({
            query: (id) => ({
                url: `/admin/language/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useGetLanguagesQuery, useCreateLanguageMutation, useUpdateLanguageMutation, useDeleteLanguageMutation, useLazyGetLanguagesQuery } = adminLanguagesApiSlice;