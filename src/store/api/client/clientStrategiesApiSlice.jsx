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

        // Get strategies name
        getStrategiesName: builder.query({
            query: () => `/users/strategies/list`,
            providesTags: ["Strategy"],
        }),

        // Get category-wise strategy data
        getCategoryWiseStrategy: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.language) queryParams.append("language", params.language);
                if (params?.type) queryParams.append("type", params.type);
                if (params?.search) queryParams.append("search", params.search);
                if (params?.tier) queryParams.append("tier", params.tier);
                if (params?.isFeatured !== undefined) queryParams.append("isFeatured", params.isFeatured);
                if (params?.published !== undefined) queryParams.append("published", params.published);
                if (params?.tradingType) queryParams.append("tradingType", params.tradingType);
                if (params?.tradingMethod) queryParams.append("tradingMethod", params.tradingMethod);
                if (params?.timeZone) queryParams.append("timeZone", params.timeZone);
                if (params?.startDate) queryParams.append("startDate", params.startDate);
                if (params?.endDate) queryParams.append("endDate", params.endDate);
                if (params?.strategyId) queryParams.append("strategyId", params.strategyId);
                const queryString = queryParams.toString();
                return `/users/course/strategy/${params.id}${queryString ? `?${queryString}` : ''}`;
            },
            providesTags: ["Strategy"],
        }),
        getStrategyLanguages: builder.query({
            query: () => `/users/strategies/language`,
            providesTags: ["Strategy"],
        }),
    }),
});

export const {
    useGetStrategiesQuery,
    useGetStrategyByIdQuery,
    useLazyGetStrategyByIdQuery,
    useGetCategoryWiseStrategyQuery,
    useGetStrategiesNameQuery,
    useGetStrategyLanguagesQuery,
} = clientStrategiesApiSlice;
