/**
 * API Route Utilities
 * 
 * Utilities for handling Express routes and TypeScript types
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import type { User, ApiKey } from '../../types/database';

/**
 * Type-safe route handler for Express
 * Properly handles returned promises in route handlers
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
  // Return a function that doesn't return anything (void)
  return (req: Request, res: Response, next: NextFunction): void => {
    // Call the handler and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Type guard for user objects from the database
 */
export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.email === 'string'
  );
}

/**
 * Type guard for API key objects from the database
 */
export function isApiKey(obj: any): obj is ApiKey {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.service === 'string' &&
    typeof obj.apiKey === 'string'
  );
}

/**
 * Helper to safely get the user from the request
 */
export function getRequestUser(req: Request): User | null {
  return req.user && isUser(req.user) ? req.user : null;
}

/**
 * Helper to safely get typed API keys from the database result
 */
export function mapApiKeys(keys: any[]): Partial<ApiKey>[] {
  return keys.map(key => ({
    id: key.id,
    service: key.service,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt,
    lastUsed: key.lastUsed
  }));
}