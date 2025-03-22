/**
 * Authentication Middleware
 *
 * Provides authentication and authorization functionality for API routes
 */

import { Request, Response, NextFunction } from 'express';
import { userDb } from "../lib/db/sqlite";
import { logAuditEvent, AuditAction, ResourceType } from "../lib/security/auditLog";

// User interface to match the database schema
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: number;
  updatedAt: number;
  lastLogin?: number;
}

// Session interface to match the database schema
interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * Authentication middleware
 * Validates the authentication token from the request headers
 *
 * @param request Express request object
 * @returns Object containing user if authenticated, or null if not
 */
export async function authenticateRequest(request: Request): Promise<{ user: User | null, error: string | null }> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null, error: "No authentication token provided" };
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Validate token
    const session = await userDb.getSessionByToken(token) as Session | null;
    
    if (!session) {
      return { user: null, error: "Invalid or expired token" };
    }
    
    // Get user
    const user = await userDb.getUserById(session.userId) as User | null;
    
    if (!user) {
      return { user: null, error: "User not found" };
    }
    
    // Log successful authentication
    logAuditEvent({
      userId: user.id,
      action: AuditAction.READ,
      resourceType: ResourceType.USER,
      resourceId: user.id,
      details: JSON.stringify({ action: "api_authenticate" }),
      ipAddress: request.ip || request.headers["x-forwarded-for"] as string || undefined,
      userAgent: request.headers["user-agent"] as string || undefined
    });
    
    return { user, error: null };
  } catch (error) {
    console.error("Authentication error:", error);
    return { user: null, error: "Authentication error" };
  }
}

/**
 * Require authentication middleware
 * Use this middleware to protect routes that require authentication
 *
 * @param req Express request object
 * @param res Express response
 * @param next Express next function
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  authenticateRequest(req)
    .then(({ user, error }) => {
      if (!user) {
        return res.status(401).json({ error: error || "Authentication required" });
      }
      
      // Attach user to request object
      req.user = user;
      next();
    })
    .catch(err => {
      console.error("Auth middleware error:", err);
      res.status(500).json({ error: "Internal server error during authentication" });
    });
}

/**
 * Extract authentication token from request
 * 
 * @param request Express request object 
 * @returns Token string or null
 */
export function getAuthToken(request: Request): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "");
  }
  
  // Try to get token from cookies
  const tokenCookie = request.cookies?.authToken;
  if (tokenCookie) {
    return tokenCookie;
  }
  
  return null;
}

export default {
  authenticateRequest,
  requireAuth,
  getAuthToken
};