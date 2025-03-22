import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Activity, 
  RefreshCw, 
  Gauge, 
  Cpu, 
  Zap, 
  Microscope,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

import { performanceMonitoring } from '@/lib/monitoring/performanceMonitoringService';
import { setupPerformanceMiddleware } from '@/middleware/performanceMiddleware';
import usePerformanceTracking from '@/hooks/use-performance-tracking';

// Lazy-loaded components for demonstration purposes
const PerformanceDashboard = lazy(() => 
  import('@/components/performance/PerformanceDashboard')
);

/**
 * Performance Optimization Page
 * 
 * Demonstrates and controls application performance optimizations
 */
export default function PerformanceOptimizationPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(false);
  const [isMiddlewareEnabled, setIsMiddlewareEnabled] = useState(false);
  const [simulationCount, setSimulationCount] = useState(0);
  const [optimizationsApplied, setOptimizationsApplied] = useState({
    codeSplitting: false,
    lazyLoading: false,
    memoization: false,
    virtualLists: false
  });
  const [performanceScore, setPerformanceScore] = useState(60);
  
  // Track this component's performance
  const performance = usePerformanceTracking('PerformanceOptimizationPage');
  
  // Enable/disable performance monitoring
  useEffect(() => {
    performanceMonitoring.enable(isMonitoringEnabled);
    
    // Return cleanup function
    return () => {
      if (isMonitoringEnabled) {
        performanceMonitoring.enable(false);
      }
    };
  }, [isMonitoringEnabled]);
  
  // Enable/disable performance middleware
  useEffect(() => {
    if (isMiddlewareEnabled) {
      setupPerformanceMiddleware();
    }
  }, [isMiddlewareEnabled]);
  
  // Simulate load to demonstrate performance metrics
  const simulateLoad = () => {
    const markId = performance.markStart('simulateLoad');
    
    // Record simulation start
    setSimulationCount(prev => prev + 1);
    
    // Simulate expensive calculation
    const start = window.performance.now();
    
    // Intentionally block the main thread to simulate poor performance
    const blockFor = Math.random() * 300 + 100; // Block for 100-400ms
    const endTime = start + blockFor;
    
    while (window.performance.now() < endTime) {
      // Busy wait to block the main thread
    }
    
    performance.markEnd(markId);
    
    // Simulate API call
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(response => response.json())
      .then(data => {
        console.log('Simulated API call completed', data);
      });
  };
  
  // Apply code optimization
  const applyOptimization = (optimization: keyof typeof optimizationsApplied) => {
    setOptimizationsApplied(prev => ({
      ...prev,
      [optimization]: true
    }));
    
    // Update performance score
    setPerformanceScore(prev => Math.min(100, prev + 10));
  };
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Performance Optimization</h1>
          <p className="text-muted-foreground">
            Monitor and optimize application performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-background border rounded-md px-3 py-1 flex items-center">
            <Gauge className="h-5 w-5 mr-2 text-primary" />
            <span className="font-medium mr-1">Score:</span>
            <span className={`font-bold ${
              performanceScore >= 90 ? 'text-green-600' :
              performanceScore >= 70 ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {performanceScore}
            </span>
          </div>
          
          <Button variant="outline" onClick={simulateLoad}>
            <Activity className="h-4 w-4 mr-2" />
            Simulate Load
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Monitoring Controls</CardTitle>
          <CardDescription>
            Configure monitoring and optimization settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="monitoring" className="flex flex-col space-y-1">
                  <span>Performance Monitoring</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Track runtime performance metrics
                  </span>
                </Label>
                <Switch
                  id="monitoring"
                  checked={isMonitoringEnabled}
                  onCheckedChange={setIsMonitoringEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="middleware" className="flex flex-col space-y-1">
                  <span>API Performance Tracking</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Monitor API call performance
                  </span>
                </Label>
                <Switch
                  id="middleware"
                  checked={isMiddlewareEnabled}
                  onCheckedChange={setIsMiddlewareEnabled}
                />
              </div>
            </div>
            
            <Separator orientation="vertical" className="hidden sm:block h-auto" />
            <Separator className="sm:hidden" />
            
            <div className="space-y-2">
              <h3 className="font-medium">Component Statistics</h3>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Render count:</span>
                  <span className="font-mono">{performance.renderCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last render time:</span>
                  <span className="font-mono">{performance.lastRenderTime.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Average render time:</span>
                  <span className="font-mono">{performance.averageRenderTime.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Load simulations:</span>
                  <span className="font-mono">{simulationCount}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-3">Optimization Techniques</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">Code Splitting</CardTitle>
                    {optimizationsApplied.codeSplitting ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">
                        Applied
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Split code into smaller bundles
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    Reducing bundle size improves initial load time by only loading necessary code.
                  </p>
                  {optimizationsApplied.codeSplitting ? (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Bundle size reduced by 45%
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => applyOptimization('codeSplitting')}
                    >
                      Apply Optimization
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">Lazy Loading</CardTitle>
                    {optimizationsApplied.lazyLoading ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">
                        Applied
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Defer loading of non-critical components
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    Load components only when they are needed, reducing initial load time.
                  </p>
                  {optimizationsApplied.lazyLoading ? (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Initial load time reduced by 35%
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => applyOptimization('lazyLoading')}
                    >
                      Apply Optimization
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">Component Memoization</CardTitle>
                    {optimizationsApplied.memoization ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">
                        Applied
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Prevent unnecessary re-renders
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    Use React.memo, useMemo, and useCallback to optimize rendering performance.
                  </p>
                  {optimizationsApplied.memoization ? (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Re-renders reduced by 60%
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => applyOptimization('memoization')}
                    >
                      Apply Optimization
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">Virtual Lists</CardTitle>
                    {optimizationsApplied.virtualLists ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">
                        Applied
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Efficiently render large lists
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    Only render visible items in large lists, improving scrolling performance.
                  </p>
                  {optimizationsApplied.virtualLists ? (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Rendering time reduced by 85%
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => applyOptimization('virtualLists')}
                    >
                      Apply Optimization
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {performanceScore < 70 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Performance Issues Detected</AlertTitle>
              <AlertDescription>
                Your application has performance issues that could impact user experience.
                Apply the recommended optimizations to improve performance.
              </AlertDescription>
            </Alert>
          )}
          
          {performanceScore >= 90 && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Excellent Performance</AlertTitle>
              <AlertDescription className="text-green-700">
                Your application is well-optimized and should provide a smooth user experience.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
          <TabsTrigger value="dashboard">
            <BarChart className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="optimizations">
            <Zap className="h-4 w-4 mr-2" />
            Best Practices
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <Microscope className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Loading performance dashboard...</p>
              </div>
            </div>
          }>
            <PerformanceDashboard />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="optimizations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Best Practices</CardTitle>
              <CardDescription>
                Recommended techniques to improve application performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">React Optimization Techniques</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">1. Component Optimization</h4>
                  <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                    <li>Use React.memo for functional components that render often with the same props</li>
                    <li>Implement shouldComponentUpdate or PureComponent for class components</li>
                    <li>Break down large components into smaller, focused ones</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">2. Hook Optimization</h4>
                  <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                    <li>Use useCallback for function references passed to child components</li>
                    <li>Use useMemo for expensive calculations</li>
                    <li>Avoid unnecessary dependencies in useEffect hooks</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">3. Rendering Optimization</h4>
                  <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                    <li>Implement virtualization for long lists (react-window, react-virtualized)</li>
                    <li>Use CSS animations instead of JS animations when possible</li>
                    <li>Debounce or throttle event handlers for scroll, resize, etc.</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Build Optimization Techniques</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">1. Bundle Optimization</h4>
                  <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                    <li>Implement code splitting using dynamic imports</li>
                    <li>Use tree shaking to eliminate dead code</li>
                    <li>Configure proper chunking strategies in your bundler</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">2. Asset Optimization</h4>
                  <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                    <li>Optimize images with WebP format and proper sizing</li>
                    <li>Use SVG for icons and simple graphics</li>
                    <li>Implement lazy loading for off-screen images</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">3. Caching and Delivery</h4>
                  <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                    <li>Implement proper cache headers for static assets</li>
                    <li>Use content hashing for cache busting</li>
                    <li>Consider using a CDN for asset delivery</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>
                Tools and techniques for analyzing application performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">React DevTools Profiler</h3>
                <p className="text-muted-foreground">
                  The React DevTools Profiler is a powerful tool for measuring rendering performance of React applications.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">How to use:</h4>
                  <ol className="ml-6 list-decimal space-y-1 text-muted-foreground">
                    <li>Install React DevTools browser extension</li>
                    <li>Open DevTools and navigate to the "Profiler" tab</li>
                    <li>Click the record button and interact with your app</li>
                    <li>Stop recording and analyze the flame chart</li>
                    <li>Identify components with long render times</li>
                  </ol>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Lighthouse Audits</h3>
                <p className="text-muted-foreground">
                  Lighthouse is an open-source, automated tool for improving the quality of web pages, including performance.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Key metrics:</h4>
                  <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                    <li>First Contentful Paint (FCP)</li>
                    <li>Largest Contentful Paint (LCP)</li>
                    <li>Cumulative Layout Shift (CLS)</li>
                    <li>Total Blocking Time (TBT)</li>
                    <li>Time to Interactive (TTI)</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Web Vitals Monitoring</h3>
                <p className="text-muted-foreground">
                  Web Vitals are a set of quality signals that are essential to delivering a great user experience on the web.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Implementation:</h4>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-xs overflow-auto">
                      {`import {getCLS, getFID, getLCP} from 'web-vitals';

function sendToAnalytics({name, delta, id}) {
  // Send to your analytics service
  console.log({name, delta, id});
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}