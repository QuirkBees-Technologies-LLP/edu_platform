import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authSlice"; // Import auth slice
import courseReducer from "./reducer/courseSlice";
import sectionReducer from "./reducer/sectionSlice";
import lectureReducer from "./reducer/lectureSlice";
import { adminTradeIdeasApiSlice } from "./api/admin/adminTradeIdeasApiSlice";
import { clientTradeIdeasApiSlice } from "./api/client/clientTradeIdeasApiSlice";
import { adminLiveSessionApiSlice } from "./api/admin/adminLiveSessionApiSlice";
import { clientLiveSessionApiSlice } from "./api/client/clientLiveSessionApiSlice";
import { adminEducatorsApiSlice } from "./api/admin/adminEducatorsApiSlice";
import { adminProfileApiSlice } from "./api/admin/adminProfileApiSlice";
import { clientProfileApiSlice } from "./api/client/clientProfileApiSlice";
import { educatorProfileApiSlice } from "./api/educator/educatorProfileApiSlice";
import { educatorTradeIdeasApiSlice } from "./api/educator/educatorTradeIdeasApiSlice";
import { adminAcademyCategoryApiSlice } from "./api/admin/AdminAcademyCategoryApiSlice";
import { educatorStreamScheduleApiSlice } from "./api/educator/EducatorStreamScheduleApiSlice";
import { clientAcademyCategoryApiSlice } from "./api/client/clientAcademyCategoryApiSlice";
import { clientCoursesApiSlice } from "./api/client/clientCoursesApiSlice";
import { educatorAcademyCategoryApiSlice } from "./api/educator/educatorAcademyCategoryApiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    sections: sectionReducer,
    lectures: lectureReducer,
    [educatorAcademyCategoryApiSlice.reducerPath]: educatorAcademyCategoryApiSlice.reducer,
    [clientAcademyCategoryApiSlice.reducerPath]: clientAcademyCategoryApiSlice.reducer,
    [clientCoursesApiSlice.reducerPath]: clientCoursesApiSlice.reducer,
    [educatorStreamScheduleApiSlice.reducerPath]: educatorStreamScheduleApiSlice.reducer,
    [adminEducatorsApiSlice.reducerPath]: adminEducatorsApiSlice.reducer,
    [adminAcademyCategoryApiSlice.reducerPath]: adminAcademyCategoryApiSlice.reducer,
    [adminProfileApiSlice.reducerPath]: adminProfileApiSlice.reducer,
    [educatorProfileApiSlice.reducerPath]: educatorProfileApiSlice.reducer,
    [clientProfileApiSlice.reducerPath]: clientProfileApiSlice.reducer,
    [adminTradeIdeasApiSlice.reducerPath]: adminTradeIdeasApiSlice.reducer,
    [clientTradeIdeasApiSlice.reducerPath]: clientTradeIdeasApiSlice.reducer,
    [adminLiveSessionApiSlice.reducerPath]: adminLiveSessionApiSlice.reducer,
    [clientLiveSessionApiSlice.reducerPath]: clientLiveSessionApiSlice.reducer,
    [educatorTradeIdeasApiSlice.reducerPath]: educatorTradeIdeasApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      educatorAcademyCategoryApiSlice.middleware,
      clientAcademyCategoryApiSlice.middleware,
      clientCoursesApiSlice.middleware,
      educatorStreamScheduleApiSlice.middleware,
      adminTradeIdeasApiSlice.middleware,
      adminLiveSessionApiSlice.middleware,
      clientTradeIdeasApiSlice.middleware,
      clientLiveSessionApiSlice.middleware,
      adminEducatorsApiSlice.middleware,
      adminProfileApiSlice.middleware,
      educatorProfileApiSlice.middleware,
      clientProfileApiSlice.middleware,
      educatorTradeIdeasApiSlice.middleware,
      adminAcademyCategoryApiSlice.middleware,
    ),
});
