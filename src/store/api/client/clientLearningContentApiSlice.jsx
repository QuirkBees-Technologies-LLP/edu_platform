import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientLearningContentApiSlice = createApi({
  reducerPath: "clientLearningContent",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LearningContent"],
  endpoints: (builder) => ({
    // Fast Start Training content (language disabled for now)
    getFastStartContent: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        // if (params?.language) queryParams.append("language", params.language);
        return `/users/learning-content/fast-start?${queryParams.toString()}`;
      },
      providesTags: ["LearningContent"],
    }),

    // Strategy content for a specific strategy (language disabled for now)
    getStrategyContent: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.strategy) queryParams.append("strategy", params.strategy);
        // if (params?.language) queryParams.append("language", params.language);
        return `/users/learning-content/strategy?${queryParams.toString()}`;
      },
      providesTags: ["LearningContent"],
    }),

    // Available languages for Fast Start
    getFastStartLanguages: builder.query({
      query: () => "/users/learning-content/fast-start/languages",
      providesTags: ["LearningContent"],
    }),

    // Available languages for a specific strategy
    getStrategyLanguages: builder.query({
      query: (strategyId) =>
        `/users/learning-content/strategy/languages?strategy=${strategyId}`,
      providesTags: ["LearningContent"],
    }),

    // List of strategies that have learning content
    getLearningStrategies: builder.query({
      query: () => "/users/learning-content/strategies",
      providesTags: ["LearningContent"],
    }),
  }),
});

export const {
  useGetFastStartContentQuery,
  useGetStrategyContentQuery,
  useGetFastStartLanguagesQuery,
  useGetStrategyLanguagesQuery,
  useGetLearningStrategiesQuery,
} = clientLearningContentApiSlice;
