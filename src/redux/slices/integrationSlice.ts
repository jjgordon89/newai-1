import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define interfaces for different integration types
export interface Integration {
  id: string;
  name: string;
  type: string;
  isEnabled: boolean;
  isConnected: boolean;
  lastSynced?: string;
  error?: string;
  config: Record<string, any>;
}

// Define state interface
interface IntegrationState {
  integrations: Integration[];
  activeIntegration: Integration | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: IntegrationState = {
  integrations: [],
  activeIntegration: null,
  isLoading: false,
  error: null,
};

// Mock integration data for initial development
const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Google Drive',
    type: 'storage',
    isEnabled: true,
    isConnected: false,
    config: {
      clientId: '',
      apiKey: '',
    },
  },
  {
    id: '2',
    name: 'Google Docs',
    type: 'documents',
    isEnabled: true,
    isConnected: false,
    config: {
      clientId: '',
      apiKey: '',
    },
  },
  {
    id: '3',
    name: 'Notion',
    type: 'knowledge-base',
    isEnabled: true,
    isConnected: false,
    config: {
      apiKey: '',
    },
  },
  {
    id: '4',
    name: 'Confluence',
    type: 'knowledge-base',
    isEnabled: true,
    isConnected: false,
    config: {
      url: '',
      username: '',
      apiToken: '',
    },
  },
  {
    id: '5',
    name: 'SharePoint',
    type: 'enterprise',
    isEnabled: true,
    isConnected: false,
    config: {
      tenantId: '',
      clientId: '',
      clientSecret: '',
    },
  },
];

// Load integrations from localStorage or use mock data
const loadIntegrationsFromStorage = (): Integration[] => {
  try {
    const savedIntegrations = localStorage.getItem('integrations');
    if (savedIntegrations) {
      return JSON.parse(savedIntegrations);
    }
  } catch (error) {
    console.error('Failed to load integrations from storage:', error);
  }
  return mockIntegrations;
};

// Save integrations to localStorage
const saveIntegrationsToStorage = (integrations: Integration[]): void => {
  try {
    localStorage.setItem('integrations', JSON.stringify(integrations));
  } catch (error) {
    console.error('Failed to save integrations to storage:', error);
  }
};

// Async thunks
export const fetchIntegrations = createAsyncThunk(
  'integration/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would call an API
      // For now, use localStorage or mock data
      return loadIntegrationsFromStorage();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch integrations');
    }
  }
);

export const connectIntegration = createAsyncThunk(
  'integration/connect',
  async ({ 
    integrationId, 
    credentials 
  }: { 
    integrationId: string; 
    credentials: Record<string, any> 
  }, 
  { rejectWithValue, getState }) => {
    try {
      // Get current integrations
      const state = getState() as { integration: IntegrationState };
      const integration = state.integration.integrations.find(i => i.id === integrationId);
      
      if (!integration) {
        throw new Error(`Integration with ID ${integrationId} not found`);
      }
      
      // Simulate connecting to the integration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update integration
      const updatedIntegration: Integration = {
        ...integration,
        isConnected: true,
        lastSynced: new Date().toISOString(),
        config: {
          ...integration.config,
          ...credentials,
        },
      };
      
      // Update the integrations list
      const updatedIntegrations = state.integration.integrations.map(i => 
        i.id === integrationId ? updatedIntegration : i
      );
      
      // Save to storage
      saveIntegrationsToStorage(updatedIntegrations);
      
      return updatedIntegration;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to connect integration');
    }
  }
);

export const disconnectIntegration = createAsyncThunk(
  'integration/disconnect',
  async (integrationId: string, { rejectWithValue, getState }) => {
    try {
      // Get current integrations
      const state = getState() as { integration: IntegrationState };
      const integration = state.integration.integrations.find(i => i.id === integrationId);
      
      if (!integration) {
        throw new Error(`Integration with ID ${integrationId} not found`);
      }
      
      // Simulate disconnecting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update integration
      const updatedIntegration: Integration = {
        ...integration,
        isConnected: false,
        error: undefined,
      };
      
      // Update the integrations list
      const updatedIntegrations = state.integration.integrations.map(i => 
        i.id === integrationId ? updatedIntegration : i
      );
      
      // Save to storage
      saveIntegrationsToStorage(updatedIntegrations);
      
      return updatedIntegration;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to disconnect integration');
    }
  }
);

export const syncIntegration = createAsyncThunk(
  'integration/sync',
  async (integrationId: string, { rejectWithValue, getState }) => {
    try {
      // Get current integrations
      const state = getState() as { integration: IntegrationState };
      const integration = state.integration.integrations.find(i => i.id === integrationId);
      
      if (!integration) {
        throw new Error(`Integration with ID ${integrationId} not found`);
      }
      
      if (!integration.isConnected) {
        throw new Error(`Integration ${integration.name} is not connected`);
      }
      
      // Simulate syncing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update integration
      const updatedIntegration: Integration = {
        ...integration,
        lastSynced: new Date().toISOString(),
      };
      
      // Update the integrations list
      const updatedIntegrations = state.integration.integrations.map(i => 
        i.id === integrationId ? updatedIntegration : i
      );
      
      // Save to storage
      saveIntegrationsToStorage(updatedIntegrations);
      
      return updatedIntegration;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sync integration');
    }
  }
);

