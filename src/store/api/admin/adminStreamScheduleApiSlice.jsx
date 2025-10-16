import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";
import { get } from "react-hook-form";

export const adminStreamScheduleApiSlice = createApi({
    reducerPath: 'adminStreamSchedule',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAdminStreamSchedule: builder.query({
            query: ({ page = 1, limit = 10  , search = "", educator = ""  , status = ""}) => `/admin/schedule/list?page=${page}&limit=${limit}&search=${search}&educator=${educator}&status=${status}`,
        }),
    }),
});

export const { useLazyGetAdminStreamScheduleQuery } = adminStreamScheduleApiSlice;