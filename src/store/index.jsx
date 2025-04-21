import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authSlice"; // Import auth slice
import courseReducer from "./reducer/courseSlice";
import sectionReducer from "./reducer/sectionSlice";
import lectureReducer from "./reducer/lectureSlice";
import { adminTradeIdeasApiSlice } from "./api/admin/adminTradeIdeasApiSlice";
import { clientTradeIdeasApiSlice } from "./api/client/clientTradeIdeasApiSlice";
import { adminLiveSessionApiSlice } from "./api/admin/adminLiveSessionApiSlice";
import { clientLiveSessionApiSlice } from "./api/client/clientLiveSessionApiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    sections: sectionReducer,
    lectures: lectureReducer,
    [adminEducatorsApiSlice.reducerPath]: adminEducatorsApiSlice.reducer,
    [adminTradeIdeasApiSlice.reducerPath]: adminTradeIdeasApiSlice.reducer,
    [clientTradeIdeasApiSlice.reducerPath]: clientTradeIdeasApiSlice.reducer,
    [adminLiveSessionApiSlice.reducerPath]: adminLiveSessionApiSlice.reducer,
    [clientLiveSessionApiSlice.reducerPath]: clientLiveSessionApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      adminTradeIdeasApiSlice.middleware,
      adminLiveSessionApiSlice.middleware,
      clientTradeIdeasApiSlice.middleware,
      clientLiveSessionApiSlice.middleware,
      adminEducatorsApiSlice.middleware
    ),
});
