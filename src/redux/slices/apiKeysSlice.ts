import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiKeyManager, ApiProvider, ApiKeyMetadata } from '@/lib/apiKeyManager';

// Define interfaces for the state
interface ApiKeyState {
  [key: string]: string | null;
}

interface ApiKeyMetadataState {
  [key: string]: ApiKeyMetadata | null;
}

interface ApiKeysState {
  keys: ApiKeyState;
  metadata: ApiKeyMetadataState;
  availableProviders: ApiProvider[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ApiKeysState = {
  keys: {},
  metadata: {},
  availableProviders: [],
  isLoading: false,
  error: null,
};

// Async thunks for API key operations
export const saveApiKey = createAsyncThunk(
  'apiKeys/save',
  async ({ 
    provider, 
    key, 
    metadata 
  }: { 
    provider: ApiProvider; 
    key: string; 
    metadata?: Partial<ApiKeyMetadata> 
  }, 
  { rejectWithValue }) => {
    try {
      const success = await apiKeyManager.setApiKey(provider, key, metadata);
      
      if (!success) {
        throw new Error(`Failed to save API key for ${provider}`);
      }
      
      return { provider, key, metadata };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save API key');
    }
  }
);

export const removeApiKey = createAsyncThunk(
  'apiKeys/remove',
  async (provider: ApiProvider, { rejectWithValue }) => {
    try {
      const success = await apiKeyManager.removeApiKey(provider);
      
      if (!success) {
        throw new Error(`Failed to remove API key for ${provider}`);
      }
      
      return provider;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove API key');
    }
  }
);

export const loadApiKeys = createAsyncThunk(
  'apiKeys/load',
  async (_, { rejectWithValue }) => {
    try {
      const providers = apiKeyManager.getAvailableProviders();
      const keys: ApiKeyState = {};
      const metadata: ApiKeyMetadataState = {};
      
      for (const provider of providers) {
        keys[provider] = apiKeyManager.getApiKey(provider);
        metadata[provider] = apiKeyManager.getMetadata(provider);
      }
      
      return { providers, keys, metadata };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load API keys');
    }
  }
);

export const clearAllApiKeys = createAsyncThunk(
  'apiKeys/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      const success = await apiKeyManager.clearAllKeys();
      
      if (!success) {
        throw new Error('Failed to clear all API keys');
      }
      
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear all API keys');
    }
  }
);

export const testApiKey = createAsyncThunk(
  'apiKeys/test',
  async ({ 
    provider, 
    key 
  }: { 
    provider: ApiProvider; 
    key: string;
  }, 
  { rejectWithValue }) => {
    try {
      // In a real application, this would make a test call to the API
      // For now, we'll just simulate a successful validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update metadata to reflect validation
      apiKeyManager.updateMetadata(provider, {
        lastValidated: new Date(),
        isValid: true,
      });
      
      return { provider, isValid: true };
    } catch (error) {
      // Update metadata with validation failure
      apiKeyManager.updateMetadata(provider, {
        lastValidated: new Date(),
        isValid: false,
      });
      
      return rejectWithValue(error instanceof Error ? error.message : 'API key validation failed');
    }
  }
);

// Create the API keys slice
const apiKeysSlice = createSlice({
  name: 'apiKeys',
  initialState,
  reducers: {
    updateApiKeyMetadata: (state, action: PayloadAction<{ provider: ApiProvider, metadata: Partial<ApiKeyMetadata> }>) => {
      const { provider, metadata } = action.payload;
      const existingMetadata = state.metadata[provider] || { provider };
      
      state.metadata[provider] = {
        ...existingMetadata,
        ...metadata,
        provider,
      };
      
      // Also update in the manager for persistence
      apiKeyManager.updateMetadata(provider, metadata);
    },
    setCurrentUserId: (state, action: PayloadAction<string | null>) => {
      // Update the user ID in the API key manager
      apiKeyManager.setCurrentUserId(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Save API key
    builder
      .addCase(saveApiKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveApiKey.fulfilled, (state, action) => {
        const { provider, key, metadata } = action.payload;
        
        state.keys[provider] = key;
        
        if (metadata) {
          const existingMetadata = state.metadata[provider] || { provider };
          state.metadata[provider] = {
            ...existingMetadata,
            ...metadata,
            provider,
          };
        }
        
        if (!state.availableProviders.includes(provider)) {
          state.availableProviders.push(provider);
        }
        
        state.isLoading = false;
      })
      .addCase(saveApiKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Remove API key
    builder
      .addCase(removeApiKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeApiKey.fulfilled, (state, action) => {
        const provider = action.payload;
        
        delete state.keys[provider];
        delete state.metadata[provider];
        
        state.availableProviders = state.availableProviders.filter(p => p !== provider);
        
        state.isLoading = false;
      })
      .addCase(removeApiKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Load API keys
    builder
      .addCase(loadApiKeys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadApiKeys.fulfilled, (state, action) => {
        const { providers, keys, metadata } = action.payload;
        
        state.keys = keys;
        state.metadata = metadata;
        state.availableProviders = providers;
        
        state.isLoading = false;
      })
      .addCase(loadApiKeys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Clear all API keys
    builder
      .addCase(clearAllApiKeys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearAllApiKeys.fulfilled, (state) => {
        state.keys = {};
        state.metadata = {};
        state.availableProviders = [];
        
        state.isLoading = false;
      })
      .addCase(clearAllApiKeys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Test API key
    builder
      .addCase(testApiKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(testApiKey.fulfilled, (state, action) => {
        const { provider, isValid } = action.payload;
        
        if (state.metadata[provider]) {
          state.metadata[provider] = {
            ...state.metadata[provider]!,
            isValid,
            lastValidated: new Date(),
          };
        } else {
          state.metadata[provider] = {
            provider,
            isValid,
            lastValidated: new Date(),
          };
        }
        
        state.isLoading = false;
      })
      .addCase(testApiKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateApiKeyMetadata, setCurrentUserId } = apiKeysSlice.actions;
export default apiKeysSlice.reducer;