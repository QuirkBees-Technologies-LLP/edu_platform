import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientRecordingApiSlice = createApi({
    reducerPath: 'ClientRecording',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({  
        getClientRecordingByUserID: builder.query({
            query: (id) => `/users/recording?user_id=${id}`,
        }),
    
    }),
});

export const {  useLazyGetClientRecordingByUserIDQuery } = clientRecordingApiSlice;