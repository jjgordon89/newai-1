/**
 * Authentication Middleware for Express
 *
 * Middleware to authenticate API requests using tokens
 */

import { Request, Response, NextFunction } from 'express';
import { userDb } from '../lib/db/sqlite';
import { logAuditEvent, AuditAction, ResourceType } from '../lib/security/auditLog';
import { authenticateRequest } from './auth';

// Extend the Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authenticate middleware
 * Validates the token from request header and attaches the user to the request object
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Use the authenticateRequest function from auth.ts
  authenticateRequest(req)
    .then(({ user, error }) => {
      if (!user) {
        return res.status(401).json({
          error: {
            type: 'authentication_error',
            message: error || 'Authentication required',
            status: 401
          }
        });
      }
      
      // Attach the user to the request object
      req.user = user;
      
      // Log successful authentication if needed
      logAuditEvent({
        userId: user.id,
        action: AuditAction.READ,
        resourceType: ResourceType.USER,
        resourceId: user.id,
        details: JSON.stringify({ action: "authenticated" }),
        ipAddress: req.ip || req.headers["x-forwarded-for"] as string || undefined,
        userAgent: req.headers["user-agent"] as string || undefined
      });
      
      // Continue to the next middleware/route handler
      next();
    })
    .catch(err => {
      console.error('Authentication error:', err);
      res.status(500).json({
        error: {
          type: 'server_error',
          message: 'Internal server error during authentication',
          status: 500
        }
      });
    });
}