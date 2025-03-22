import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { loginRequest } from '@/redux/actions/authActions';
import { RootState } from '@/redux/reducers';
import { useAppDispatch } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginForm() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username && credentials.password) {
      dispatch(loginRequest(credentials.username, credentials.password));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login with Redux-Saga</CardTitle>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription>
                Successfully logged in as {user?.username}!
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>ID:</strong> {user?.id}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required
              />
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading === true}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Hint: Use username <strong>admin</strong> and password <strong>password</strong> to log in.</p>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}