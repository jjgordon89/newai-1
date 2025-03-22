import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Workflow definition types
export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  results?: any;
  error?: string;
}

// State interface
interface WorkflowState {
  workflows: Workflow[];
  activeWorkflow: Workflow | null;
  executions: WorkflowExecution[];
  activeExecution: WorkflowExecution | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: WorkflowState = {
  workflows: [],
  activeWorkflow: null,
  executions: [],
  activeExecution: null,
  isLoading: false,
  error: null,
};

// Helper function to load workflows from localStorage
const loadWorkflowsFromStorage = (): Workflow[] => {
  if (typeof localStorage === 'undefined') return [];
  
  try {
    const workflowsJson = localStorage.getItem('workflows');
    return workflowsJson ? JSON.parse(workflowsJson) : [];
  } catch (error) {
    console.error('Error loading workflows from localStorage:', error);
    return [];
  }
};

// Helper function to save workflows to localStorage
const saveWorkflowsToStorage = (workflows: Workflow[]): void => {
  if (typeof localStorage === 'undefined') return;
  
  try {
    localStorage.setItem('workflows', JSON.stringify(workflows));
  } catch (error) {
    console.error('Error saving workflows to localStorage:', error);
  }
};

// Async thunks
export const fetchWorkflows = createAsyncThunk(
  'workflows/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const workflows = loadWorkflowsFromStorage();
      return workflows;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch workflows');
    }
  }
);

export const fetchWorkflow = createAsyncThunk(
  'workflows/fetchOne',
  async (workflowId: string, { rejectWithValue }) => {
    try {
      const workflows = loadWorkflowsFromStorage();
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow with ID ${workflowId} not found`);
      }
      
      return workflow;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch workflow');
    }
  }
);

export const createWorkflow = createAsyncThunk(
  'workflows/create',
  async (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const newWorkflow: Workflow = {
        ...workflow,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const workflows = loadWorkflowsFromStorage();
      const updatedWorkflows = [...workflows, newWorkflow];
      saveWorkflowsToStorage(updatedWorkflows);
      
      return newWorkflow;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create workflow');
    }
  }
);

export const updateWorkflow = createAsyncThunk(
  'workflows/update',
  async (
    { workflowId, updates }: { workflowId: string; updates: Partial<Workflow> }, 
    { rejectWithValue }
  ) => {
    try {
      const workflows = loadWorkflowsFromStorage();
      const workflowIndex = workflows.findIndex(w => w.id === workflowId);
      
      if (workflowIndex === -1) {
        throw new Error(`Workflow with ID ${workflowId} not found`);
      }
      
      const updatedWorkflow: Workflow = {
        ...workflows[workflowIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      workflows[workflowIndex] = updatedWorkflow;
      saveWorkflowsToStorage(workflows);
      
      return updatedWorkflow;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update workflow');
    }
  }
);

export const deleteWorkflow = createAsyncThunk(
  'workflows/delete',
  async (workflowId: string, { rejectWithValue }) => {
    try {
      const workflows = loadWorkflowsFromStorage();
      const updatedWorkflows = workflows.filter(w => w.id !== workflowId);
      
      if (workflows.length === updatedWorkflows.length) {
        throw new Error(`Workflow with ID ${workflowId} not found`);
      }
      
      saveWorkflowsToStorage(updatedWorkflows);
      
      return workflowId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete workflow');
    }
  }
);

export const executeWorkflow = createAsyncThunk(
  'workflows/execute',
  async (workflowId: string, { rejectWithValue }) => {
    try {
      const workflows = loadWorkflowsFromStorage();
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow with ID ${workflowId} not found`);
      }
      
      // Create a new execution record
      const execution: WorkflowExecution = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        workflowId,
        status: 'running',
        startTime: new Date().toISOString(),
      };
      
      // Simulate async execution
      setTimeout(() => {
        // This would be a call to the workflow execution service in a real app
        console.log(`Simulating execution of workflow: ${workflow.name}`);
      }, 0);
      
      return execution;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to execute workflow');
    }
  }
);

// Create the workflow slice
const workflowSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    setActiveWorkflow: (state, action: PayloadAction<Workflow | null>) => {
      state.activeWorkflow = action.payload;
    },
    clearWorkflowError: (state) => {
      state.error = null;
    },
    updateWorkflowExecution: (state, action: PayloadAction<Partial<WorkflowExecution> & { id: string }>) => {
      const { id, ...updates } = action.payload;
      const index = state.executions.findIndex(e => e.id === id);
      
      if (index !== -1) {
        state.executions[index] = { ...state.executions[index], ...updates };
        
        if (state.activeExecution?.id === id) {
          state.activeExecution = { ...state.activeExecution, ...updates };
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch all workflows
    builder
      .addCase(fetchWorkflows.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflows = action.payload;
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Fetch single workflow
    builder
      .addCase(fetchWorkflow.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkflow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeWorkflow = action.payload;
      })
      .addCase(fetchWorkflow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Create workflow
    builder
      .addCase(createWorkflow.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWorkflow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflows.push(action.payload);
        state.activeWorkflow = action.payload;
      })
      .addCase(createWorkflow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Update workflow
    builder
      .addCase(updateWorkflow.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWorkflow.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.workflows.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.workflows[index] = action.payload;
        }
        if (state.activeWorkflow?.id === action.payload.id) {
          state.activeWorkflow = action.payload;
        }
      })
      .addCase(updateWorkflow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Delete workflow
    builder
      .addCase(deleteWorkflow.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflows = state.workflows.filter(w => w.id !== action.payload);
        if (state.activeWorkflow?.id === action.payload) {
          state.activeWorkflow = null;
        }
      })
      .addCase(deleteWorkflow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Execute workflow
    builder
      .addCase(executeWorkflow.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(executeWorkflow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.executions.push(action.payload);
        state.activeExecution = action.payload;
      })
      .addCase(executeWorkflow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setActiveWorkflow, 
  clearWorkflowError,
  updateWorkflowExecution,
} = workflowSlice.actions;

export default workflowSlice.reducer;