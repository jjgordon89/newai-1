import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login, register, clearAuthError, clearSuccessMessage } from '@/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, LockKeyhole, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Unified Authentication Form
 * 
 * Combines login and registration into a single component with tabbed interface
 */
export default function AuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const { user, isAuthenticated, isLoading, error, successMessage } = useAppSelector(
    (state) => state.auth
  );
  
  // Form state
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localSuccessMessage, setLocalSuccessMessage] = useState<string | null>(null);
  
  // Check for registration success message in URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('registered') === 'true') {
      setLocalSuccessMessage('Registration successful! You can now log in.');
      setActiveTab('login');
    }
  }, [location]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Get the redirect path from URL params or default to home
      const from = new URLSearchParams(location.search).get('from') || '/';
      console.log("User is authenticated, redirecting to", from);
      
      // Force navigation with a slight delay to ensure state is fully updated
      setTimeout(() => navigate(from, { replace: true }), 100);
    }
  }, [isAuthenticated, user, navigate, location.search]);
  
  // Clear errors when changing tabs
  useEffect(() => {
    dispatch(clearAuthError());
    setValidationError(null);
  }, [activeTab, dispatch]);
  
  // Clear success message when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);
  
  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(clearAuthError());
    
    try {
      await dispatch(login({ email, password })).unwrap();
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      
      // Redirect will happen via the authentication effect
    } catch (err) {
      // Error handling is done in the slice
      toast({
        title: 'Login failed',
        description: err as string,
        variant: 'destructive',
      });
    }
  };
  
  // Handle registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationError(null);
    dispatch(clearAuthError());
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      await dispatch(register({ username, email, password })).unwrap();
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created. You can now log in.',
      });
      
      // Switch to login tab
      setActiveTab('login');
      
      // Clear form
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      // Error is handled in the slice, but we can add additional error handling here if needed
      toast({
        title: 'Registration failed',
        description: err as string,
        variant: 'destructive',
      });
    }
  };
  
  // Determine which error to show (validation error or API error)
  const displayError = validationError || error;
  
  // Display either the success message from the slice or the local one
  const displaySuccessMessage = successMessage || localSuccessMessage;
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login" className="relative">
            <LockKeyhole className="mr-2 h-4 w-4" />
            Login
          </TabsTrigger>
          <TabsTrigger value="register">
            <UserPlus className="mr-2 h-4 w-4" />
            Register
          </TabsTrigger>
        </TabsList>
        
        <CardHeader>
          <CardTitle>
            {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Fill out the form below to create your account'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}
          {displaySuccessMessage && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{displaySuccessMessage}</AlertDescription>
            </Alert>
          )}
          
          <TabsContent value="login" className="mt-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password-login">Password</Label>
                  <a
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password-login"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="mt-0">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username-register">Username</Label>
                <Input
                  id="username-register"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register">Email</Label>
                <Input
                  id="email-register"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register">Password</Label>
                <Input
                  id="password-register"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </TabsContent>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            {activeTab === 'login' ? (
              <>
                Don't have an account?{" "}
                <a 
                  onClick={() => setActiveTab('register')} 
                  className="text-primary hover:underline cursor-pointer"
                >
                  Register
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a 
                  onClick={() => setActiveTab('login')} 
                  className="text-primary hover:underline cursor-pointer"
                >
                  Log in
                </a>
              </>
            )}
          </p>
        </CardFooter>
      </Tabs>
    </Card>
  );
}