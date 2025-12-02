import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authSlice"; // Import auth slice
import courseReducer from "./reducer/courseSlice";
import sectionReducer from "./reducer/sectionSlice";
import lectureReducer from "./reducer/lectureSlice";
import educatorPostReducer from "./reducer/postSlice";
import { adminTradeIdeasApiSlice } from "./api/admin/adminTradeIdeasApiSlice";
import { clientTradeIdeasApiSlice } from "./api/client/clientTradeIdeasApiSlice";
import { adminLiveSessionApiSlice } from "./api/admin/adminLiveSessionApiSlice";
import { clientLiveSessionApiSlice } from "./api/client/clientLiveSessionApiSlice";
import { adminEducatorsApiSlice } from "./api/admin/adminEducatorsApiSlice";
import { adminProfileApiSlice } from "./api/admin/adminProfileApiSlice";
import { clientProfileApiSlice } from "./api/client/clientProfileApiSlice";
import { educatorProfileApiSlice } from "./api/educator/educatorProfileApiSlice";
import { educatorTradeIdeasApiSlice } from "./api/educator/educatorTradeIdeasApiSlice";
import { adminAcademyCategoryApiSlice } from "./api/admin/adminAcademyCategoryApiSlice";
import { educatorStreamScheduleApiSlice } from "./api/educator/educatorStreamScheduleApiSlice";
import { clientAcademyCategoryApiSlice } from "./api/client/clientAcademyCategoryApiSlice";
import { clientCoursesApiSlice } from "./api/client/clientCoursesApiSlice";
import { educatorAcademyCategoryApiSlice } from "./api/educator/educatorAcademyCategoryApiSlice";
import { educatorLiveStreamApiSlice } from "./api/educator/educatorLiveStreamApiSlice";
import { adminStreamScheduleApiSlice } from "./api/admin/adminStreamScheduleApiSlice";
import { educatorRecordingApiSlice } from "./api/educator/educatorRecordingApiSlice";
import { adminRecordingApiSlice } from "./api/admin/adminRecordingApiSlice";
import { clientCreateUpdateApiSlice } from "./api/client/clientCreateUpdateApiSlice";
import { clientRecordingApiSlice } from "./api/client/clientRecordingApiSlice";
import { educatorTradeAnalysisApiSlice } from "./api/educator/educatorTradeAnalysisApiSlice";
import { adminTradeAnalysisApiSlice } from "./api/admin/adminTradeAnalysisApiSlice";
import { adminLanguagesApiSlice } from "./api/admin/adminLanguagesApiSlice";
import { adminCoursesTypesApiSlice } from "./api/admin/adminCoursesTypesApiSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import studentLanagugeSlice from "./reducer/studentLanagugeSlice";
import { clientLanguageApiSlice } from "./api/client/clientLanguageApiSlice";
import { clientEducatorApiSlice } from "./api/client/clientEductorApiSlice";
import { clientSocialApiSlice } from "./api/client/clientSocialApiSlilce";
import { adminPackageApiSlice } from "./api/admin/adminPackageApiSlice";
import { superAdminApiSlice } from "./api/admin/superAdminApiSlice";
import { adminTaskManagementApiSlice } from "./api/admin/adminTaskManagementApiSlice";
import { ratingApiSlice } from "./api/admin/adminRatingApiSlice";
import { educatorCryptoAnalysisApiSlice } from "./api/educator/educatorCryptoAnalysisApiSlice";
import { adminCryptoAnalysisApiSlice } from "./api/admin/adminCryptoAnalysisApiSlice";

const languagePersistConfig = {
  key: "language",
  storage,
  whitelist: ["selectedLanguage", "languages"],
};

