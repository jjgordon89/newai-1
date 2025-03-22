/**
 * API Keys Routes
 * 
 * API routes for API key management
 */
import express from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import { handleApiError } from '../../lib/api/errorHandler';
import { logAuditEvent, AuditAction, ResourceType } from '../../lib/security/auditLog';
import { apiKeyDb } from '../../lib/db/sqlite';
import { ApiKey } from '../../types/database';
import { asyncHandler, mapApiKeys } from '../../lib/api/routeUtils';

const router = express.Router();

/**
 * @route   GET /api/api-keys
 * @desc    Get all API keys for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    // Get all API keys for the user
    const apiKeys = await apiKeyDb.getUserApiKeys(req.user!.id);
    
    // Remove the actual API keys from the response for security
    const safeApiKeys = mapApiKeys(apiKeys);
    
    res.json({ apiKeys: safeApiKeys });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.API_KEY);
  }
}));

/**
 * @route   POST /api/api-keys
 * @desc    Create or update an API key
 * @access  Private
 */
router.post('/', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const { service, apiKey } = req.body;
    
    if (!service || !apiKey) {
      res.status(400).json({
        error: {
          type: 'validation_error',
          message: 'Service and API key are required',
          status: 400
        }
      });
      return;
    }
    
    // Save API key
    const result = await apiKeyDb.saveApiKey(req.user!.id, service, apiKey);
    
    // Log API key creation/update
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.API_KEY_CREATE,
      resourceType: ResourceType.API_KEY,
      resourceId: result.id,
      details: JSON.stringify({ service }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      apiKey: {
        id: result.id,
        service: result.service,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }
    });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.API_KEY);
  }
}));

/**
 * @route   GET /api/api-keys/:service
 * @desc    Get an API key for a specific service
 * @access  Private
 */
router.get('/:service', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const service = req.params.service;
    
    // Get API key
    const apiKey = await apiKeyDb.getApiKey(req.user!.id, service) as ApiKey | null;
    
    if (!apiKey) {
      res.status(404).json({
        error: {
          type: 'not_found',
          message: `No API key found for service: ${service}`,
          status: 404
        }
      });
      return;
    }
    
    // Update last used timestamp
    await apiKeyDb.updateApiKeyUsage(req.user!.id, service);
    
    // Log API key use
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.API_KEY_USE,
      resourceType: ResourceType.API_KEY,
      resourceId: apiKey.id,
      details: JSON.stringify({ service }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Return the API key (with the actual key)
    res.json({
      apiKey: {
        id: apiKey.id,
        service: apiKey.service,
        apiKey: apiKey.apiKey,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt,
        lastUsed: apiKey.lastUsed
      }
    });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.API_KEY);
  }
}));

/**
 * @route   DELETE /api/api-keys/:service
 * @desc    Delete an API key
 * @access  Private
 */
router.delete('/:service', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const service = req.params.service;
    
    // Get the API key first to get its ID for logging
    const apiKey = await apiKeyDb.getApiKey(req.user!.id, service) as ApiKey | null;
    
    // Delete API key
    const success = await apiKeyDb.deleteApiKey(req.user!.id, service);
    
    if (!success) {
      res.status(404).json({
        error: {
          type: 'not_found',
          message: `No API key found for service: ${service}`,
          status: 404
        }
      });
      return;
    }
    
    // Log API key deletion
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.API_KEY_DELETE,
      resourceType: ResourceType.API_KEY,
      resourceId: apiKey?.id,
      details: JSON.stringify({ service }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.API_KEY);
  }
}));

export default router;