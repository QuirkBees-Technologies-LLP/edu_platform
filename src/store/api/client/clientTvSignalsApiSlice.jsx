import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientTvSignalsApiSlice = createApi({
  reducerPath: "clientTvSignals",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getClientTvSignals: builder.query({
      query: ({
        page = 1,
        limit = 12,
        category = "",
        educator = "",
        action = "",
      }) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);

        if (category) params.set("category", category);
        if (educator) params.set("educator", educator);
        if (action) params.set("action", action);

        return `/users/tv-signals/list?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useGetClientTvSignalsQuery,
} = clientTvSignalsApiSlice;
