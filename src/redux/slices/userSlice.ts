import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define types for our state
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  currentUser: User | null;
  users: User[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: UserState = {
  currentUser: null,
  users: [],
  loading: 'idle',
  error: null
};

// Mock API call to fetch users - in a real app, this would be an actual API call
const fetchUsersFromApi = (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
      ]);
    }, 1000);
  });
};

// Async thunk for fetching users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchUsersFromApi();
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch users');
    }
  }
);

// Create the slice
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    logoutUser: (state) => {
      state.currentUser = null;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
        
        // Also update currentUser if it's the same user
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
      
      // Clear currentUser if it's the removed user
      if (state.currentUser && state.currentUser.id === action.payload) {
        state.currentUser = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { setCurrentUser, logoutUser, addUser, updateUser, removeUser } = userSlice.actions;
export default userSlice.reducer;