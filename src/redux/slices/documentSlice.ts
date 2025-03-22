import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  documentStorage, 
  documentUploadService, 
  StoredDocument, 
  DocumentMetadata 
} from '@/lib/documentStorage';

// Define state interface for document management
interface DocumentState {
  documents: StoredDocument[];
  activeDocument: StoredDocument | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: {
    [key: string]: {
      fileName: string;
      progress: number;
      status: 'pending' | 'processing' | 'complete' | 'error';
      error?: string;
    };
  };
}

// Initial state
const initialState: DocumentState = {
  documents: [],
  activeDocument: null,
  isLoading: false,
  error: null,
  uploadProgress: {},
};

// Define async thunks for document operations
export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const repository = documentStorage.getRepository(workspaceId);
      const documents = await repository.listDocuments(workspaceId);
      return documents;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch documents');
    }
  }
);

export const fetchDocument = createAsyncThunk(
  'documents/fetchOne',
  async ({ documentId, workspaceId }: { documentId: string; workspaceId: string }, { rejectWithValue }) => {
    try {
      const repository = documentStorage.getRepository(workspaceId);
      const document = await repository.getDocument(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      return document;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch document');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (
    { 
      file, 
      workspaceId, 
      metadata = {} 
    }: { 
      file: File; 
      workspaceId: string; 
      metadata?: Partial<DocumentMetadata>;
    }, 
    { dispatch, rejectWithValue }
  ) => {
    const fileId = crypto.randomUUID();
    
    try {
      // Register progress callback
      documentUploadService.registerProgressCallback(fileId, (progress) => {
        dispatch(updateUploadProgress({ fileId, progress }));
      });
      
      // Upload document
      const document = await documentUploadService.uploadDocument(file, workspaceId, metadata);
      
      // Unregister callback when done
      documentUploadService.unregisterProgressCallback(fileId);
      
      return document;
    } catch (error) {
      // Unregister callback on error too
      documentUploadService.unregisterProgressCallback(fileId);
      
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload document');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async ({ documentId, workspaceId }: { documentId: string; workspaceId: string }, { rejectWithValue }) => {
    try {
      const repository = documentStorage.getRepository(workspaceId);
      await repository.deleteDocument(documentId);
      return documentId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete document');
    }
  }
);

export const updateDocumentContent = createAsyncThunk(
  'documents/updateContent',
  async (
    { 
      documentId, 
      workspaceId, 
      updates 
    }: { 
      documentId: string; 
      workspaceId: string; 
      updates: Partial<StoredDocument>;
    }, 
    { rejectWithValue }
  ) => {
    try {
      const repository = documentStorage.getRepository(workspaceId);
      const updatedDocument = await repository.updateDocument(documentId, updates);
      return updatedDocument;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update document');
    }
  }
);

export const searchDocuments = createAsyncThunk(
  'documents/search',
  async (
    { query, workspaceId }: { query: string; workspaceId: string }, 
    { rejectWithValue }
  ) => {
    try {
      const repository = documentStorage.getRepository(workspaceId);
      const results = await repository.searchDocuments(query, workspaceId);
      return results;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search documents');
    }
  }
);

// Create document slice
const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setActiveDocument: (state, action: PayloadAction<StoredDocument | null>) => {
      state.activeDocument = action.payload;
    },
    updateUploadProgress: (
      state, 
      action: PayloadAction<{ 
        fileId: string; 
        progress: { 
          fileName: string; 
          progress: number; 
          status: 'pending' | 'processing' | 'complete' | 'error';
          error?: string;
        }; 
      }>
    ) => {
      const { fileId, progress } = action.payload;
      state.uploadProgress[fileId] = progress;
      
      // Clean up completed or error states after a while
      if (progress.status === 'complete' || progress.status === 'error') {
        setTimeout(() => {
          delete state.uploadProgress[fileId];
        }, 5000);
      }
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

    // Upload document
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.push(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
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
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
        if (state.activeDocument && state.activeDocument.id === action.payload) {
          state.activeDocument = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update document
    builder
      .addCase(updateDocumentContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDocumentContent.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.activeDocument && state.activeDocument.id === action.payload.id) {
          state.activeDocument = action.payload;
        }
      })
      .addCase(updateDocumentContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search documents
    builder
      .addCase(searchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload;
      })
      .addCase(searchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveDocument, updateUploadProgress, clearDocumentError } = documentSlice.actions;
export default documentSlice.reducer;