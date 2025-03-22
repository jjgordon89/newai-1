/**
 * Users Routes
 * 
 * API routes for user management
 */

import express, { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { handleApiError } from '../lib/api/errorHandler';
import { logAuditEvent, AuditAction, ResourceType } from '../lib/security/auditLog';
import { userDb } from '../lib/db/sqlite';
import type { User } from '../types/database';
import { asyncHandler, isUser } from '../lib/api/routeUtils';

const router = express.Router();

/**
 * Check if user is an administrator
 * @param user User object
 * @returns True if user is an admin
 */
function isAdmin(user: User | null): boolean {
  return !!user && user.id === 'admin-user-id';
}

/**
 * Check if user is the same as the target user
 * @param user User object
 * @param targetUserId Target user ID
 * @returns True if the user is the same as the target
 */
function isSelf(user: User | null, targetUserId: string): boolean {
  return !!user && user.id === targetUserId;
}

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/', authenticate, asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get the user object with proper type checks
    const user = isUser(req.user) ? req.user : null;
    // Check if the user is an admin
    const admin = isAdmin(user);
    
    if (!admin) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'Only administrators can access all users',
          status: 403
        }
      });
      return;
    }
    
    // Placeholder implementation - in a real app this would query the database
    // This is just a mock response
    const users = [
      user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } : null,
      {
        id: 'another-user-id',
        username: 'anotheruser',
        email: 'another@example.com',
        createdAt: Date.now() - 86400000, // 1 day ago
        updatedAt: Date.now() - 86400000
      }
    ];
    
    const safeUsers = users.filter(Boolean); // Remove null values
    
    // Log admin action
    const userId = user?.id || 'unknown';
    logAuditEvent({
      userId,
      action: AuditAction.READ,
 
      resourceType: ResourceType.USER,
      details: JSON.stringify({ action: 'list_all_users' }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ users });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.USER);
  }
}));

/**
 * @route   GET /api/users/:id
 * @desc    Get a user by ID
 * @access  Private
 */
router.get('/:id', authenticate, asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    
    // Users can only view their own profile unless they're admins
    const user = isUser(req.user) ? req.user : null;
    const admin = isAdmin(user);
    const self = isSelf(user, userId);
    
    if (!admin && !self) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'You can only view your own profile',
          status: 403
        }
      });
      return;
    }
    
    // Get user
    const foundUser = await userDb.getUserById(userId) as User | null;
    
    if (!foundUser) {
      res.status(404).json({
        error: {
          type: 'not_found',
          message: 'User not found',
          status: 404
        }
      });
      return;
    }
    
    // Remove sensitive information
    const { passwordHash, ...safeUser } = foundUser;
    
    // Log user profile access
    if (admin && !self) {
      logAuditEvent({
        userId: req.user!.id,
        action: AuditAction.READ,
        resourceType: ResourceType.USER,
        resourceId: userId,
        details: JSON.stringify({ action: 'admin_view_user' }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }
    
    res.json({ user: safeUser });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.USER, req.params.id);
  }
}));

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user
 * @access  Private
 */
router.put('/:id', authenticate, asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    
    // Users can only update their own profile unless they're admins
    const user = isUser(req.user) ? req.user : null;
    const admin = isAdmin(user);
    const self = isSelf(user, userId);
    
    if (!admin && !self) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'You can only update your own profile',
          status: 403
        }
      });
      return;
    }
    
    // Get current user data
    const foundUser = await userDb.getUserById(userId) as User | null;
    
    if (!foundUser) {
      res.status(404).json({
        error: {
          type: 'not_found',
          message: 'User not found',
          status: 404
        }
      });
      return;
    }
    
    // In a real app, you would update the user in the database
    // This is just a mock response
    const updatedUser = {
      ...foundUser,
      username: req.body.username || foundUser.username,
      email: req.body.email || foundUser.email,
      updatedAt: Date.now()
    };
    
    // Remove sensitive information
    const { passwordHash, ...safeUser } = updatedUser;
    
    // Log user update
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.UPDATE,
      resourceType: ResourceType.USER,
      resourceId: userId,
      details: JSON.stringify({ 
        fields: Object.keys(req.body),
        isAdminAction: admin && !self
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ user: safeUser });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.USER, req.params.id);
  }
}));

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    
    // Only admins can delete users
    const user = isUser(req.user) ? req.user : null;
    const admin = isAdmin(user);
    
    if (!admin) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'Only administrators can delete users',
          status: 403
        }
      });
      return;
    }
    
    // In a real app, you would delete the user from the database
    // This is just a mock response
    const success = true;
    
    // Log user deletion
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.DELETE,
      resourceType: ResourceType.USER,
      resourceId: userId,
      details: JSON.stringify({ action: 'admin_delete_user' }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.USER, req.params.id);
  }
}));

export default router;