const persistedLanguageReducer = persistReducer(
  languagePersistConfig,
  studentLanagugeSlice
);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    sections: sectionReducer,
    lectures: lectureReducer,
    educatorPosts: educatorPostReducer,
    language: persistedLanguageReducer,
    [adminCoursesTypesApiSlice.reducerPath]: adminCoursesTypesApiSlice.reducer,
    [adminLanguagesApiSlice.reducerPath]: adminLanguagesApiSlice.reducer,
    [clientCreateUpdateApiSlice.reducerPath]:
      clientCreateUpdateApiSlice.reducer,
    [adminRecordingApiSlice.reducerPath]: adminRecordingApiSlice.reducer,
    [adminStreamScheduleApiSlice.reducerPath]:
      adminStreamScheduleApiSlice.reducer,
    [educatorRecordingApiSlice.reducerPath]: educatorRecordingApiSlice.reducer,
    [educatorLiveStreamApiSlice.reducerPath]:
      educatorLiveStreamApiSlice.reducer,
    [educatorAcademyCategoryApiSlice.reducerPath]:
      educatorAcademyCategoryApiSlice.reducer,
    [clientAcademyCategoryApiSlice.reducerPath]:
      clientAcademyCategoryApiSlice.reducer,
    [clientCoursesApiSlice.reducerPath]: clientCoursesApiSlice.reducer,
    [educatorStreamScheduleApiSlice.reducerPath]:
      educatorStreamScheduleApiSlice.reducer,
    [adminEducatorsApiSlice.reducerPath]: adminEducatorsApiSlice.reducer,
    [adminAcademyCategoryApiSlice.reducerPath]:
      adminAcademyCategoryApiSlice.reducer,
    [adminProfileApiSlice.reducerPath]: adminProfileApiSlice.reducer,
    [educatorProfileApiSlice.reducerPath]: educatorProfileApiSlice.reducer,
    [clientProfileApiSlice.reducerPath]: clientProfileApiSlice.reducer,
    [adminTradeIdeasApiSlice.reducerPath]: adminTradeIdeasApiSlice.reducer,
    [clientTradeIdeasApiSlice.reducerPath]: clientTradeIdeasApiSlice.reducer,
    [adminLiveSessionApiSlice.reducerPath]: adminLiveSessionApiSlice.reducer,
    [clientLiveSessionApiSlice.reducerPath]: clientLiveSessionApiSlice.reducer,
    [educatorTradeIdeasApiSlice.reducerPath]:
      educatorTradeIdeasApiSlice.reducer,
    [clientRecordingApiSlice.reducerPath]: clientRecordingApiSlice.reducer,
    [educatorTradeAnalysisApiSlice.reducerPath]:
      educatorTradeAnalysisApiSlice.reducer,
    [adminTradeAnalysisApiSlice.reducerPath]:
      adminTradeAnalysisApiSlice.reducer,
    [clientLanguageApiSlice.reducerPath]: clientLanguageApiSlice.reducer,
    [clientEducatorApiSlice.reducerPath]: clientEducatorApiSlice.reducer,
    [clientSocialApiSlice.reducerPath]: clientSocialApiSlice.reducer,
    [adminPackageApiSlice.reducerPath]: adminPackageApiSlice.reducer,
    [superAdminApiSlice.reducerPath]: superAdminApiSlice.reducer,
    [adminTaskManagementApiSlice.reducerPath]:
      adminTaskManagementApiSlice.reducer,
    [ratingApiSlice.reducerPath]: ratingApiSlice.reducer,
    [educatorCryptoAnalysisApiSlice.reducerPath]:
      educatorCryptoAnalysisApiSlice.reducer,
    [adminCryptoAnalysisApiSlice.reducerPath]:
      adminCryptoAnalysisApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      adminCoursesTypesApiSlice.middleware,
      adminLanguagesApiSlice.middleware,
      clientCreateUpdateApiSlice.middleware,
      adminRecordingApiSlice.middleware,
      adminStreamScheduleApiSlice.middleware,
      educatorRecordingApiSlice.middleware,
      educatorLiveStreamApiSlice.middleware,
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
      clientRecordingApiSlice.middleware,
      educatorTradeAnalysisApiSlice.middleware,
      adminTradeAnalysisApiSlice.middleware,
      clientLanguageApiSlice.middleware,
      clientEducatorApiSlice.middleware,
      clientSocialApiSlice.middleware,
      adminPackageApiSlice.middleware,
      superAdminApiSlice.middleware,
      adminTaskManagementApiSlice.middleware,
      ratingApiSlice.middleware,
      educatorCryptoAnalysisApiSlice.middleware,
      adminCryptoAnalysisApiSlice.middleware
    ),
});

export const persistor = persistStore(store);
