import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { documentsApi } from '@/services/api';

// Define the document type
export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
}

// Define document list state interface
interface DocumentsState {
  documents: Document[];
  activeDocument: Document | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: DocumentsState = {
  documents: [],
  activeDocument: null,
  isLoading: false,
  error: null,
};

// Define async thunks for document operations
export const fetchDocuments = createAsyncThunk(
  'apiDocuments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentsApi.getAllDocuments();
      
      if (response.error) {
        return rejectWithValue(response.error.message);
      }
      
      return response.data!.documents;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch documents');
    }
  }
);

export const fetchDocument = createAsyncThunk(
  'apiDocuments/fetchOne',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await documentsApi.getDocument(documentId);
      
      if (response.error) {
        return rejectWithValue(response.error.message);
      }
      
      return response.data!.document;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch document');
    }
  }
);

export const createDocument = createAsyncThunk(
  'apiDocuments/create',
  async ({ title, content }: { title: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await documentsApi.createDocument(title, content);
      
      if (response.error) {
        return rejectWithValue(response.error.message);
      }
      
      return response.data!.document;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create document');
    }
  }
);

export const updateDocument = createAsyncThunk(
  'apiDocuments/update',
  async (
    { documentId, updates }: { documentId: string; updates: { title?: string; content?: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await documentsApi.updateDocument(documentId, updates);
      
      if (response.error) {
        return rejectWithValue(response.error.message);
      }
      
      return response.data!.document;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update document');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'apiDocuments/delete',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await documentsApi.deleteDocument(documentId);
      
      if (response.error) {
        return rejectWithValue(response.error.message);
      }
      
      return documentId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete document');
    }
  }
);

// Create documents slice
const apiDocumentsSlice = createSlice({
  name: 'apiDocuments',
  initialState,
  reducers: {
    setActiveDocument: (state, action: PayloadAction<Document | null>) => {
      state.activeDocument = action.payload;
    },
    clearDocumentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all documents
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single document
    builder
      .addCase(fetchDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeDocument = action.payload;
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create document
    builder
      .addCase(createDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.push(action.payload);
        state.activeDocument = action.payload;
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update document
    builder
      .addCase(updateDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedDocument = action.payload;
        const index = state.documents.findIndex((doc) => doc.id === updatedDocument.id);
        
        if (index !== -1) {
          state.documents[index] = updatedDocument;
        }
        
        if (state.activeDocument && state.activeDocument.id === updatedDocument.id) {
          state.activeDocument = updatedDocument;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete document
    builder
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = state.documents.filter((doc) => doc.id !== action.payload);
        
        if (state.activeDocument && state.activeDocument.id === action.payload) {
          state.activeDocument = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveDocument, clearDocumentError } = apiDocumentsSlice.actions;
export default apiDocumentsSlice.reducer;