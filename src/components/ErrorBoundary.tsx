import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { performanceMonitoring } from '@/lib/monitoring/performanceMonitoringService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing
 * the whole application.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the performance monitoring system
    if (performanceMonitoring) {
      performanceMonitoring.trackMetric({
        id: `error_${Date.now()}`,
        type: 'custom',
        name: `Error: ${error.name}`,
        startTime: performance.now(),
        duration: 0, // Duration doesn't apply for errors
        metadata: {
          error: error.toString(),
          componentStack: errorInfo.componentStack,
          message: error.message,
          stack: error.stack
        }
      });
    }
    
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Update state with error details
    this.setState({
      errorInfo
    });
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise, use the default error UI
      return (
        <div className="container max-w-md mx-auto p-4 h-full flex items-center justify-center">
          <Card className="w-full border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An error occurred while rendering this component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{this.state.error?.name || 'Error'}</AlertTitle>
                <AlertDescription>{this.state.error?.message}</AlertDescription>
              </Alert>
              
              {this.state.errorInfo && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Component Stack</h4>
                  <div className="bg-muted p-3 rounded-md overflow-auto max-h-40">
                    <pre className="text-xs">{this.state.errorInfo.componentStack}</pre>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Error Boundary
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {new Date().toLocaleTimeString()}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="space-x-2">
              <Button variant="destructive" onClick={this.resetErrorBoundary}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    // If no error occurred, render children normally
    return this.props.children;
  }
}

/**
 * withErrorBoundary Higher-Order Component
 * 
 * Wraps a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;