import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/store/slices/userSlice';
import authReducer from '@/store/slices/authSlice';
import cartReducer from '@/store/slices/cartSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;