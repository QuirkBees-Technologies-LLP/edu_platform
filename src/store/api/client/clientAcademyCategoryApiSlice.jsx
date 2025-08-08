import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../apiSlice";

export const clientAcademyCategoryApiSlice = createApi({
  reducerPath: "clientAcademyCategory",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAcademyCategory: builder.query({
      query: () => `/users/category`,
    }),
    getAcademySingleCategory: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params?.language) searchParams.append("language", params.language);
        
        const queryString = searchParams.toString();
        return `/users/course/category/${params.id}${queryString ? `?${queryString}` : ''}`;
      },
    }),
    // getAcademyCategoryByMainSection: builder.query({
    //   query: ({ mainSection, language, id }) =>
    //     `/users/course/get?mainSection=${mainSection}${language && `&language=${language}`}${id && `&id=${id}`}`,
    // }),

    getAcademyCategoryByMainSection: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params.mainSection)
          searchParams.append("mainSection", params.mainSection);
        if (params.language) searchParams.append("language", params.language);
        if (params.id) searchParams.append("id", params.id);
        if (params.category) searchParams.append("categoryId", params.category);

        return `/users/course/get?${searchParams.toString()}`;
      },
    }),
    getFirstStartTrainingSection: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params.mainSection)
          searchParams.append("mainSection", params.mainSection);
        if (params.language) searchParams.append("language", params.language);
        if (params.id) searchParams.append("id", params.id);
        if (params.category) searchParams.append("categoryId", params.category);

        return `/users/course/first-start-training?${searchParams.toString()}`;
      },
    }),
  }),
});

export const {
  useGetAcademyCategoryQuery,
  useGetAcademySingleCategoryQuery,
  useGetAcademyCategoryByMainSectionQuery,
  useGetFirstStartTrainingSectionQuery,
} = clientAcademyCategoryApiSlice;
