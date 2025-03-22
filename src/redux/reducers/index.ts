import { combineReducers } from 'redux';
import authReducer from './authReducer';
import postReducer from './postReducer';
import counterReducer from '../slices/counterSlice';
import userReducer from '../slices/userSlice';
import authSliceReducer from '../slices/authSlice';
import documentReducer from '../slices/documentSlice';
import apiDocumentsReducer from '../slices/apiDocumentsSlice';
import workflowReducer from '../slices/workflowSlice';
import apiKeysReducer from '../slices/apiKeysSlice';
import webSearchReducer from '../slices/webSearchSlice';
import integrationReducer from '../slices/integrationSlice';
import securityReducer from '../slices/securitySlice';
import performanceReducer from '../slices/performanceSlice';
import notificationReducer from '../slices/notificationSlice';

// Root reducer that combines both traditional reducers and Redux Toolkit slices
const rootReducer = combineReducers({
  // Traditional Redux reducers
  traditionalAuth: authReducer,  // renamed to avoid conflict with the slice
  posts: postReducer,
  
  // Redux Toolkit slices
  counter: counterReducer,
  user: userReducer,
  auth: authSliceReducer,  // Modern auth implementation with Redux Toolkit
  documents: documentReducer,  // Document management with Redux Toolkit - Local storage
  apiDocuments: apiDocumentsReducer,  // Document management with backend API
  workflows: workflowReducer,  // Workflow management with Redux Toolkit
  
  // Integration slices
  apiKeys: apiKeysReducer,  // API key management for different services
  webSearch: webSearchReducer,  // Web search functionality
  integrations: integrationReducer,  // Third-party integrations management
  
  // Security and Performance slices
  security: securityReducer,  // Access control and audit logging
  performance: performanceReducer,  // Performance testing and monitoring
  
  // UI and UX slices
  notifications: notificationReducer,  // Notification management including toast messages
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;