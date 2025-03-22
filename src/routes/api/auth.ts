/**
 * Authentication Routes
 * 
 * API routes for authentication (login, register, logout, current user)
 */

import express from 'express';
import { userDb } from '../../lib/db/sqlite';
import { logAuditEvent, AuditAction, ResourceType } from '../../lib/security/auditLog';
import { authenticate } from '../../middleware/authMiddleware';
import { handleApiError } from '../../lib/api/errorHandler';
import { User } from '../../types/database';
import { asyncHandler, isUser } from '../../lib/api/routeUtils';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      res.status(400).json({
        error: {
          type: 'validation_error',
          message: 'Username, email, and password are required',
          status: 400
        }
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        error: {
          type: 'validation_error',
          message: 'Password must be at least 8 characters long',
          status: 400
        }
      });
      return;
    }

    // Check if user already exists
    const existingUser = await userDb.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        error: {
          type: 'conflict',
          message: 'User with this email already exists',
          status: 409
        }
      });
      return;
    }

    // Create user
    const user = await userDb.createUser(username, email, password);

    // Log registration
    logAuditEvent({
      userId: user.id,
      action: AuditAction.REGISTER,
      resourceType: ResourceType.USER,
      resourceId: user.id,
      details: JSON.stringify({ username, email }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Return user without sensitive information
    res.status(201).json({
      user: isUser(user) ? {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      } : null
    });
    return;
  } catch (error) {
    handleApiError(error, res);
  }
}));

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        error: {
          type: 'validation_error',
          message: 'Email and password are required',
          status: 400
        }
      });
      return;
    }

    // Authenticate user
    const user = await userDb.authenticateUser(email, password);
    if (!user) {
      res.status(401).json({
        error: {
          type: 'authentication_error',
          message: 'Invalid email or password',
          status: 401
        }
      });
      return;
    }

    // Create session
    const session = await userDb.createSession(user.id);

    // Log login
    logAuditEvent({
      userId: user.id,
      action: AuditAction.LOGIN,
      resourceType: ResourceType.USER,
      resourceId: user.id,
      details: JSON.stringify({ email }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Return user and token
    res.json({
      user: isUser(user) ? {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      } : null,
      token: session.token,
      expiresAt: session.expiresAt
    });
    return;
  } catch (error) {
    handleApiError(error, res);
  }
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user / invalidate token
 * @access  Private
 */
router.post('/logout', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(400).json({
        error: {
          type: 'validation_error',
          message: 'No token provided',
          status: 400
        }
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Delete session
    const success = await userDb.deleteSession(token);

    // Log logout
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.LOGOUT,
      resourceType: ResourceType.USER,
      resourceId: req.user!.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.USER, req.user?.id);
  }
}));

/**
 * @route   GET /api/auth/user
 * @desc    Get current user
 * @access  Private
 */
router.get('/user', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const user = req.user;

    res.json({ user });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.USER, req.user?.id);
  }
}));

export default router;