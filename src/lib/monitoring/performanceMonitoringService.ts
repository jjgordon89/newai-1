/**
 * Performance Monitoring Service
 * 
 * Provides utilities for tracking and measuring application performance metrics
 */

// Performance metric types
export type MetricType = 'navigation' | 'api' | 'render' | 'resource' | 'custom';

export interface PerformanceMetric {
  id: string;
  type: MetricType;
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

export interface ApiCallMetric extends PerformanceMetric {
  url: string;
  method: string;
  status?: number;
  success: boolean;
}

export interface RenderMetric extends PerformanceMetric {
  component: string;
  rerenders?: number;
}

export interface ResourceMetric extends PerformanceMetric {
  resourceUrl: string;
  resourceType: string;
  size?: number;
  metadata?: Record<string, any>;
}

// Callback types
export type MetricCallback = (metric: PerformanceMetric) => void;
export type PerformanceWarningCallback = (warning: string, data?: any) => void;

/**
 * Performance Monitoring Service Class
 */
export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private isEnabled: boolean = false;
  private metricCallbacks: MetricCallback[] = [];
  private warningCallbacks: PerformanceWarningCallback[] = [];
  private activeMetrics: Map<string, { startTime: number; data: Partial<PerformanceMetric> }> = new Map();
  private metricsHistory: PerformanceMetric[] = [];
  private maxHistoryLength: number = 100;
  private thresholds: Record<string, number> = {
    apiCall: 2000, // 2 seconds for API calls
    render: 50,    // 50ms for component rendering
    resource: 5000, // 5 seconds for resource loading
    navigation: 3000, // 3 seconds for page navigation
  };

