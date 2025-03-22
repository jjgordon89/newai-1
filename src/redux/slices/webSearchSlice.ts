import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  SearchResult, 
  searchWeb, 
  formatSearchResultsAsContext,
  getPreferredSearchEngine,
  setPreferredSearchEngine,
  SearchEngine,
  WebSearchOptions
} from '@/lib/webSearchService';
import { apiKeyManager } from '@/lib/apiKeyManager';

// Define the state interface
interface WebSearchState {
  results: SearchResult[];
  recentQueries: string[];
  formattedContext: string;
  preferredEngine: SearchEngine;
  isConfigured: boolean;
  isSearching: boolean;
  error: string | null;
  searchHistory: {
    query: string;
    timestamp: string;
    resultCount: number;
  }[];
}

// Initial state
const initialState: WebSearchState = {
  results: [],
  recentQueries: [],
  formattedContext: '',
  preferredEngine: getPreferredSearchEngine(),
  isConfigured: false,
  isSearching: false,
  error: null,
  searchHistory: [],
};

// Async thunk for performing web searches
export const performWebSearch = createAsyncThunk(
  'webSearch/search',
  async ({ 
    query, 
    maxResults = 5,
    timeRange = 'month',
  }: { 
    query: string; 
    maxResults?: number;
    timeRange?: 'day' | 'week' | 'month' | 'year';
  }, 
  { rejectWithValue }) => {
    try {
      // Perform the search
      const results = await searchWeb(query, maxResults, timeRange);
      
      // Format results as context
      const formattedContext = formatSearchResultsAsContext(results);
      
      return { 
        results, 
        formattedContext,
        query,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Web search failed');
    }
  }
);

// Check if search APIs are configured
export const checkSearchConfiguration = createAsyncThunk(
  'webSearch/checkConfiguration',
  async (_, { rejectWithValue }) => {
    try {
      // Check if any search API key is available
      const isGoogleConfigured = apiKeyManager.hasApiKey('google');
      const isBraveConfigured = apiKeyManager.hasApiKey('brave');
      const isDuckDuckGoConfigured = apiKeyManager.hasApiKey('duckduckgo');
      const isSerpConfigured = apiKeyManager.hasApiKey('serp');
      
      const isConfigured = isGoogleConfigured || isBraveConfigured || isDuckDuckGoConfigured || isSerpConfigured;
      
      return { isConfigured };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to check search configuration');
    }
  }
);

// Set preferred search engine
export const changePreferredEngine = createAsyncThunk(
  'webSearch/changePreferredEngine',
  async (engine: SearchEngine, { rejectWithValue }) => {
    try {
      setPreferredSearchEngine(engine);
      return { engine };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to change search engine');
    }
  }
);

// Create the web search slice
const webSearchSlice = createSlice({
  name: 'webSearch',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.results = [];
      state.formattedContext = '';
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
      state.recentQueries = [];
    },
    addToRecentQueries: (state, action: PayloadAction<string>) => {
      // Add to recent queries, but don't add duplicates
      if (!state.recentQueries.includes(action.payload)) {
        // Keep only the 10 most recent queries
        if (state.recentQueries.length >= 10) {
          state.recentQueries.pop();
        }
        state.recentQueries.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // Perform web search
    builder
      .addCase(performWebSearch.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(performWebSearch.fulfilled, (state, action) => {
        const { results, formattedContext, query } = action.payload;
        
        state.results = results;
        state.formattedContext = formattedContext;
        
        // Add to recent queries
        if (!state.recentQueries.includes(query)) {
          if (state.recentQueries.length >= 10) {
            state.recentQueries.pop();
          }
          state.recentQueries.unshift(query);
        }
        
        // Add to search history
        state.searchHistory.unshift({
          query,
          timestamp: new Date().toISOString(),
          resultCount: results.length,
        });
        
        // Keep search history limited to 100 entries
        if (state.searchHistory.length > 100) {
          state.searchHistory = state.searchHistory.slice(0, 100);
        }
        
        state.isSearching = false;
      })
      .addCase(performWebSearch.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });
      
    // Check search configuration
    builder
      .addCase(checkSearchConfiguration.fulfilled, (state, action) => {
        state.isConfigured = action.payload.isConfigured;
      });
      
    // Change preferred engine
    builder
      .addCase(changePreferredEngine.fulfilled, (state, action) => {
        state.preferredEngine = action.payload.engine;
      });
  },
});

export const { clearSearchResults, clearSearchHistory, addToRecentQueries } = webSearchSlice.actions;
export default webSearchSlice.reducer;