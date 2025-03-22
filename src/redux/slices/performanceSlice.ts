import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import performanceTestingService, { 
  PerformanceTestResult, 
  BenchmarkResult, 
  LoadTestConfig
} from '@/lib/performanceTesting';

// Define state interface for performance monitoring
interface PerformanceState {
  testResults: PerformanceTestResult[];
  benchmarks: BenchmarkResult[];
  comparisons: Record<string, any>[];
  isLoading: boolean;
  error: string | null;
  activeTestId: string | null;
}

// Initial state
const initialState: PerformanceState = {
  testResults: [],
  benchmarks: [],
  comparisons: [],
  isLoading: false,
  error: null,
  activeTestId: null
};

// Define async thunks for performance testing
export const testDocumentProcessing = createAsyncThunk(
  'performance/testDocumentProcessing',
  async ({ 
    filePaths, 
    config 
  }: { 
    filePaths: string[]; 
    config?: {
      chunkSize?: number;
      chunkOverlap?: number;
      extractMetadata?: boolean;
    }
  }, 
  { rejectWithValue }) => {
    try {
      const result = await performanceTestingService.testDocumentProcessing(filePaths, config);
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Test failed');
    }
  }
);

export const testVectorSearch = createAsyncThunk(
  'performance/testVectorSearch',
  async ({ 
    queries, 
    config 
  }: { 
    queries: string[]; 
    config?: {
      topK?: number;
      collection?: string;
      similarityThreshold?: number;
    }
  }, 
  { rejectWithValue }) => {
    try {
      const result = await performanceTestingService.testVectorSearch(queries, config);
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Test failed');
    }
  }
);

export const testRagPerformance = createAsyncThunk(
  'performance/testRagPerformance',
  async ({ 
    queries, 
    config 
  }: { 
    queries: string[]; 
    config?: {
      useQueryExpansion?: boolean;
      useReranking?: boolean;
      enhancedContext?: boolean;
      topK?: number;
    }
  }, 
  { rejectWithValue }) => {
    try {
      const result = await performanceTestingService.testRagPerformance(queries, config);
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Test failed');
    }
  }
);

export const runLoadTest = createAsyncThunk(
  'performance/runLoadTest',
  async ({ 
    query, 
    config 
  }: { 
    query: string; 
    config: LoadTestConfig 
  }, 
  { rejectWithValue }) => {
    try {
      const result = await performanceTestingService.runLoadTest(query, config);
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Load test failed');
    }
  }
);

export const compareWithBenchmarks = createAsyncThunk(
  'performance/compareWithBenchmarks',
  async (testId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { performance: PerformanceState };
      const testResult = state.performance.testResults.find(r => r.testName === testId);
      
      if (!testResult) {
        throw new Error(`Test result with ID ${testId} not found`);
      }
      
      const comparison = performanceTestingService.compareWithIndustryBenchmarks(testResult);
      return { testId, comparison };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Comparison failed');
    }
  }
);

export const clearPerformanceResults = createAsyncThunk(
  'performance/clearResults',
  async (_, { rejectWithValue }) => {
    try {
      performanceTestingService.clearResults();
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear results');
    }
  }
);

// Create the performance slice
const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    setActiveTest: (state, action: PayloadAction<string | null>) => {
      state.activeTestId = action.payload;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Document processing test
    builder
      .addCase(testDocumentProcessing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(testDocumentProcessing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.testResults.push(action.payload);
        state.activeTestId = action.payload.testName;
      })
      .addCase(testDocumentProcessing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Vector search test
    builder
      .addCase(testVectorSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(testVectorSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.testResults.push(action.payload);
        state.activeTestId = action.payload.testName;
      })
      .addCase(testVectorSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // RAG performance test
    builder
      .addCase(testRagPerformance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(testRagPerformance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.testResults.push(action.payload);
        state.activeTestId = action.payload.testName;
      })
      .addCase(testRagPerformance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Load test
    builder
      .addCase(runLoadTest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(runLoadTest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.benchmarks.push(action.payload);
      })
      .addCase(runLoadTest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Compare with benchmarks
    builder
      .addCase(compareWithBenchmarks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(compareWithBenchmarks.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Store the comparison result
        const existingIndex = state.comparisons.findIndex(
          c => c.testId === action.payload.testId
        );
        
        if (existingIndex !== -1) {
          state.comparisons[existingIndex] = action.payload.comparison;
        } else {
          state.comparisons.push(action.payload.comparison);
        }
      })
      .addCase(compareWithBenchmarks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Clear results
    builder
      .addCase(clearPerformanceResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearPerformanceResults.fulfilled, (state) => {
        state.isLoading = false;
        state.testResults = [];
        state.benchmarks = [];
        state.comparisons = [];
        state.activeTestId = null;
      })
      .addCase(clearPerformanceResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveTest, resetError } = performanceSlice.actions;
export default performanceSlice.reducer;