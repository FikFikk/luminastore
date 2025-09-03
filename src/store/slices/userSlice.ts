import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateUserProfile, uploadProfilePicture } from '@/services/userService';
import { updateUserData } from '@/store/slices/authSlice';

export interface UserState {
  isUpdating: boolean;
  error: string | null;
  message: string | null;
}

const initialState: UserState = {
  isUpdating: false,
  error: null,
  message: null,
};

// Update Profile dengan sync ke authSlice
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (payload: {
    FirstName?: string;
    Surname?: string;
    PhoneNumber?: string;
    Address?: string;
    Email?: string;
  }, { rejectWithValue, dispatch }) => {
    try {
      const result = await updateUserProfile(payload);
      
      console.log('Update profile result:', result); // Debug log
      
      if (result.ok) {
        // Update data di authSlice dengan data yang di-update
        const updatedData = {
          FirstName: payload.FirstName,
          Surname: payload.Surname,
          Email: payload.Email,
          PhoneNumber: payload.PhoneNumber,
          // Hanya update field yang dikirim
          ...Object.fromEntries(
            Object.entries(payload).filter(([_, value]) => value !== undefined && value !== '')
          )
        };
        
        console.log('Updating auth state with:', updatedData); // Debug log
        dispatch(updateUserData(updatedData));
        
        return result.data || updatedData;
      }
      return rejectWithValue(result.data?.message || 'Failed to update profile');
    } catch (error) {
      console.error('Update profile error:', error);
      return rejectWithValue('Network error occurred');
    }
  }
);

export const uploadPhoto = createAsyncThunk(
  'user/uploadPhoto',
  async (file: File, { rejectWithValue, dispatch }) => {
    try {
      const result = await uploadProfilePicture(file);
      
      console.log('Upload photo result:', result); // Debug log
      
      if (result.ok) {
        // Update PhotoProfile di authSlice
        const photoData = {
          PhotoProfile: result.data?.PhotoProfile || result.data
        };
        
        console.log('Updating photo in auth state:', photoData); // Debug log
        dispatch(updateUserData(photoData));
        
        return result.data;
      }
      return rejectWithValue(result.data?.message || 'Failed to upload photo');
    } catch (error) {
      console.error('Upload photo error:', error);
      return rejectWithValue('Network error occurred');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.message = "Profile berhasil diupdate! ✅";
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
        state.message = null;
      })
      // Upload Photo
      .addCase(uploadPhoto.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(uploadPhoto.fulfilled, (state) => {
        state.isUpdating = false;
        state.message = "Foto profile berhasil diupload! ✅";
        state.error = null;
      })
      .addCase(uploadPhoto.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
        state.message = null;
      });
  },
});

export const { clearError, setMessage } = userSlice.actions;
export default userSlice.reducer;