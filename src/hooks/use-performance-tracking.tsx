import React, { useRef, useEffect, useState, useCallback } from 'react';
import { performanceMonitoring } from '@/lib/monitoring/performanceMonitoringService';

/**
 * Hook for tracking component render performance
 * 
 * @param componentName The name of the component to track
 * @returns Object with tracking functions and performance data
 */
export function usePerformanceTracking(componentName: string) {
  const renderCount = useRef(0);
  const startTimeRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const isFirstRender = useRef(true);
  
  // Total time spent rendering this component
  const [totalRenderTime, setTotalRenderTime] = useState(0);
  // Average render time for this component
  const [averageRenderTime, setAverageRenderTime] = useState(0);
  
  useEffect(() => {
    if (isFirstRender.current) {
      // This is the first render, start tracking
      startTimeRef.current = performance.now();
      isFirstRender.current = false;
    } else {
      // This is a subsequent render, calculate and record the render time
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      
      // Update render count
      renderCount.current += 1;
      
      // Record the render time
      lastRenderTimeRef.current = renderTime;
      
      // Update total and average render times
      const newTotal = totalRenderTime + renderTime;
      setTotalRenderTime(newTotal);
      setAverageRenderTime(newTotal / renderCount.current);
      
      // Report to performance monitoring service
      performanceMonitoring.trackRender(
        componentName,
        renderTime,
        renderCount.current
      );
      
      // Reset start time for next render
      startTimeRef.current = performance.now();
    }
    
    // Cleanup function to record unmount performance
    return () => {
      if (!isFirstRender.current) {
        // Record unmount time if this isn't the first render
        const unmountTime = performance.now() - startTimeRef.current;
        
        // Custom event for component unmount
        performanceMonitoring.trackMetric({
          id: `unmount_${componentName}_${Date.now()}`,
          type: 'custom',
          name: `Unmount ${componentName}`,
          startTime: startTimeRef.current,
          duration: unmountTime,
          metadata: {
            componentName,
            unmountTime,
            renderCount: renderCount.current
          }
        });
      }
    };
  }, []); // Intentionally empty to only run once and on unmount
  
  // Function to manually mark the start of a performance-critical section
  const markStart = useCallback((markName: string) => {
    if (!performanceMonitoring) return '';
    
    return performanceMonitoring.startTracking(
      `${componentName}_${markName}`,
      'custom',
      { componentName, markName }
    );
  }, [componentName]);
  
  // Function to manually mark the end of a performance-critical section
  const markEnd = useCallback((markId: string) => {
    if (!performanceMonitoring || !markId) return;
    
    performanceMonitoring.stopTracking(markId);
  }, []);
  
  // Function to track a custom performance event
  const trackEvent = useCallback((eventName: string, duration: number, metadata?: any) => {
    if (!performanceMonitoring) return;
    
    performanceMonitoring.trackMetric({
      id: `${componentName}_${eventName}_${Date.now()}`,
      type: 'custom',
      name: `${componentName} - ${eventName}`,
      startTime: performance.now() - duration,
      duration,
      metadata: {
        componentName,
        eventName,
        ...metadata
      }
    });
  }, [componentName]);
  
  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTimeRef.current,
    totalRenderTime,
    averageRenderTime,
    markStart,
    markEnd,
    trackEvent
  };
}

/**
 * Higher-Order Component for tracking component render performance
 * 
 * @param Component The component to wrap with performance tracking
 * @param options Options for the performance tracking
 * @returns A wrapped component with performance tracking
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  options: { componentName?: string } = {}
) {
  const displayName = options.componentName || 
    Component.displayName || 
    Component.name || 
    'UnknownComponent';
  
  const WrappedComponent = (props: P) => {
    const performance = usePerformanceTracking(displayName);
    
    return <Component {...props} performanceTracking={performance} />;
  };
  
  WrappedComponent.displayName = `withPerformanceTracking(${displayName})`;
  
  return WrappedComponent;
}

export default usePerformanceTracking;