// Create the integration slice
const integrationSlice = createSlice({
  name: 'integration',
  initialState,
  reducers: {
    setActiveIntegration: (state, action: PayloadAction<string | null>) => {
      if (action.payload === null) {
        state.activeIntegration = null;
      } else {
        state.activeIntegration = state.integrations.find(i => i.id === action.payload) || null;
      }
    },
    updateIntegrationConfig: (state, action: PayloadAction<{ id: string; config: Record<string, any> }>) => {
      const { id, config } = action.payload;
      const integration = state.integrations.find(i => i.id === id);
      
      if (integration) {
        integration.config = {
          ...integration.config,
          ...config,
        };
        
        // If this is the active integration, update that too
        if (state.activeIntegration?.id === id) {
          state.activeIntegration.config = {
            ...state.activeIntegration.config,
            ...config,
          };
        }
        
        // Save to storage
        saveIntegrationsToStorage(state.integrations);
      }
    },
    toggleIntegrationEnabled: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const integration = state.integrations.find(i => i.id === id);
      
      if (integration) {
        integration.isEnabled = !integration.isEnabled;
        
        // If the integration is disabled, also mark it as disconnected
        if (!integration.isEnabled) {
          integration.isConnected = false;
        }
        
        // If this is the active integration, update that too
        if (state.activeIntegration?.id === id) {
          state.activeIntegration.isEnabled = integration.isEnabled;
          if (!integration.isEnabled) {
            state.activeIntegration.isConnected = false;
          }
        }
        
        // Save to storage
        saveIntegrationsToStorage(state.integrations);
      }
    },
    addIntegration: (state, action: PayloadAction<Omit<Integration, 'id'>>) => {
      const newIntegration: Integration = {
        ...action.payload,
        id: crypto.randomUUID(),
      };
      
      state.integrations.push(newIntegration);
      
      // Save to storage
      saveIntegrationsToStorage(state.integrations);
    },
    removeIntegration: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.integrations = state.integrations.filter(i => i.id !== id);
      
      // If the active integration is being removed, clear it
      if (state.activeIntegration?.id === id) {
        state.activeIntegration = null;
      }
      
      // Save to storage
      saveIntegrationsToStorage(state.integrations);
    },
  },
  extraReducers: (builder) => {
    // Fetch integrations
    builder
      .addCase(fetchIntegrations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIntegrations.fulfilled, (state, action) => {
        state.integrations = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchIntegrations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Connect integration
    builder
      .addCase(connectIntegration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectIntegration.fulfilled, (state, action) => {
        const updatedIntegration = action.payload;
        
        // Update in the integrations list
        const index = state.integrations.findIndex(i => i.id === updatedIntegration.id);
        if (index !== -1) {
          state.integrations[index] = updatedIntegration;
        }
        
        // If this is the active integration, update that too
        if (state.activeIntegration?.id === updatedIntegration.id) {
          state.activeIntegration = updatedIntegration;
        }
        
        state.isLoading = false;
      })
      .addCase(connectIntegration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Disconnect integration
    builder
      .addCase(disconnectIntegration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disconnectIntegration.fulfilled, (state, action) => {
        const updatedIntegration = action.payload;
        
        // Update in the integrations list
        const index = state.integrations.findIndex(i => i.id === updatedIntegration.id);
        if (index !== -1) {
          state.integrations[index] = updatedIntegration;
        }
        
        // If this is the active integration, update that too
        if (state.activeIntegration?.id === updatedIntegration.id) {
          state.activeIntegration = updatedIntegration;
        }
        
        state.isLoading = false;
      })
      .addCase(disconnectIntegration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Sync integration
    builder
      .addCase(syncIntegration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncIntegration.fulfilled, (state, action) => {
        const updatedIntegration = action.payload;
        
        // Update in the integrations list
        const index = state.integrations.findIndex(i => i.id === updatedIntegration.id);
        if (index !== -1) {
          state.integrations[index] = updatedIntegration;
        }
        
        // If this is the active integration, update that too
        if (state.activeIntegration?.id === updatedIntegration.id) {
          state.activeIntegration = updatedIntegration;
        }
        
        state.isLoading = false;
      })
      .addCase(syncIntegration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setActiveIntegration, 
  updateIntegrationConfig, 
  toggleIntegrationEnabled,
  addIntegration,
  removeIntegration
} = integrationSlice.actions;

export default integrationSlice.reducer;