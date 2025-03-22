import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  getDocumentPermissions, 
  grantDocumentAccess, 
  revokeDocumentAccess,
  getUserAccessRights
} from '@/redux/slices/securitySlice';
import { AccessRole } from '@/lib/security/accessControl';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Loader2, 
  Plus, 
  Shield, 
  Trash, 
  Lock, 
  Eye, 
  Edit, 
  Users,
  FileText
} from 'lucide-react';

// Role display information
const roleInfo = {
  [AccessRole.OWNER]: { 
    label: 'Owner', 
    description: 'Full control including changing permissions', 
    badge: 'default',
    icon: <Lock className="h-4 w-4 text-primary" />
  },
  [AccessRole.EDITOR]: { 
    label: 'Editor', 
    description: 'Can view and edit the document', 
    badge: 'secondary',
    icon: <Edit className="h-4 w-4 text-blue-500" />
  },
  [AccessRole.VIEWER]: { 
    label: 'Viewer', 
    description: 'Can only view the document', 
    badge: 'outline',
    icon: <Eye className="h-4 w-4 text-gray-500" />
  },
  [AccessRole.NONE]: { 
    label: 'No Access', 
    description: 'Cannot access the document', 
    badge: 'destructive',
    icon: <AlertCircle className="h-4 w-4 text-red-500" />
  }
};

interface DocumentAccessControlProps {
  documentId: string;
  documentTitle?: string;
  currentUserId: string;
}

