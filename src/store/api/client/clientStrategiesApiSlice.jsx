import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientStrategiesApiSlice = createApi({
    reducerPath: "clientStrategies",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Strategy"],
    endpoints: (builder) => ({
        // Get all strategies
        getStrategies: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.language) queryParams.append("language", params.language);
                if (params?.search) queryParams.append("search", params.search);
                return `/users/strategies?${queryParams.toString()}`;
            },
            providesTags: ["Strategy"],
        }),

        // Get single strategy by ID
        getStrategyById: builder.query({
            query: (id) => `/users/strategies/${id}`,
            providesTags: (result, error, id) => [{ type: "Strategy", id }],
        }),
    }),
});

export const {
    useGetStrategiesQuery,
    useGetStrategyByIdQuery,
    useLazyGetStrategyByIdQuery,
} = clientStrategiesApiSlice;
