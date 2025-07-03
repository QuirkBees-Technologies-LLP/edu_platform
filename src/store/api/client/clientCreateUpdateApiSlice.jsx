import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";
import { Update } from "@mui/icons-material";

export const clientCreateUpdateApiSlice = createApi({
    reducerPath: 'clientCreateUpdate',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        clientCreateUpdate: builder.mutation({
            query: (data) => ({
                url: '/users/auth/signup',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const { useClientCreateUpdateMutation } = clientCreateUpdateApiSlice;