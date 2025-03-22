import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Home, ArrowLeft } from 'lucide-react';

/**
 * Access Denied Page
 * 
 * Displayed when a user attempts to access a resource they don't have permission for
 */
export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-md mx-auto py-16">
      <Card className="border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto rounded-full bg-destructive/10 p-3 mb-4">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this resource
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            This area requires specific permissions that your account doesn't have.
            If you believe this is a mistake, please contact your administrator.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}