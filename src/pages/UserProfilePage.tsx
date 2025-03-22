import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { usersApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, User, Settings, Shield, LogOut, Key, Save, UserPlus } from 'lucide-react';

/**
 * User Profile Page
 * 
 * Allows users to view and edit their profile information, 
 * manage security settings, and view account activity
 */
export default function UserProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get user data from Redux store
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  
  // State for form data
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    displayName: '',
    bio: ''
  });
  
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferences, setPreferences] = useState({
    enableTwoFactor: false,
    emailNotifications: true,
    darkMode: localStorage.getItem('theme') === 'dark'
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  
  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      const userProfile = user as any;
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        displayName: userProfile.displayName || user.username || '',
        bio: userProfile.bio || ''
      });
    }
  }, [user]);
  
  // Fetch user activity logs
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (user?.id) {
        try {
          // This would be replaced with a real API call in a production app
          // For demo, we'll generate mock data
          const mockLogs = [
            { id: '1', action: 'login', timestamp: Date.now() - 3600000, ipAddress: '192.168.1.1', userAgent: 'Chrome' },
            { id: '2', action: 'document_upload', timestamp: Date.now() - 86400000, ipAddress: '192.168.1.1', userAgent: 'Chrome' },
            { id: '3', action: 'profile_update', timestamp: Date.now() - 172800000, ipAddress: '192.168.1.1', userAgent: 'Chrome' }
          ];
          setActivityLogs(mockLogs);
        } catch (error) {
          console.error('Error fetching activity logs:', error);
          setError('Failed to load activity logs');
        }
      }
    };
    
    fetchActivityLogs();
  }, [user]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Handle profile form input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle security form input changes
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle preference toggle changes
  const handlePreferenceChange = (name: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Handle special cases
    if (name === 'darkMode') {
      // Update theme in localStorage
      localStorage.setItem('theme', value ? 'dark' : 'light');
      // Apply theme to document
      document.documentElement.classList.toggle('dark', value);
    }
  };
  
  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    
    try {
      if (!user?.id) throw new Error('User ID is missing');
      
      // Call API to update user profile
      const response = await usersApi.updateUser(user.id, {
        username: profileForm.username,
        displayName: profileForm.displayName,
        bio: profileForm.bio
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      
      toast({
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    
    // Validate passwords
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setError('New passwords do not match');
      setIsUpdating(false);
      return;
    }
    
    if (securityForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsUpdating(false);
      return;
    }
    
    try {
      if (!user?.id) throw new Error('User ID is missing');
      
      // This would call a real API in production
      // For demo, we'll simulate success
      setTimeout(() => {
        toast({
          title: 'Password Updated',
          description: 'Your password has been changed successfully',
        });
        
        // Reset form
        setSecurityForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setIsUpdating(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      
      toast({
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Failed to change password',
        variant: 'destructive'
      });
      
      setIsUpdating(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      if (!user?.id) throw new Error('User ID is missing');
      
      // Call API to delete account
      const response = await usersApi.deleteUser(user.id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Logout the user
      dispatch(logout());
      
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted',
      });
      
      // Redirect to login page
      navigate('/login');
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete account',
        variant: 'destructive'
      });
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarFallback className="text-2xl">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-2">{user.username}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                <TabsList className="flex flex-col h-full items-stretch space-y-1">
                  <TabsTrigger value="profile" className="justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className="justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="justify-start">
                    <Key className="mr-2 h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full text-destructive hover:text-destructive" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardFooter>
          </Card>
        </aside>
        
        {/* Main content */}
        <div className="flex-1">
          <TabsContent value="profile" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your account profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed directly for security reasons.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={profileForm.displayName}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Password Change Form */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={securityForm.currentPassword}
                        onChange={handleSecurityChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={securityForm.newPassword}
                        onChange={handleSecurityChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={securityForm.confirmPassword}
                        onChange={handleSecurityChange}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          Updating...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </form>
                </div>
                
                <Separator />
                
                {/* Security Preferences */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Security Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableTwoFactor">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        id="enableTwoFactor"
                        checked={preferences.enableTwoFactor}
                        onCheckedChange={(checked) => handlePreferenceChange('enableTwoFactor', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive security alerts and notifications via email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="darkMode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable dark mode for the application interface
                        </p>
                      </div>
                      <Switch
                        id="darkMode"
                        checked={preferences.darkMode}
                        onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Delete Account */}
                <div>
                  <h3 className="text-lg font-medium text-destructive mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all associated data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Account Activity</CardTitle>
                <CardDescription>
                  Recent activity on your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No activity found</p>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium capitalize">
                              {log.action.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>IP: {log.ipAddress}</p>
                            <p>Device: {log.userAgent}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  );
}