/**
 * Permission Service
 * 
 * Provides role-based access control (RBAC) functionality for the application.
 * Allows checking if a user has permission to perform specific actions based on their role.
 */

import { User } from '@/redux/slices/authSlice';

// Define roles in the system
export type Role = 'admin' | 'user' | 'guest';

// Define resources that can be accessed
export type Resource = 
  | 'dashboard'
  | 'documents'
  | 'workflows'
  | 'users'
  | 'settings'
  | 'api-keys';

// Define actions that can be performed on resources
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

// Permission check result
export interface PermissionResult {
  granted: boolean;
  reason?: string;
}

/**
 * Role-based permission matrix
 * Defines what actions each role can perform on each resource
 */
const rolePermissions: Record<Role, Record<Resource, Action[]>> = {
  admin: {
    dashboard: ['read'],
    documents: ['create', 'read', 'update', 'delete', 'manage'],
    workflows: ['create', 'read', 'update', 'delete', 'manage'],
    users: ['create', 'read', 'update', 'delete', 'manage'],
    settings: ['read', 'update', 'manage'],
    'api-keys': ['create', 'read', 'update', 'delete', 'manage']
  },
  user: {
    dashboard: ['read'],
    documents: ['create', 'read', 'update', 'delete'],
    workflows: ['create', 'read', 'update', 'delete'],
    users: ['read'],
    settings: ['read', 'update'],
    'api-keys': ['create', 'read', 'update', 'delete']
  },
  guest: {
    dashboard: ['read'],
    documents: ['read'],
    workflows: ['read'],
    users: [],
    settings: ['read'],
    'api-keys': []
  }
};

/**
 * Special permissions - override the role matrix for specific cases
 * For example, a user can always modify their own data, but not others'
 */
const specialPermissions = {
  // Users can always read/update their own profile
  canManageSelfProfile: (user: User, targetUserId?: string): boolean => {
    return !!user.id && !!targetUserId && user.id === targetUserId;
  },
  
  // Document owners can always manage their own documents
  canManageOwnDocument: (user: User, documentOwnerId?: string): boolean => {
    return !!user.id && !!documentOwnerId && user.id === documentOwnerId;
  },
  
  // Workflow owners can always manage their own workflows
  canManageOwnWorkflow: (user: User, workflowOwnerId?: string): boolean => {
    return !!user.id && !!workflowOwnerId && user.id === workflowOwnerId;
  }
};

/**
 * Permission Service class for checking user permissions
 */
export class PermissionService {
  /**
   * Check if a user has permission to perform an action on a resource
   */
  static hasPermission(
    user: User | null, 
    resource: Resource, 
    action: Action,
    context?: Record<string, any>
  ): PermissionResult {
    // If no user is provided, deny access
    if (!user) {
      return { 
        granted: false, 
        reason: 'Authentication required' 
      };
    }
    
    // Get user role, default to 'guest' if not specified
    const role = user.role as Role || 'guest';
    
    // Check special permissions first
    if (context) {
      // User profile management permission
      if (resource === 'users' && context.userId) {
        if (specialPermissions.canManageSelfProfile(user, context.userId)) {
          return { granted: true };
        }
      }
      
      // Document ownership permission
      if (resource === 'documents' && context.documentOwnerId) {
        if (specialPermissions.canManageOwnDocument(user, context.documentOwnerId)) {
          return { granted: true };
        }
      }
      
      // Workflow ownership permission
      if (resource === 'workflows' && context.workflowOwnerId) {
        if (specialPermissions.canManageOwnWorkflow(user, context.workflowOwnerId)) {
          return { granted: true };
        }
      }
    }
    
    // Check role-based permissions
    const allowedActions = rolePermissions[role][resource] || [];
    
    if (allowedActions.includes(action) || allowedActions.includes('manage')) {
      return { granted: true };
    }
    
    return { 
      granted: false, 
      reason: `You do not have '${action}' permission for ${resource}` 
    };
  }
  
  /**
   * Check if user has admin role
   */
  static isAdmin(user: User | null): boolean {
    return !!user && user.role === 'admin';
  }
  
  /**
   * Get allowed resources for a user based on their role
   */
  static getAllowedResources(user: User | null): Resource[] {
    if (!user) return [];
    
    const role = user.role as Role || 'guest';
    return Object.entries(rolePermissions[role])
      .filter(([_, actions]) => actions.length > 0)
      .map(([resource]) => resource as Resource);
  }
}

/**
 * React Hook for checking permissions
 * Usage: const canCreateUser = usePermission('users', 'create');
 */
export function usePermission(
  resource: Resource, 
  action: Action,
  context?: Record<string, any>
): boolean {
  // In a real implementation, this would get the user from Redux or context
  // For now, we'll just return a mock implementation
  
  // Get user from localStorage
  const getUserFromStorage = (): User | null => {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return null;
    
    // Mock a user object based on ID
    return {
      id: userId,
      username: 'user',
      email: 'user@example.com',
      role: 'admin', // Hardcoded for testing
      createdAt: Date.now()
    };
  };
  
  const user = getUserFromStorage();
  return PermissionService.hasPermission(user, resource, action, context).granted;
}