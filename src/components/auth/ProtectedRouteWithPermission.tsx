import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { PermissionService, Resource, Action } from '@/lib/security/permissionService';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteWithPermissionProps {
  children: React.ReactNode;
  resource: Resource;
  action: Action;
  redirectTo?: string;
  contextData?: Record<string, any>;
}

/**
 * Protected Route With Permission Component
 * 
 * Extends the basic protected route to also check for specific permissions.
 * Will redirect to login if user is not authenticated, or to an access denied page
 * if the user doesn't have the required permissions.
 */
export const ProtectedRouteWithPermission: React.FC<ProtectedRouteWithPermissionProps> = ({
  children,
  resource,
  action,
  redirectTo = '/access-denied',
  contextData = {}
}) => {
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const { toast } = useToast();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 animate-pulse">
            <div className="text-primary text-xl font-bold">AI</div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check user permissions for this resource and action
  const permission = PermissionService.hasPermission(user, resource, action, contextData);

  // If permission granted, render the children
  if (permission.granted) {
    return <>{children}</>;
  }

  // Otherwise, show toast and redirect to access denied page
  toast({
    title: 'Access Denied',
    description: permission.reason || `You don't have permission to access this resource`,
    variant: 'destructive',
  });

  return <Navigate to={redirectTo} replace />;
};

export default ProtectedRouteWithPermission;