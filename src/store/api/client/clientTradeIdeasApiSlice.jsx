import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientTradeIdeasApiSlice = createApi({
  reducerPath: "clientTradeIdeas",
  baseQuery: baseQueryWithReauth,
  // Admin/educator edits happen through entirely separate RTK Query API slices
  // (adminTradeIdeasApiSlice, educatorTradeIdeasApiSlice, ...) with their own
  // reducerPath, so tag-based cache invalidation can't reach across into this one —
  // by design, RTK Query only invalidates within the same API instance. Without this,
  // a student who already has an Ideas/Live Ideas/Insights list cached (e.g. visited
  // it earlier in the session) keeps seeing the pre-edit data on the next visit, even
  // though the update saved correctly on the backend (verified — no server-side cache
  // exists on any read path either; this is purely a client cache-freshness gap).
  // refetchOnMountOrArgChange covers navigating to/revisiting the page.
  // refetchOnFocus covers the page being left open the whole time in one tab while the
  // edit was made elsewhere — needs setupListeners(store.dispatch) in store/index.jsx
  // to actually fire; without it this option is silently inert.
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getClientTradeIdeas: builder.query({
      query: ({
        page = 1,
        limit = 9,
        status = "",
        educator = "",
        categoryName = [],
        activeIdea = "",
        startDate = "",
        endDate = "",
      }) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);

        if (status) params.set("status", status);
        if (educator) params.set("educator", educator);
        if (activeIdea) params.set("ideaType", activeIdea);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        if (Array.isArray(categoryName) && categoryName.length > 0) {
          categoryName.forEach((name) => params.append("categoryName", name));
        }

        return `/users/idea/get?${params.toString()}`;
      },
    }),

    getClientLiveIdeas: builder.query({
      query: ({
        page = 1,
        limit = 9,
        status = "",
        categoryName = [],
        activeIdea = "",
        educator = "",
        startDate = "",
        endDate = "",
      }) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);

        if (status) params.set("status", status);
        if (activeIdea) params.set("ideaType", activeIdea);
        if (educator) params.set("educator", educator);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        if (Array.isArray(categoryName) && categoryName.length > 0) {
          categoryName.forEach((name) => params.append("categoryName", name));
        }

        return `/users/live-idea/get?${params.toString()}`;
      },
    }),
    getClientTradeAnalysis: builder.query({
      query: ({
        page = 1,
        limit = 9,
        search = "",
        educator = "",
        status = "",
        categoryName = [],
        startDate = "",
        endDate = "",
      }) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);

        if (search) params.set("search", search);
        if (educator) params.set("educator", educator);
        if (status) params.set("status", status);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        if (Array.isArray(categoryName) && categoryName.length > 0) {
          categoryName.forEach((name) => params.append("categoryName", name));
        }

        return `/users/trade-analysis/list?${params.toString()}`;
      },
    }),
    // Single insight, fully populated — used to open the *original* insight a "Follow-up
    // to X" link references. The list endpoints only shallow-populate previousAnalysis
    // with title/createdAt, not enough to render the details modal.
    getTradeAnalysisById: builder.query({
      query: (id) => `/users/trade-analysis/${id}`,
    }),
    // Single idea, fully populated — used to open the *original* idea a "Follow-up to X"
    // link references. The list endpoints only shallow-populate previousIdea with
    // name/createdAt, not enough to render the details modal.
    getIdeaById: builder.query({
      query: (id) => `/users/idea/${id}`,
    }),
    // Single live idea, fully populated — same purpose as getIdeaById, for Live Ideas'
    // "Follow-up to X" link. Distinct path from the paginated /users/live-idea/:id.
    getLiveIdeaSingle: builder.query({
      query: (id) => `/users/live-idea/single/${id}`,
    }),
    getClientCryptoAnalysis: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        // timeframe = "",
        // markets = "",
      }) => {
        const params = new URLSearchParams({
          page,
          limit,
          search,
          //   timeframe,
          // markets,
        });

        return `/users/crypto-analysis/list?${params.toString()}`;
      },
    }),
    getLiveTradeIdea: builder.query({
      query: ({ id, page = 1, limit = 9 }) => `/users/live-idea/${id}?page=${page}&limit=${limit}`,
    }),
    getAllEducators: builder.query({
      query: () => `/users/educator-course/list`,
    }),
    // Public-facing educator profile feed (Educator Feed's "Ideas" tab) — a single
    // educator's ideas, paginated. Deliberately separate from getClientTradeIdeas,
    // which is scoped to the requesting user's allowed categories/plan.
    getEducatorIdeas: builder.query({
      query: ({ educatorId, page = 1, limit = 10 }) =>
        `/users/idea/educator/${educatorId}?page=${page}&limit=${limit}`,
      keepUnusedDataFor: 60, // individual page results cached 60s
    }),
    // Public-facing educator profile feed (Educator Feed's "Insights" tab) — a single
    // educator's insights, paginated. Deliberately separate from getClientTradeAnalysis,
    // which is scoped to the requesting user's allowed categories/plan.
    getEducatorInsights: builder.query({
      query: ({ educatorId, page = 1, limit = 10 }) =>
        `/users/trade-analysis/educator/${educatorId}?page=${page}&limit=${limit}`,
      keepUnusedDataFor: 60, // individual page results cached 60s
    }),
  }),
});

export const {
  useGetClientTradeIdeasQuery,
  useGetClientLiveIdeasQuery,
  useGetClientTradeAnalysisQuery,
  useGetClientCryptoAnalysisQuery,
  useGetLiveTradeIdeaQuery,
  useGetAllEducatorsQuery,
  useGetEducatorIdeasQuery,
  useGetEducatorInsightsQuery,
  useLazyGetTradeAnalysisByIdQuery,
  useLazyGetIdeaByIdQuery,
  useLazyGetLiveIdeaSingleQuery,
} = clientTradeIdeasApiSlice;
