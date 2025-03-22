import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/services/api';
import { apiKeyManager } from '@/lib/apiKeyManager';

// Define the user type
export interface User {
  id: string;
  username: string;
  email: string;
  role?: 'admin' | 'user' | 'guest';
  createdAt: number;
  updatedAt?: number;
  lastLogin?: number;
}

// Define the auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  successMessage: null,
};

// Define async thunks for authentication operations
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Call API service
      const response = await authApi.login(email, password);
      
      if (response.error) {
        return rejectWithValue(response.error.message);
      }
      
      const { user, token } = response.data!;
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUserId', user.id);
      
      // Set the current user ID in the API key manager
      if (user && user.id) {
        apiKeyManager.setCurrentUserId(user.id);
      }
      
      return user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    { username, email, password }: { username: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // Call API service
      const response = await authApi.register(username, email, password);
      
      if (response.error) {
        return rejectWithValue(response.error.message);
      }
      
      return response.data!.user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    // Call API service
    const response = await authApi.logout();
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserId');
    
    return true;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
  }
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    // Check if token exists
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }
    
    // Call API service to get current user
    const response = await authApi.getCurrentUser();
    
    if (response.error) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUserId');
      return null;
    }
    
    return response.data!.user;
  } catch (error) {
    console.error('Check auth error:', error);
    return null;
  }
});

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setSuccessMessage: (state, action: PayloadAction<string>) => {
      state.successMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register cases
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.successMessage = 'Registration successful! You can now log in.';
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout cases
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check auth cases
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuthError, clearSuccessMessage, setSuccessMessage } = authSlice.actions;
export default authSlice.reducer;