export function DocumentAccessControl({ 
  documentId, 
  documentTitle = 'Document',
  currentUserId
}: DocumentAccessControlProps) {
  const dispatch = useAppDispatch();
  const { permissions, currentUserAccessRights, isLoading, error } = useAppSelector(state => state.security.accessControl);
  
  const [newUserId, setNewUserId] = useState('');
  const [newUserRole, setNewUserRole] = useState<AccessRole>(AccessRole.VIEWER);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [userToRevoke, setUserToRevoke] = useState<string | null>(null);
  
  // Fetch document permissions on mount
  useEffect(() => {
    dispatch(getDocumentPermissions(documentId));
    dispatch(getUserAccessRights(currentUserId));
  }, [dispatch, documentId, currentUserId]);
  
  // Get current user's role for this document
  const currentUserRole = currentUserAccessRights[documentId] || AccessRole.NONE;
  
  // Check if current user is owner
  const isOwner = currentUserRole === AccessRole.OWNER;
  
  // Handle grant access
  const handleGrantAccess = () => {
    if (newUserId && newUserRole) {
      dispatch(grantDocumentAccess({
        documentId,
        userId: newUserId,
        role: newUserRole
      }));
      
      setNewUserId('');
      setNewUserRole(AccessRole.VIEWER);
      setShowAddDialog(false);
      
      // Refresh permissions
      setTimeout(() => {
        dispatch(getDocumentPermissions(documentId));
      }, 500);
    }
  };
  
  // Handle revoke access
  const handleRevokeAccess = (userId: string) => {
    dispatch(revokeDocumentAccess({
      documentId,
      userId
    }));
    
    setUserToRevoke(null);
    
    // Refresh permissions
    setTimeout(() => {
      dispatch(getDocumentPermissions(documentId));
    }, 500);
  };
  
  // Handle role change
  const handleRoleChange = (userId: string, role: AccessRole) => {
    dispatch(grantDocumentAccess({
      documentId,
      userId,
      role
    }));
    
    // Refresh permissions
    setTimeout(() => {
      dispatch(getDocumentPermissions(documentId));
    }, 500);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Control
            </CardTitle>
            <CardDescription>
              Manage access permissions for {documentTitle}
            </CardDescription>
          </div>
          <div>
            {isOwner && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add User Access</DialogTitle>
                    <DialogDescription>
                      Grant a user access to this document
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="userId">User ID</Label>
                      <Input
                        id="userId"
                        value={newUserId}
                        onChange={(e) => setNewUserId(e.target.value)}
                        placeholder="Enter user ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Access Role</Label>
                      <Select
                        value={newUserRole}
                        onValueChange={(value) => setNewUserRole(value as AccessRole)}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={AccessRole.OWNER}>
                            <div className="flex items-center">
                              {roleInfo[AccessRole.OWNER].icon}
                              <span className="ml-2">{roleInfo[AccessRole.OWNER].label}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value={AccessRole.EDITOR}>
                            <div className="flex items-center">
                              {roleInfo[AccessRole.EDITOR].icon}
                              <span className="ml-2">{roleInfo[AccessRole.EDITOR].label}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value={AccessRole.VIEWER}>
                            <div className="flex items-center">
                              {roleInfo[AccessRole.VIEWER].icon}
                              <span className="ml-2">{roleInfo[AccessRole.VIEWER].label}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {roleInfo[newUserRole].description}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGrantAccess}>
                      Grant Access
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mb-6 p-4 rounded-md bg-muted/20 border">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium">{documentTitle}</h3>
              <p className="text-xs text-muted-foreground">Document ID: {documentId}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <div className="text-sm">Your access level:</div>
            <Badge 
              variant={roleInfo[currentUserRole]?.badge as any || 'outline'} 
              className="ml-2"
            >
              <div className="flex items-center">
                {roleInfo[currentUserRole]?.icon}
                <span className="ml-1">{roleInfo[currentUserRole]?.label || 'Unknown'}</span>
              </div>
            </Badge>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading permissions...</span>
          </div>
        ) : permissions.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-muted-foreground">No users have been granted access yet</p>
            {isOwner && (
              <p className="mt-2 text-sm">
                Use the "Add User" button to grant access to other users
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Access Role</TableHead>
                  <TableHead>Granted</TableHead>
                  {isOwner && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className={permission.userId === currentUserId ? 'font-medium' : ''}>
                          {permission.userId === currentUserId ? 'You' : permission.userId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isOwner && permission.userId !== currentUserId ? (
                        <Select
                          value={permission.role}
                          onValueChange={(value) => handleRoleChange(permission.userId!, value as AccessRole)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue>
                              <div className="flex items-center">
                                {roleInfo[permission.role]?.icon}
                                <span className="ml-2">{roleInfo[permission.role]?.label}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={AccessRole.OWNER}>
                              <div className="flex items-center">
                                {roleInfo[AccessRole.OWNER].icon}
                                <span className="ml-2">{roleInfo[AccessRole.OWNER].label}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={AccessRole.EDITOR}>
                              <div className="flex items-center">
                                {roleInfo[AccessRole.EDITOR].icon}
                                <span className="ml-2">{roleInfo[AccessRole.EDITOR].label}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={AccessRole.VIEWER}>
                              <div className="flex items-center">
                                {roleInfo[AccessRole.VIEWER].icon}
                                <span className="ml-2">{roleInfo[AccessRole.VIEWER].label}</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge 
                          variant={roleInfo[permission.role]?.badge as any || 'outline'}
                        >
                          <div className="flex items-center">
                            {roleInfo[permission.role]?.icon}
                            <span className="ml-1">{roleInfo[permission.role]?.label}</span>
                          </div>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(permission.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    {isOwner && (
                      <TableCell className="text-right">
                        {permission.userId !== currentUserId && (
                          <AlertDialog 
                            open={userToRevoke === permission.userId} 
                            onOpenChange={(open) => !open && setUserToRevoke(null)}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => setUserToRevoke(permission.userId!)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to revoke access for this user?
                                  They will no longer be able to access this document.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleRevokeAccess(permission.userId!)}
                                >
                                  Revoke Access
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between px-6 py-4 border-t">
        <div>
          <p className="text-xs text-muted-foreground">
            {permissions.length} users with access to this document
          </p>
        </div>
        <div>
          <Badge variant="outline" className="text-xs">
            {isOwner ? 'You are the owner' : `You are a ${roleInfo[currentUserRole]?.label || 'Unknown'}`}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
