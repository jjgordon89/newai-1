/**
 * API Error Handling System
 *
 * Provides standardized error handling for API routes
 */

import { Request, Response } from "express";
import { logAuditEvent, AuditAction, ResourceType } from "@/lib/security/auditLog";

// Standardized API error types
export enum ErrorType {
  AUTHENTICATION = "authentication_error",
  AUTHORIZATION = "authorization_error",
  VALIDATION = "validation_error",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  DATABASE = "database_error",
  EXTERNAL_SERVICE = "external_service_error",
  RATE_LIMIT = "rate_limit_error",
  SERVER = "server_error",
}

// API error interface
export interface ApiError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: Record<string, any>;
  status: number;
}

/**
 * Create a standardized API error
 */
export function createError(
  type: ErrorType,
  message: string,
  status: number = 500,
  details?: Record<string, any>,
  code?: string
): ApiError {
  return {
    type,
    message,
    status,
    ...(details && { details }),
    ...(code && { code }),
  };
}

/**
 * Error mapping for common errors
 */
export const Errors = {
  NotAuthenticated: createError(
    ErrorType.AUTHENTICATION,
    "Authentication required",
    401
  ),
  InvalidCredentials: createError(
    ErrorType.AUTHENTICATION,
    "Invalid credentials",
    401
  ),
  AccessDenied: createError(
    ErrorType.AUTHORIZATION,
    "You don't have permission to access this resource",
    403
  ),
  NotFound: createError(
    ErrorType.NOT_FOUND,
    "Resource not found",
    404
  ),
  UserExists: createError(
    ErrorType.CONFLICT,
    "User with this email already exists",
    409
  ),
  ValidationFailed: (details?: Record<string, any>) =>
    createError(
      ErrorType.VALIDATION,
      "Validation failed",
      400,
      details
    ),
  DatabaseError: createError(
    ErrorType.DATABASE,
    "Database operation failed",
    500
  ),
  ServerError: createError(
    ErrorType.SERVER,
    "Internal server error",
    500
  ),
};

/**
 * Handle an API error and return a standardized response
 */
export function handleApiError(
  error: unknown,
  res: Response,
  userId?: string,
  resourceType?: ResourceType,
  resourceId?: string
): Response {
  console.error("API Error:", error);

  // Default to server error
  let apiError: ApiError = Errors.ServerError;

  // Handle known error types
  if (typeof error === "object" && error !== null) {
    if ("type" in error && "message" in error && "status" in error) {
      apiError = error as ApiError;
    } else if (error instanceof Error) {
      apiError = {
        ...Errors.ServerError,
        message: error.message,
      };
      
      // Special handling for known error types
      if (error.message.includes("not found")) {
        apiError = { ...Errors.NotFound, message: error.message };
      } else if (error.message.includes("permission") || error.message.includes("access denied")) {
        apiError = { ...Errors.AccessDenied, message: error.message };
      } else if (error.message.includes("already exists")) {
        apiError = { ...Errors.UserExists, message: error.message };
      } else if (error.message.includes("invalid") || error.message.includes("required")) {
        apiError = { ...Errors.ValidationFailed(), message: error.message };
      }
    }
  } else if (typeof error === "string") {
    apiError = {
      ...Errors.ServerError,
      message: error,
    };
  }

  // Log the error to the audit log if we have user information
  if (userId) {
    logAuditEvent({
      userId,
      action: AuditAction.UPDATE,
      resourceType: resourceType || ResourceType.SYSTEM,
      resourceId,
      details: JSON.stringify({
        error: apiError.type,
        message: apiError.message,
        status: apiError.status
      }),
    });
  }

  // Return the API response
  return res.status(apiError.status).json({ error: apiError });
}

/**
 * Validate request data against a schema
 */
export function validateRequest<T>(data: unknown, validator: (data: unknown) => data is T): { 
  valid: boolean; 
  data?: T; 
  errors?: Record<string, string> 
} {
  if (validator(data)) {
    return { valid: true, data };
  }
  
  return { 
    valid: false, 
    errors: { _errors: "Invalid request data" } 
  };
}

export default {
  ErrorType,
  Errors,
  createError,
  handleApiError,
  validateRequest,
};