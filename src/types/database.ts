/**
 * Database Type Definitions
 * 
 * Type definitions for database entities
 */

// User entity
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: number;
  updatedAt: number;
  lastLogin?: number;
  passwordHash?: string;
}

// Session entity
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}

// Document entity
export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
}

// API Key entity
export interface ApiKey {
  id: string;
  userId: string;
  service: string;
  apiKey: string;
  createdAt: number;
  updatedAt: number;
  lastUsed?: number;
}

// Audit Log entity
export interface AuditLog {
  id: string;
  timestamp: number;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Document Permission entity
export interface DocumentPermission {
  id: string;
  documentId: string;
  userId: string;
  role: string;
  createdAt: number;
  updatedAt: number;
}