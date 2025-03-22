import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import accessControl, { DocumentPermission, AccessRole } from '@/lib/security/accessControl';
import auditLog, { AuditAction, ResourceType, AuditLogEntry } from '@/lib/security/auditLog';

// Define interfaces for the security state
interface AccessControlState {
  permissions: DocumentPermission[];
  currentUserAccessRights: Record<string, AccessRole>;
  isLoading: boolean;
  error: string | null;
}

interface AuditLogState {
  logs: AuditLogEntry[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

interface SecurityState {
  accessControl: AccessControlState;
  auditLog: AuditLogState;
}

// Initial state
const initialState: SecurityState = {
  accessControl: {
    permissions: [],
    currentUserAccessRights: {},
    isLoading: false,
    error: null
  },
  auditLog: {
    logs: [],
    totalCount: 0,
    isLoading: false,
    error: null
  }
};

// Access Control Thunks
export const grantDocumentAccess = createAsyncThunk(
  'security/grantAccess',
  async ({ 
    documentId, 
    userId, 
    role 
  }: { 
    documentId: string; 
    userId: string; 
    role: AccessRole 
  }, 
  { rejectWithValue }) => {
    try {
      const success = accessControl.grantAccess(documentId, userId, role);
      
      if (!success) {
        throw new Error(`Failed to grant ${role} access to user ${userId} for document ${documentId}`);
      }
      
      // Log the action in audit log
      auditLog.logAuditEvent({
        action: AuditAction.GRANT_ACCESS,
        resourceType: ResourceType.DOCUMENT,
        resourceId: documentId,
        userId,
        details: JSON.stringify({ grantedRole: role })
      });
      
      return { documentId, userId, role };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to grant access');
    }
  }
);

export const revokeDocumentAccess = createAsyncThunk(
  'security/revokeAccess',
  async ({ 
    documentId, 
    userId 
  }: { 
    documentId: string; 
    userId: string 
  }, 
  { rejectWithValue }) => {
    try {
      const success = accessControl.revokeAccess(documentId, userId);
      
      if (!success) {
        throw new Error(`Failed to revoke access from user ${userId} for document ${documentId}`);
      }
      
      // Log the action in audit log
      auditLog.logAuditEvent({
        action: AuditAction.REVOKE_ACCESS,
        resourceType: ResourceType.DOCUMENT,
        resourceId: documentId,
        userId
      });
      
      return { documentId, userId };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to revoke access');
    }
  }
);

export const getDocumentPermissions = createAsyncThunk(
  'security/getDocumentPermissions',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const users = accessControl.getDocumentUsers(documentId);
      
      // Log the action in audit log (viewing permissions is a READ action)
      auditLog.logAuditEvent({
        action: AuditAction.READ,
        resourceType: ResourceType.DOCUMENT,
        resourceId: documentId,
        details: JSON.stringify({ action: 'view_permissions' })
      });
      
      return { documentId, users };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get document permissions');
    }
  }
);

export const getUserAccessRights = createAsyncThunk(
  'security/getUserAccessRights',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Get all documents the user has access to
      const allDocuments = accessControl.getUserDocuments(userId);
      const accessRights: Record<string, AccessRole> = {};
      
      // Get specific access role for each document
      for (const documentId of allDocuments) {
        const permission = accessControl.getPermission(documentId, userId);
        if (permission) {
          accessRights[documentId] = permission.role;
        }
      }
      
      return { userId, accessRights };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get user access rights');
    }
  }
);

export const checkDocumentAccess = createAsyncThunk(
  'security/checkAccess',
  async ({ 
    documentId, 
    userId, 
    requiredRole 
  }: { 
    documentId: string; 
    userId: string; 
    requiredRole: AccessRole 
  }, 
  { rejectWithValue }) => {
    try {
      const hasAccess = accessControl.hasAccess(documentId, userId, requiredRole);
      
      return { documentId, userId, requiredRole, hasAccess };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to check access');
    }
  }
);

// Audit Log Thunks
export const getAuditLogs = createAsyncThunk(
  'security/getAuditLogs',
  async ({ 
    filters, 
    limit = 100, 
    offset = 0 
  }: { 
    filters?: {
      userId?: string;
      action?: AuditAction;
      resourceType?: ResourceType;
      resourceId?: string;
      startTime?: number;
      endTime?: number;
    };
    limit?: number;
    offset?: number;
  }, 
  { rejectWithValue }) => {
    try {
      const logs = auditLog.getAuditLogs(filters, limit, offset);
      const totalCount = auditLog.getAuditLogsCount(filters);
      
      return { logs, totalCount, limit, offset };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to retrieve audit logs');
    }
  }
);

export const logSecurityEvent = createAsyncThunk(
  'security/logEvent',
  async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>, { rejectWithValue }) => {
    try {
      const success = auditLog.logAuditEvent(entry);
      
      if (!success) {
        throw new Error('Failed to log security event');
      }
      
      return entry;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to log security event');
    }
  }
);

