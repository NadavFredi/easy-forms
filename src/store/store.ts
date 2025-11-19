import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { authApi } from './api/authApi';
import { formsApi } from './api/formsApi';
import { fieldsApi } from './api/fieldsApi';
import { submissionsApi } from './api/submissionsApi';
import { webhooksApi } from './api/webhooksApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [formsApi.reducerPath]: formsApi.reducer,
    [fieldsApi.reducerPath]: fieldsApi.reducer,
    [submissionsApi.reducerPath]: submissionsApi.reducer,
    [webhooksApi.reducerPath]: webhooksApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      formsApi.middleware,
      fieldsApi.middleware,
      submissionsApi.middleware,
      webhooksApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

