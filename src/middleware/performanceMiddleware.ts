/**
 * Performance Middleware
 * 
 * This middleware intercepts API requests and tracks their performance metrics.
 * It can be used with fetch, axios, or other HTTP client libraries.
 */

import { performanceMonitoring } from '@/lib/monitoring/performanceMonitoringService';

// Types for the middleware
type RequestInterceptor = (config: any) => any;
type ResponseInterceptor = (response: any) => any;
type ErrorInterceptor = (error: any) => any;

// Performance Middleware for Fetch API
export const applyFetchPerformanceMiddleware = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // Safely extract URL from different input types
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
    const method = init?.method || 'GET';
    const startTime = performance.now();
    
    try {
      const response = await originalFetch(input, init);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Track the API call
      performanceMonitoring.trackApiCall(
        url,
        method,
        duration,
        response.status,
        response.ok
      );
      
      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Track the failed API call
      performanceMonitoring.trackApiCall(
        url,
        method,
        duration,
        0, // Unknown status
        false
      );
      
      throw error;
    }
  };
};

// Performance Middleware for Axios
export const axiosPerformanceMiddleware = {
  request: (config: any) => {
    // Add start time to the request config
    config.metadata = { startTime: performance.now() };
    return config;
  },
  
  response: (response: any) => {
    const { config } = response;
    
    if (config?.metadata?.startTime) {
      const duration = performance.now() - config.metadata.startTime;
      
      // Track the API call
      performanceMonitoring.trackApiCall(
        config.url,
        config.method.toUpperCase(),
        duration,
        response.status,
        true
      );
    }
    
    return response;
  },
  
  error: (error: any) => {
    const { config, response } = error;
    
    if (config?.metadata?.startTime) {
      const duration = performance.now() - config.metadata.startTime;
      
      // Track the failed API call
      performanceMonitoring.trackApiCall(
        config.url,
        config.method.toUpperCase(),
        duration,
        response?.status || 0,
        false
      );
    }
    
    throw error;
  }
};

// Function to apply axios interceptors
export const applyAxiosPerformanceMiddleware = (axios: any) => {
  axios.interceptors.request.use(
    axiosPerformanceMiddleware.request,
    (error: any) => Promise.reject(error)
  );
  
  axios.interceptors.response.use(
    axiosPerformanceMiddleware.response,
    axiosPerformanceMiddleware.error
  );
};

// Function to set up all performance middleware at once
export const setupPerformanceMiddleware = () => {
  // Apply fetch middleware
  if (typeof window !== 'undefined' && window.fetch) {
    applyFetchPerformanceMiddleware();
  }
  
  // Axios middleware would need to be applied separately
  // with the axios instance:
  // applyAxiosPerformanceMiddleware(axios);
  
  console.log('Performance middleware installed');
};

export default setupPerformanceMiddleware;