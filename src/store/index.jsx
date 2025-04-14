import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./reducer/authSlice"; // Import auth slice
import { adminTradeIdeasApiSlice } from './api/admin/adminTradeIdeasApiSlice';
import { clientTradeIdeasApiSlice } from './api/client/clientTradeIdeasApiSlice';
import { adminLiveSessionApiSlice } from './api/admin/adminLiveSessionApiSlice';
import { clientLiveSessionApiSlice } from './api/client/clientLiveSessionApiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
      [adminTradeIdeasApiSlice.reducerPath]: adminTradeIdeasApiSlice.reducer,
      [clientTradeIdeasApiSlice.reducerPath]: clientTradeIdeasApiSlice.reducer,
      [adminLiveSessionApiSlice.reducerPath]: adminLiveSessionApiSlice.reducer,
      [clientLiveSessionApiSlice.reducerPath]: clientLiveSessionApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(adminTradeIdeasApiSlice.middleware, adminLiveSessionApiSlice.middleware, clientTradeIdeasApiSlice.middleware, 
        clientLiveSessionApiSlice.middleware
      ),
  });