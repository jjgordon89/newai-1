/**
 * API Service
 * 
 * Provides functions to interact with the backend API endpoints
 */

// Base URL for API calls
const API_BASE_URL = 'http://localhost:3001/api';

// API response interface
interface ApiResponse<T> {
  data?: T;
  error?: {
    type: string;
    message: string;
    status: number;
    details?: any;
  };
}

/**
 * Make a request to the API
 */
async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any, 
  headers: HeadersInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Set default headers
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...headers
    };
    
    // Create request options
    const options: RequestInit = {
      method,
      headers: defaultHeaders,
      body: data ? JSON.stringify(data) : undefined,
    };
    
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();
    
    // Handle success responses
    if (response.ok) {
      return { data: responseData };
    }
    
    // Handle error responses
    return { 
      error: responseData.error || {
        type: 'unknown_error',
        message: 'An unknown error occurred',
        status: response.status
      }
    };
  } catch (error) {
    console.error('API request error:', error);
    
    return {
      error: {
        type: 'network_error',
        message: error instanceof Error ? error.message : 'Network request failed',
        status: 500
      }
    };
  }
}

/**
 * Authentication Services
 */
export const authApi = {
  // Login user
  login: async (email: string, password: string) => {
    return apiRequest<{user: any; token: string}>('/auth/login', 'POST', { email, password });
  },
  
  // Register user
  register: async (username: string, email: string, password: string) => {
    return apiRequest<{user: any}>('/auth/register', 'POST', { username, email, password });
  },
  
  // Logout user
  logout: async () => {
    return apiRequest<{success: boolean}>('/auth/logout', 'POST');
  },
  
  // Get current user
  getCurrentUser: async () => {
    return apiRequest<{user: any}>('/auth/user');
  }
};

/**
 * Documents Services
 */
export const documentsApi = {
  // Get all documents
  getAllDocuments: async () => {
    return apiRequest<{documents: any[]}>('/documents');
  },
  
  // Get document by ID
  getDocument: async (documentId: string) => {
    return apiRequest<{document: any}>(`/documents/${documentId}`);
  },
  
  // Create document
  createDocument: async (title: string, content: string) => {
    return apiRequest<{document: any}>('/documents', 'POST', { title, content });
  },
  
  // Update document
  updateDocument: async (documentId: string, updates: {title?: string; content?: string}) => {
    return apiRequest<{document: any}>(`/documents/${documentId}`, 'PUT', updates);
  },
  
  // Delete document
  deleteDocument: async (documentId: string) => {
    return apiRequest<{success: boolean}>(`/documents/${documentId}`, 'DELETE');
  },
  
  // Get document access
  getDocumentAccess: async (documentId: string) => {
    return apiRequest<{users: any[]}>(`/documents/${documentId}/access`);
  },
  
  // Grant access to document
  grantAccess: async (documentId: string, email: string, role: string) => {
    return apiRequest<{success: boolean}>(`/documents/${documentId}/access`, 'POST', { email, role });
  },
  
  // Revoke access from document
  revokeAccess: async (documentId: string, userId: string) => {
    return apiRequest<{success: boolean}>(`/documents/${documentId}/access/${userId}`, 'DELETE');
  }
};

/**
 * API Keys Services
 */
export const apiKeysApi = {
  // Get all API keys
  getAllApiKeys: async () => {
    return apiRequest<{apiKeys: any[]}>('/api-keys');
  },
  
  // Get API key for service
  getApiKey: async (service: string) => {
    return apiRequest<{apiKey: any}>(`/api-keys/${service}`);
  },
  
  // Save API key
  saveApiKey: async (service: string, apiKey: string) => {
    return apiRequest<{apiKey: any}>('/api-keys', 'POST', { service, apiKey });
  },
  
  // Delete API key
  deleteApiKey: async (service: string) => {
    return apiRequest<{success: boolean}>(`/api-keys/${service}`, 'DELETE');
  }
};

/**
 * User Services
 */
export const usersApi = {
  // Get all users (admin only)
  getAllUsers: async () => {
    return apiRequest<{users: any[]}>('/users');
  },
  
  // Get user by ID
  getUser: async (userId: string) => {
    return apiRequest<{user: any}>(`/users/${userId}`);
  },
  
  // Update user
  updateUser: async (userId: string, updates: any) => {
    return apiRequest<{user: any}>(`/users/${userId}`, 'PUT', updates);
  },
  
  // Delete user (admin only)
  deleteUser: async (userId: string) => {
    return apiRequest<{success: boolean}>(`/users/${userId}`, 'DELETE');
  }
};

/**
 * Audit Logs Services
 */
export const auditLogsApi = {
  // Get all audit logs (admin only)
  getAllAuditLogs: async (filters?: any) => {
    const queryParams = filters ? 
      `?${Object.entries(filters)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&')}` 
      : '';
    
    return apiRequest<{logs: any[]; pagination: any}>(`/audit-logs${queryParams}`);
  },
  
  // Get audit log by ID
  getAuditLog: async (logId: string) => {
    return apiRequest<{log: any}>(`/audit-logs/${logId}`);
  },
  
  // Get audit logs for user
  getUserAuditLogs: async (userId: string, filters?: any) => {
    const queryParams = filters ? 
      `?${Object.entries(filters)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&')}` 
      : '';
    
    return apiRequest<{logs: any[]; pagination: any}>(`/audit-logs/user/${userId}${queryParams}`);
  }
};

export default {
  authApi,
  documentsApi,
  apiKeysApi,
  usersApi,
  auditLogsApi
};