  // Private constructor (singleton)
  private constructor() {
    // Set up performance observers if available
    this.setupPerformanceObservers();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Enable or disable performance monitoring
   */
  public enable(enabled: boolean = true): void {
    this.isEnabled = enabled;
    if (enabled) {
      console.info('Performance monitoring enabled');
      this.setupPerformanceObservers();
    } else {
      console.info('Performance monitoring disabled');
    }
  }

  /**
   * Subscribe to performance metrics
   */
  public onMetric(callback: MetricCallback): () => void {
    this.metricCallbacks.push(callback);
    return () => {
      this.metricCallbacks = this.metricCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to performance warnings
   */
  public onWarning(callback: PerformanceWarningCallback): () => void {
    this.warningCallbacks.push(callback);
    return () => {
      this.warningCallbacks = this.warningCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Set performance thresholds for warnings
   */
  public setThresholds(thresholds: Partial<Record<string, number>>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Start tracking a metric
   */
  public startTracking(
    name: string,
    type: MetricType,
    metadata?: Record<string, any>
  ): string {
    if (!this.isEnabled) return '';

    const id = `${type}_${name}_${Date.now()}`;
    this.activeMetrics.set(id, {
      startTime: performance.now(),
      data: {
        id,
        type,
        name,
        metadata
      }
    });
    return id;
  }

  /**
   * Stop tracking a metric and record it
   */
  public stopTracking(id: string, additionalData?: Record<string, any>): PerformanceMetric | null {
    if (!this.isEnabled || !id) return null;

    const metric = this.activeMetrics.get(id);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const fullMetric: PerformanceMetric = {
      ...metric.data,
      startTime: metric.startTime,
      duration,
      ...additionalData
    } as PerformanceMetric;

    // Record the metric
    this.recordMetric(fullMetric);
    
    // Remove from active metrics
    this.activeMetrics.delete(id);

    return fullMetric;
  }

  /**
   * Track a complete metric (when start and end are already known)
   */
  public trackMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;
    this.recordMetric(metric);
  }

  /**
   * Track a component render
   */
  public trackRender(
    componentName: string,
    renderTime: number,
    rerenders?: number
  ): void {
    if (!this.isEnabled) return;

    const metric: RenderMetric = {
      id: `render_${componentName}_${Date.now()}`,
      type: 'render',
      name: `Render ${componentName}`,
      startTime: performance.now() - renderTime,
      duration: renderTime,
      component: componentName,
      rerenders
    };

    this.recordMetric(metric);
    
    // Check for slow renders
    if (renderTime > this.thresholds.render) {
      this.emitWarning(
        `Slow render detected for ${componentName}: ${renderTime.toFixed(2)}ms`,
        { component: componentName, duration: renderTime }
      );
    }
  }

  /**
   * Track API call performance
   */
  public trackApiCall(
    url: string,
    method: string,
    duration: number,
    status?: number,
    success: boolean = true
  ): void {
    if (!this.isEnabled) return;

    const metric: ApiCallMetric = {
      id: `api_${method}_${url}_${Date.now()}`,
      type: 'api',
      name: `API ${method} ${url.split('?')[0]}`,
      startTime: performance.now() - duration,
      duration,
      url,
      method,
      status,
      success
    };

    this.recordMetric(metric);
    
    // Check for slow API calls
    if (duration > this.thresholds.apiCall) {
      this.emitWarning(
        `Slow API call detected: ${method} ${url} took ${duration.toFixed(2)}ms`,
        { url, method, duration }
      );
    }
  }

  /**
   * Get all recorded metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metricsHistory];
  }

  /**
   * Get metrics filtered by type
   */
  public getMetricsByType(type: MetricType): PerformanceMetric[] {
    return this.metricsHistory.filter(metric => metric.type === type);
  }

  /**
   * Get performance summary
   */
  public getSummary(): Record<string, any> {
    if (this.metricsHistory.length === 0) {
      return {
        totalMetrics: 0,
        averages: {}
      };
    }

    // Group metrics by type
    const metricsByType = this.metricsHistory.reduce((acc, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = [];
      }
      acc[metric.type].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    // Calculate averages by type
    const averages = Object.entries(metricsByType).reduce((acc, [type, metrics]) => {
      const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
      acc[type] = totalDuration / metrics.length;
      return acc;
    }, {} as Record<string, number>);

    // Calculate some additional stats
    const apiMetrics = metricsByType['api'] || [];
    const renderMetrics = metricsByType['render'] || [];

    const slowApiCalls = apiMetrics.filter(m => m.duration > this.thresholds.apiCall).length;
    const slowRenders = renderMetrics.filter(m => m.duration > this.thresholds.render).length;

    return {
      totalMetrics: this.metricsHistory.length,
      averages,
      slowApiCalls,
      slowRenders,
      metricCountByType: Object.fromEntries(
        Object.entries(metricsByType).map(([type, metrics]) => [type, metrics.length])
      )
    };
  }

  /**
   * Clear all metrics history
   */
  public clearMetrics(): void {
    this.metricsHistory = [];
  }

  /**
   * Set up Performance Observers if available in the browser
   */
  private setupPerformanceObservers(): void {
    if (!this.isEnabled || typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    try {
      // Navigation timing observer
      const navigationObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackMetric({
              id: `navigation_${navEntry.name}_${Date.now()}`,
              type: 'navigation',
              name: `Navigation to ${navEntry.name}`,
              startTime: 0,
              duration: navEntry.loadEventEnd - navEntry.fetchStart,
              metadata: {
                domInteractive: navEntry.domInteractive,
                domContentLoaded: navEntry.domContentLoadedEventEnd,
                redirectTime: navEntry.redirectEnd - navEntry.redirectStart,
                dnsTime: navEntry.domainLookupEnd - navEntry.domainLookupStart,
                tcpTime: navEntry.connectEnd - navEntry.connectStart,
                timeToFirstByte: navEntry.responseStart - navEntry.requestStart,
                responseTime: navEntry.responseEnd - navEntry.responseStart
              }
            });
          }
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });

      // Resource timing observer
      const resourceObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Skip tracking of analytics and monitoring resources to avoid noise
            if (resourceEntry.name.includes('analytics') || 
                resourceEntry.name.includes('monitoring')) {
              continue;
            }
            
            const resourceType = this.getResourceTypeFromInitiatorType(resourceEntry.initiatorType);
            
            this.trackMetric({
              id: `resource_${resourceEntry.name}_${Date.now()}`,
              type: 'resource',
              name: `Load ${resourceType}`,
              startTime: resourceEntry.startTime,
              duration: resourceEntry.responseEnd - resourceEntry.startTime,
              resourceUrl: resourceEntry.name,
              resourceType: resourceEntry.initiatorType,
              size: resourceEntry.transferSize,
              metadata: {
                url: resourceEntry.name,
                initiatorType: resourceEntry.initiatorType,
                transferSize: resourceEntry.transferSize,
                decodedBodySize: resourceEntry.decodedBodySize
              }
            } as ResourceMetric);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Layout shifts observer (if available)
      try {
        const layoutShiftObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            // Need to use any type because LayoutShift API isn't in standard TS types
            const layoutShift = entry as any;
            if (layoutShift.entryType === 'layout-shift' && !layoutShift.hadRecentInput) {
              const shift = layoutShift.value || 0;
              
              if (shift > 0.01) {  // Only report significant shifts
                this.emitWarning(
                  `Layout shift detected: ${shift.toFixed(4)}`,
                  { value: shift, timestamp: performance.now() }
                );
              }
            }
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Layout shift observation not supported
      }

      // Long tasks observer (if available)
      try {
        const longTaskObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
              this.emitWarning(
                `Long task detected: ${entry.duration.toFixed(2)}ms`,
                { duration: entry.duration, startTime: entry.startTime }
              );
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task observation not supported
      }

    } catch (e) {
      console.error('Error setting up performance observers:', e);
    }
  }

  /**
   * Get a more readable resource type from the initiator
   */
  private getResourceTypeFromInitiatorType(initiatorType: string): string {
    switch (initiatorType) {
      case 'script': return 'JavaScript';
      case 'link': return 'CSS';
      case 'img': return 'Image';
      case 'css': return 'CSS';
      case 'xmlhttprequest': return 'XHR';
      case 'fetch': return 'Fetch';
      case 'other': return 'Resource';
      default: return initiatorType;
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    // Add to history
    this.metricsHistory.push(metric);
    
    // Limit history size
    if (this.metricsHistory.length > this.maxHistoryLength) {
      this.metricsHistory.shift();
    }
    
    // Notify subscribers
    this.metricCallbacks.forEach(callback => {
      try {
        callback(metric);
      } catch (e) {
        console.error('Error in performance metric callback:', e);
      }
    });
  }

  /**
   * Emit a performance warning
   */
  private emitWarning(message: string, data?: any): void {
    this.warningCallbacks.forEach(callback => {
      try {
        callback(message, data);
      } catch (e) {
        console.error('Error in performance warning callback:', e);
      }
    });
  }
}

// Export a singleton instance
export const performanceMonitoring = PerformanceMonitoringService.getInstance();

/**
 * Performance monitoring hook for React components
 */
export function usePerformanceMonitoring() {
  return performanceMonitoring;
}