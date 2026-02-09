import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientMasterClassApiSlice = createApi({
    reducerPath: "clientMasterClass",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["MasterClass"],
    endpoints: (builder) => ({
        // Get all MasterClass
        getMasterClass: builder.query({
            query: ({ id, params }) => {
                const queryParams = new URLSearchParams();
                if (params?.language) queryParams.append("language", params.language);
                if (params?.search) queryParams.append("search", params.search);

                return `/users/master-class/educator/${id}?${queryParams.toString()}`;
            },
            providesTags: ["MasterClass"],
        }),

        // Get single MasterClass by ID
        getMasterClassById: builder.query({
            query: (id) => `/users/master-class/${id}`,
            providesTags: (result, error, id) => [{ type: "MasterClass", id }],
        }),
    }),
});

export const {
    useGetMasterClassQuery,
    useGetMasterClassByIdQuery,
    useLazyGetMasterClassByIdQuery,
} = clientMasterClassApiSlice;
