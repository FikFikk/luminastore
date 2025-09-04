import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login, register, forgotPassword, logout as logoutService } from '@/services/authService';
import { getUser } from '@/services/userService';
import Cookies from 'js-cookie';
import { IUser } from '@/app/components/inteface/IUser';

export interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  isSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!Cookies.get("token"),
  isLoading: false,
  error: null,
  message: null,
  isSuccess: false,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await login(email, password);
      if (result.ok && result.data.access_token) {
        // Set cookie
        Cookies.set("token", result.data.access_token, { 
          expires: 1,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict"
        });
        
        // Fetch user data setelah login berhasil
        const userResult = await getUser();
        if (userResult.ok) {
          return {
            token: result.data.access_token,
            user: userResult.data
          };
        } else {
          // Jika gagal fetch user, tetap return token tapi user null
          return {
            token: result.data.access_token,
            user: null
          };
        }
      }
      return rejectWithValue(result.data?.message || 'Login failed');
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: {
    FirstName: string;
    Surname: string;
    Email: string;
    Password: string;
    PhoneNumber: string;
  }, { rejectWithValue }) => {
    try {
      const result = await register(userData);
      if (result.ok) {
        return result.data;
      }
      return rejectWithValue(result.data?.message || 'Registration failed');
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const forgotPasswordRequest = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const result = await forgotPassword(email);
      if (result.ok) {
        return result.data;
      }
      return rejectWithValue(result.data?.message || 'Failed to send reset email');
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const result = await logoutService();
      if (result.ok) {
        Cookies.remove("token");
        return true;
      }
      return rejectWithValue(result.data?.message || 'Logout failed');
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Thunk untuk fetch user data (digunakan saat app init jika token exists)
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const result = await getUser();
      if (result.ok) {
        return result.data;
      }
      // Jika token invalid, remove cookie
      Cookies.remove("token");
      return rejectWithValue(result.data?.message || 'Failed to fetch user');
    } catch (error) {
      Cookies.remove("token");
      return rejectWithValue('Network error occurred');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.error = null;
      state.message = null;
      state.isSuccess = false;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      Cookies.remove("token");
    },
    // Reducer untuk update user data dari komponen lain
    updateUserData: (state, action: PayloadAction<Partial<IUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
        state.isSuccess = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.message = "Login berhasil ✅";
        state.isSuccess = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isSuccess = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
        state.isSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = "Registrasi berhasil! ✅ Redirecting ke halaman login...";
        state.isSuccess = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isSuccess = false;
      })
      // Forgot Password
      .addCase(forgotPasswordRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
        state.isSuccess = false;
      })
      .addCase(forgotPasswordRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = "Email reset password telah dikirim! ✅ Silakan cek inbox Anda.";
        state.isSuccess = true;
        state.error = null;
      })
      .addCase(forgotPasswordRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isSuccess = false;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.message = "Logout berhasil";
        state.isSuccess = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch User Data
      .addCase(fetchUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearAuthState, setAuthenticated, clearUser, updateUserData } = authSlice.actions;
export default authSlice.reducer;