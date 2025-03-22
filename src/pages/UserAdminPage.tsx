import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { usersApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertCircle, MoreHorizontal, UserPlus, Users, Shield, Filter, Search, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: number;
  lastLogin?: number;
}

/**
 * User Administration Page
 * 
 * Allows administrators to view, create, edit, and manage all users
 */
export default function UserAdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated } = useAppSelector(state => state.auth);
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // State for new user form
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    sendInvite: true
  });
  
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Redirect if not admin
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.role !== 'admin') {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page',
        variant: 'destructive',
      });
    }
  }, [isAuthenticated, currentUser, navigate, toast]);
  
  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await usersApi.getAllUsers();
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setUsers(response.data?.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle new user form input changes
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle new user form select changes
  const handleNewUserSelectChange = (name: string, value: string) => {
    setNewUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle new user form switch changes
  const handleNewUserSwitchChange = (name: string, checked: boolean) => {
    setNewUserForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // In a real app, we would call the API to create the user
      // For now, we'll simulate success and add a mock user to the list
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        username: newUserForm.username,
        email: newUserForm.email,
        role: newUserForm.role,
        status: 'active',
        createdAt: Date.now()
      };
      
      setUsers(prev => [...prev, newUser]);
      
      toast({
        title: 'User Created',
        description: `${newUserForm.username} has been created successfully.`,
      });
      
      // Reset form and close dialog
      setNewUserForm({
        username: '',
        email: '',
        password: '',
        role: 'user',
        sendInvite: true
      });
      
      setShowNewUserDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create user',
        variant: 'destructive'
      });
    }
  };
  
  // Open edit user dialog
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };
  
  // Update user status
  const handleUpdateStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      // In a real app, we would call the API to update the user status
      // For now, we'll update the local state
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus }
            : user
        )
      );
      
      toast({
        title: 'Status Updated',
        description: `User status has been updated to ${newStatus}.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };
  
  // Update user role
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      // In a real app, we would call the API to update the user role
      // For now, we'll update the local state
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        )
      );
      
      toast({
        title: 'Role Updated',
        description: `User role has been updated to ${newRole}.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update user role',
        variant: 'destructive'
      });
    }
  };
  
  // Delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      // In a real app, we would call the API to delete the user
      // For now, we'll update the local state
      
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: 'User Deleted',
        description: 'User has been permanently deleted.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };
  
  // Filter users based on search query, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                User Administration
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </div>
            
            <Button onClick={() => setShowNewUserDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={fetchUsers}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Users Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No users found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedRole !== 'all' || selectedStatus !== 'all' 
                  ? 'Try changing your search criteria' 
                  : 'Add your first user to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {user.role === 'admin' && (
                            <Shield className="h-3.5 w-3.5 mr-1 text-primary" />
                          )}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                          ${user.status === 'active' 
                            ? 'bg-green-50 text-green-700' 
                            : user.status === 'inactive' 
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-50 text-red-700'
                          }`}>
                          <span className={`mr-1 h-1.5 w-1.5 rounded-full
                            ${user.status === 'active' 
                              ? 'bg-green-500' 
                              : user.status === 'inactive' 
                                ? 'bg-gray-400'
                                : 'bg-red-500'
                            }`} />
                          <span className="capitalize">{user.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString() 
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              Edit User
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => handleUpdateRole(user.id, user.role === 'admin' ? 'user' : 'admin')}>
                              {user.role === 'admin' ? 'Remove Admin Rights' : 'Make Admin'}
                            </DropdownMenuItem>
                            
                            {user.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(user.id, 'suspended')}>
                                Suspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(user.id, 'active')}>
                                Activate User
                              </DropdownMenuItem>
                            )}
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                  Delete User
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the user account and all associated data. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* New User Dialog */}
      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specific roles and permissions
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={newUserForm.username}
                onChange={handleNewUserChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newUserForm.email}
                onChange={handleNewUserChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={newUserForm.password}
                onChange={handleNewUserChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUserForm.role}
                onValueChange={(value) => handleNewUserSelectChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="sendInvite"
                checked={newUserForm.sendInvite}
                onCheckedChange={(checked) => handleNewUserSwitchChange('sendInvite', checked)}
              />
              <Label htmlFor="sendInvite">Send account invite email</Label>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowNewUserDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details and permissions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  defaultValue={selectedUser.username}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  defaultValue={selectedUser.email}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={selectedUser.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: 'User Updated',
                    description: 'User details have been updated successfully.',
                  });
                  setShowEditDialog(false);
                }}>
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}