export const clearAuditLogs = createAsyncThunk(
  'security/clearAuditLogs',
  async (olderThan: number | undefined, { rejectWithValue }) => {
    try {
      const deletedCount = auditLog.clearAuditLogs(olderThan);
      
      // Log this action itself (admin action)
      auditLog.logAuditEvent({
        action: AuditAction.DELETE,
        resourceType: ResourceType.SYSTEM,
        details: JSON.stringify({
          action: 'clear_audit_logs',
          olderThan: olderThan ? new Date(olderThan).toISOString() : 'all',
          deletedCount
        })
      });
      
      return { deletedCount, olderThan };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear audit logs');
    }
  }
);

// Create the security slice
const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    resetSecurityErrors: (state) => {
      state.accessControl.error = null;
      state.auditLog.error = null;
    },
  },
  extraReducers: (builder) => {
    // Grant document access
    builder
      .addCase(grantDocumentAccess.pending, (state) => {
        state.accessControl.isLoading = true;
        state.accessControl.error = null;
      })
      .addCase(grantDocumentAccess.fulfilled, (state, action) => {
        state.accessControl.isLoading = false;
        // Update permissions if we're tracking this document's permissions
        const { documentId, userId, role } = action.payload;
        state.accessControl.currentUserAccessRights[documentId] = role;
      })
      .addCase(grantDocumentAccess.rejected, (state, action) => {
        state.accessControl.isLoading = false;
        state.accessControl.error = action.payload as string;
      });
      
    // Revoke document access
    builder
      .addCase(revokeDocumentAccess.pending, (state) => {
        state.accessControl.isLoading = true;
        state.accessControl.error = null;
      })
      .addCase(revokeDocumentAccess.fulfilled, (state, action) => {
        state.accessControl.isLoading = false;
        const { documentId, userId } = action.payload;
        
        // Remove from current user's access rights if it's the current user
        if (documentId in state.accessControl.currentUserAccessRights) {
          delete state.accessControl.currentUserAccessRights[documentId];
        }
        
        // Remove from permissions list if we're tracking this document's permissions
        state.accessControl.permissions = state.accessControl.permissions.filter(
          p => !(p.documentId === documentId && p.userId === userId)
        );
      })
      .addCase(revokeDocumentAccess.rejected, (state, action) => {
        state.accessControl.isLoading = false;
        state.accessControl.error = action.payload as string;
      });
      
    // Get document permissions
    builder
      .addCase(getDocumentPermissions.pending, (state) => {
        state.accessControl.isLoading = true;
        state.accessControl.error = null;
      })
      .addCase(getDocumentPermissions.fulfilled, (state, action) => {
        state.accessControl.isLoading = false;
        const { documentId, users } = action.payload;
        
        // Convert to permissions format and store
        const permissions: DocumentPermission[] = users.map(user => ({
          id: `${documentId}-${user.userId}`,
          documentId,
          userId: user.userId,
          role: user.role,
          createdAt: Date.now(), // We don't have the actual creation time
          updatedAt: Date.now()
        }));
        
        state.accessControl.permissions = permissions;
      })
      .addCase(getDocumentPermissions.rejected, (state, action) => {
        state.accessControl.isLoading = false;
        state.accessControl.error = action.payload as string;
      });
      
    // Get user access rights
    builder
      .addCase(getUserAccessRights.pending, (state) => {
        state.accessControl.isLoading = true;
        state.accessControl.error = null;
      })
      .addCase(getUserAccessRights.fulfilled, (state, action) => {
        state.accessControl.isLoading = false;
        state.accessControl.currentUserAccessRights = action.payload.accessRights;
      })
      .addCase(getUserAccessRights.rejected, (state, action) => {
        state.accessControl.isLoading = false;
        state.accessControl.error = action.payload as string;
      });
      
    // Get audit logs
    builder
      .addCase(getAuditLogs.pending, (state) => {
        state.auditLog.isLoading = true;
        state.auditLog.error = null;
      })
      .addCase(getAuditLogs.fulfilled, (state, action) => {
        state.auditLog.isLoading = false;
        state.auditLog.logs = action.payload.logs;
        state.auditLog.totalCount = action.payload.totalCount;
      })
      .addCase(getAuditLogs.rejected, (state, action) => {
        state.auditLog.isLoading = false;
        state.auditLog.error = action.payload as string;
      });
      
    // Log security event
    builder
      .addCase(logSecurityEvent.pending, (state) => {
        state.auditLog.isLoading = true;
      })
      .addCase(logSecurityEvent.fulfilled, (state) => {
        state.auditLog.isLoading = false;
        // We don't update state here because the log event is stored in the database
        // If needed, we would re-fetch the logs
      })
      .addCase(logSecurityEvent.rejected, (state, action) => {
        state.auditLog.isLoading = false;
        state.auditLog.error = action.payload as string;
      });
      
    // Clear audit logs
    builder
      .addCase(clearAuditLogs.pending, (state) => {
        state.auditLog.isLoading = true;
        state.auditLog.error = null;
      })
      .addCase(clearAuditLogs.fulfilled, (state) => {
        state.auditLog.isLoading = false;
        state.auditLog.logs = [];
        state.auditLog.totalCount = 0;
      })
      .addCase(clearAuditLogs.rejected, (state, action) => {
        state.auditLog.isLoading = false;
        state.auditLog.error = action.payload as string;
      });
  },
});

export const { resetSecurityErrors } = securitySlice.actions;
export default securitySlice.reducer;