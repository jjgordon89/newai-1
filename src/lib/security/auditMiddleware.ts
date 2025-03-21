/**
 * Audit Middleware
 *
 * Middleware for logging audit events for API requests
 */

import { NextRequest, NextResponse } from "next/server";
import { logAuditEvent, AuditAction, ResourceType } from "./auditLog";

/**
 * Middleware function to log API access
 */
export function auditMiddleware(
  request: NextRequest,
  action: AuditAction,
  resourceType: ResourceType,
  resourceId?: string,
  userId?: string,
) {
  // Extract request information
  const path = request.nextUrl.pathname;
  const method = request.method;
  const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "";
  const userAgent = request.headers.get("user-agent") || "";

  // Log the audit event
  logAuditEvent({
    userId,
    action,
    resourceType,
    resourceId,
    details: { path, method },
    ipAddress,
    userAgent,
  });
}

/**
 * Wrapper function for API route handlers to add audit logging
 */
export function withAudit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  action: AuditAction,
  resourceType: ResourceType,
  getResourceId?: (request: NextRequest, ...args: any[]) => string | undefined,
  getUserId?: (request: NextRequest, ...args: any[]) => string | undefined,
) {
  return async (request: NextRequest, ...args: any[]) => {
    // Get resource ID and user ID if provided
    const resourceId = getResourceId
      ? getResourceId(request, ...args)
      : undefined;
    const userId = getUserId ? getUserId(request, ...args) : undefined;

    // Log the audit event
    auditMiddleware(request, action, resourceType, resourceId, userId);

    // Call the original handler
    return handler(request, ...args);
  };
}

export default {
  auditMiddleware,
  withAudit,
};
