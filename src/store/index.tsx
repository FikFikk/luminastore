import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/store/slices/userSlice';
import authReducer from '@/store/slices/authSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;