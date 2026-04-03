import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const adminMetricsApiSlice = createApi({
    reducerPath: 'adminMetrics',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        // GET /common/external-api/?action=activecounts&startdate=...&enddate=...
        getActiveCounts: builder.query({
            query: ({ startdate, enddate }) => ({
                url: `/common/external-api/`,
                params: { action: 'activecounts', startdate, enddate },
            }),
        }),
        // GET /common/external-api/?action=refunds&startdate=...&enddate=...
        getRefunds: builder.query({
            query: ({ startdate, enddate }) => ({
                url: `/common/external-api/`,
                params: { action: 'refunds', startdate, enddate },
            }),
        }),
        // GET /common/external-api/?action=planslist&startdate=...&enddate=...
        getPlansList: builder.query({
            query: ({ startdate, enddate }) => ({
                url: `/common/external-api/`,
                params: { action: 'planslist', startdate, enddate },
            }),
        }),
    }),
});

export const {
    useGetActiveCountsQuery,
    useGetRefundsQuery,
    useGetPlansListQuery,
} = adminMetricsApiSlice;
