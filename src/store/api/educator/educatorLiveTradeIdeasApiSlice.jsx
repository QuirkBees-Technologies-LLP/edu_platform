import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const educatorLiveTradeIdeasApiSlice = createApi({
    reducerPath: 'educatorLiveTradeIdeas',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getEducatorLiveTradeIdeas: builder.query({
            query: ({ page = 1, limit = 10, isview = true, category = "", status = "", search = "", onlyRoot = false }) => `/educator/live-idea/get?page=${page}&limit=${limit}&isview=${isview}&category=${category}&status=${status}&search=${search}&onlyRoot=${onlyRoot}`,
        }),
        getEducatorLiveTradeIdeaThread: builder.query({
            query: (id) => `/educator/live-idea/thread/${id}`,
        }),
        createEducatorLiveTradeIdea: builder.mutation({
            query: (data) => ({
                url: '/educator/live-idea/create',
                method: 'POST',
                body: data,
            }),
        }),
        updateEducatorLiveTradeIdea: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/educator/live-idea/updated/${id}`,
                method: 'PUT',
                body: formData,
                formData: true
            }),
        }),
        deleteEducatorLiveTradeIdea: builder.mutation({
            query: (id) => ({
                url: `/educator/live-idea/remove/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useGetEducatorLiveTradeIdeasQuery, useLazyGetEducatorLiveTradeIdeasQuery, useLazyGetEducatorLiveTradeIdeaThreadQuery, useCreateEducatorLiveTradeIdeaMutation, useUpdateEducatorLiveTradeIdeaMutation, useDeleteEducatorLiveTradeIdeaMutation } = educatorLiveTradeIdeasApiSlice;