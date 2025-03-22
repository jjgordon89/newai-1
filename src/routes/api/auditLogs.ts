/**
 * Audit Logs Routes
 * 
 * API routes for audit log management
 */

import express from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import { handleApiError } from '../../lib/api/errorHandler';
import { 
  logAuditEvent, 
  getAuditLogs, 
  getAuditLogsCount, 
  AuditAction, 
  ResourceType 
} from '../../lib/security/auditLog';
import { asyncHandler } from '../../lib/api/routeUtils';

const router = express.Router();

/**
 * @route   GET /api/audit-logs
 * @desc    Get audit logs with optional filters
 * @access  Private
 */
router.get('/', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    // Only allow admins to access all logs
    // This is a placeholder - in a real app, you would implement proper admin role checks
    const isAdmin = req.user!.id === 'admin-user-id';
    
    if (!isAdmin) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'Only administrators can access audit logs',
          status: 403
        }
      });
      return;
    }
    
    // Extract query parameters for filtering
    const { 
      userId, 
      action, 
      resourceType, 
      resourceId, 
      startTime, 
      endTime,
      limit = '100',
      offset = '0'
    } = req.query;
    
    // Build filters object
    const filters: any = {};
    
    if (userId) filters.userId = userId as string;
    if (action) filters.action = action as AuditAction;
    if (resourceType) filters.resourceType = resourceType as ResourceType;
    if (resourceId) filters.resourceId = resourceId as string;
    if (startTime) filters.startTime = parseInt(startTime as string);
    if (endTime) filters.endTime = parseInt(endTime as string);
    
    // Get total count for pagination
    const total = getAuditLogsCount(filters);
    
    // Get audit logs
    const logs = getAuditLogs(
      filters,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    // Process logs to ensure details are properly parsed
    const processedLogs = logs.map(log => ({
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
    }));
    
    // Log this access to audit logs (meta-audit)
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.READ,
      resourceType: ResourceType.SYSTEM,
      details: JSON.stringify({ 
        action: 'view_audit_logs',
        filters: req.query 
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      logs: processedLogs,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.SYSTEM);
  }
}));

/**
 * @route   GET /api/audit-logs/:id
 * @desc    Get a single audit log entry by ID
 * @access  Private
 */
router.get('/:id', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    // Only allow admins to access audit logs
    // This is a placeholder - in a real app, you would implement proper admin role checks
    const isAdmin = req.user!.id === 'admin-user-id';
    
    if (!isAdmin) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'Only administrators can access audit logs',
          status: 403
        }
      });
      return;
    }
    
    const logId = req.params.id;
    
    // Get audit logs filtered by ID
    // Note: In a real implementation, you would have a function to get a log by ID directly
    // This is a workaround using the filter function
    const logs = getAuditLogs({ resourceId: logId });
    
    if (logs.length === 0) {
      res.status(404).json({
        error: {
          type: 'not_found',
          message: `Audit log with ID ${logId} not found`,
          status: 404
        }
      });
      return;
    }
    
    const log = logs[0];
    
    // Ensure details are properly parsed
    const processedLog = {
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
    };
    
    // Log this access to audit logs (meta-audit)
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.READ,
      resourceType: ResourceType.SYSTEM,
      details: JSON.stringify({ 
        action: 'view_audit_log_detail',
        logId 
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ log: processedLog });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.SYSTEM);
  }
}));

/**
 * @route   GET /api/audit-logs/user/:userId
 * @desc    Get audit logs for a specific user
 * @access  Private
 */
router.get('/user/:userId', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const targetUserId = req.params.userId;
    
    // Users can only view their own audit logs unless they're admins
    // This is a placeholder - in a real app, you would implement proper admin role checks
    const isAdmin = req.user!.id === 'admin-user-id';
    const isSelf = req.user!.id === targetUserId;
    
    if (!isAdmin && !isSelf) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'You can only view your own audit logs',
          status: 403
        }
      });
      return;
    }
    
    // Extract query parameters for filtering
    const { 
      action, 
      resourceType, 
      startTime, 
      endTime,
      limit = '100',
      offset = '0'
    } = req.query;
    
    // Build filters object
    const filters: any = { userId: targetUserId };
    
    if (action) filters.action = action as AuditAction;
    if (resourceType) filters.resourceType = resourceType as ResourceType;
    if (startTime) filters.startTime = parseInt(startTime as string);
    if (endTime) filters.endTime = parseInt(endTime as string);
    
    // Get total count for pagination
    const total = getAuditLogsCount(filters);
    
    // Get audit logs
    const logs = getAuditLogs(
      filters,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    // Process logs to ensure details are properly parsed
    const processedLogs = logs.map(log => ({
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
    }));
    
    // Log this access to audit logs (meta-audit)
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.READ,
      resourceType: ResourceType.USER,
      resourceId: targetUserId,
      details: JSON.stringify({ 
        action: 'view_user_audit_logs',
        filters: req.query 
      }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      logs: processedLogs,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.USER, req.params.userId);
  }
}));

export default router;