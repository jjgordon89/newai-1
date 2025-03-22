import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from 'react-redux';
import App from "./App.tsx";
import "./index.css";
// Import the dev tools and initialize them
import { TempoDevtools } from "tempo-devtools";
import { store } from "./redux/store";
import { performanceMonitoring } from './lib/monitoring/performanceMonitoringService';
import { setupPerformanceMiddleware } from './middleware/performanceMiddleware';

// Initialize performance monitoring
if (process.env.NODE_ENV !== 'test') {
  // Enable performance monitoring in development and production
  performanceMonitoring.enable(true);
  
  // Set up performance middleware for API calls
  setupPerformanceMiddleware();
  
  console.log('Performance monitoring initialized');
}

TempoDevtools.init();

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
