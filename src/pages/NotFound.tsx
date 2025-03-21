import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <div className="mb-6">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link to="/">
            Go to Home
          </Link>
        </Button>
        
        <Button variant="outline" asChild>
          <Link to="/workflow-builder">
            Workflow Builder
          </Link>
        </Button>
      </div>
    </div>
  );
}
