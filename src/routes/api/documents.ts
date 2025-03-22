/**
 * Document Routes
 * 
 * API routes for document operations
 */

import express, { NextFunction } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import { handleApiError } from '../../lib/api/errorHandler';
import { isUser } from '../../lib/api/routeUtils';
import { logAuditEvent, AuditAction, ResourceType } from '../../lib/security/auditLog';
import { 
  hasAccess, 
  grantAccess, 
  revokeAccess, 
  getDocumentUsers, 
  AccessRole 
} from '../../lib/security/accessControl';
import { userDb } from '../../lib/db/sqlite';
import { asyncHandler } from '../../lib/api/routeUtils';
import type { User } from '../../types/database';

const router = express.Router();

// Document database operations - to be implemented
// This is a placeholder for document storage and retrieval
const documentDb = {
  // Get a document by ID
  getDocumentById: async (id: string) => {
    // Placeholder implementation
    return {
      id,
      title: `Document ${id}`,
      content: 'This is a placeholder document content',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  },
  
  // Create a new document
  createDocument: async (userId: string, title: string, content: string) => {
    const id = `doc-${Date.now()}`;
    const now = Date.now();
    
    // Placeholder implementation - in a real app, this would save to a database
    const document = {
      id,
      title,
      content,
      createdAt: now,
      updatedAt: now,
      ownerId: userId
    };
    
    // Grant owner access to the document creator
    grantAccess(id, userId, AccessRole.OWNER);
    
    return document;
  },
  
  // Update a document
  updateDocument: async (id: string, updates: any) => {
    // Placeholder implementation
    const document = await documentDb.getDocumentById(id);
    
    return {
      ...document,
      ...updates,
      updatedAt: Date.now()
    };
  },
  
  // Delete a document
  deleteDocument: async (id: string) => {
    // Placeholder implementation
    return true;
  },
  
  // Get all documents for a user
  getUserDocuments: async (userId: string) => {
    // In a real implementation, this would query the database
    // For now, we'll return a placeholder list
    return [
      {
        id: `doc-${Date.now()}-1`,
        title: 'Example Document 1',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: `doc-${Date.now()}-2`,
        title: 'Example Document 2',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  }
};

/**
 * @route   GET /api/documents
 * @desc    Get all documents for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: NextFunction): Promise<void> => {
  try {
    // Get all documents the user has access to
    const documents = await documentDb.getUserDocuments(req.user!.id);
    
    res.json({ documents });
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.DOCUMENT);
  }
}));

/**
 * @route   POST /api/documents
 * @desc    Create a new document
 * @access  Private
 */
router.post('/', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content } = req.body;
    
    if (!title) {
      res.status(400).json({
        error: {
          type: 'validation_error',
          message: 'Title is required',
          status: 400
        }
      });
      return;
    }
    
    // Create document
    const document = await documentDb.createDocument(
      req.user!.id,
      title,
      content || ''
    );
    
    // Log document creation
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.CREATE,
      resourceType: ResourceType.DOCUMENT,
      resourceId: document.id,
      details: JSON.stringify({ title }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({ document });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.DOCUMENT);
  }
}));

/**
 * @route   GET /api/documents/:id
 * @desc    Get a document by ID
 * @access  Private
 */
router.get('/:id', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: NextFunction): Promise<void> => {
  try {
    const documentId = req.params.id;
    
    // Check if user has access to the document
    if (!hasAccess(documentId, req.user!.id, AccessRole.VIEWER)) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'You do not have permission to access this document',
          status: 403
        }
      });
      return;
    }
    
    // Get document
    const document = await documentDb.getDocumentById(documentId);
    
    // Log document access
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.READ,
      resourceType: ResourceType.DOCUMENT,
      resourceId: documentId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ document });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.DOCUMENT, req.params.id);
  }
}));

/**
 * @route   PUT /api/documents/:id
 * @desc    Update a document
 * @access  Private
 */
router.put('/:id', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: NextFunction): Promise<void> => {
  try {
    const documentId = req.params.id;
    const { title, content } = req.body;
    
    // Check if user has edit access to the document
    if (!hasAccess(documentId, req.user!.id, AccessRole.EDITOR)) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'You do not have permission to edit this document',
          status: 403
        }
      });
      return;
    }
    
    // Update document
    const document = await documentDb.updateDocument(documentId, { title, content });
    
    // Log document update
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.UPDATE,
      resourceType: ResourceType.DOCUMENT,
      resourceId: documentId,
      details: JSON.stringify({ title }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ document });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.DOCUMENT, req.params.id);
  }
}));

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document
 * @access  Private
 */
router.delete('/:id', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: NextFunction): Promise<void> => {
  try {
    const documentId = req.params.id;
    
    // Check if user has owner access to the document
    if (!hasAccess(documentId, req.user!.id, AccessRole.OWNER)) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'Only the owner can delete this document',
          status: 403
        }
      });
      return;
    }
    
    // Delete document
    await documentDb.deleteDocument(documentId);
    
    // Log document deletion
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.DELETE,
      resourceType: ResourceType.DOCUMENT,
      resourceId: documentId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.DOCUMENT, req.params.id);
  }
}));

/**
 * @route   GET /api/documents/:id/access
 * @desc    Get users with access to a document
 * @access  Private
 */
router.get('/:id/access', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: NextFunction): Promise<void> => {
  try {
    const documentId = req.params.id;
    
    // Check if user has access to the document
    if (!hasAccess(documentId, req.user!.id, AccessRole.VIEWER)) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'You do not have permission to access this document',
          status: 403
        }
      });
      return;
    }
    
    // Get users with access
    const documentUsers = getDocumentUsers(documentId);
    
    // Fetch user details for each user ID
    const usersWithDetails = await Promise.all(
documentUsers.map(async (docUser) => {
        const userDetails = await userDb.getUserById(docUser.userId) as User | null;
        
        // Use the isUser type guard to check if userDetails is a valid User
        const safeUser = isUser(userDetails) 
            ? {
                id: userDetails.id,
                username: userDetails.username,
                email: userDetails.email
            } 
            : undefined;
        
        return {
          ...docUser,
          user: safeUser
        };
      })
    );
    
    // Log access list view
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.READ,
      resourceType: ResourceType.DOCUMENT,
      resourceId: documentId,
      details: JSON.stringify({ action: 'view_access_control' }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ users: usersWithDetails });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.DOCUMENT, req.params.id);
  }
}));

/**
 * @route   POST /api/documents/:id/access
 * @desc    Grant access to a document
 * @access  Private
 */
router.post('/:id/access', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: NextFunction): Promise<void> => {
  try {
    const documentId = req.params.id;
    const { email, role } = req.body;
    
    // Check if user is the owner of the document
    if (!hasAccess(documentId, req.user!.id, AccessRole.OWNER)) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'Only the owner can grant access',
          status: 403
        }
      });
      return;
    }
    
    if (!email || !role) {
      res.status(400).json({
        error: {
          type: 'validation_error',
          message: 'Email and role are required',
          status: 400
        }
      });
      return;
    }
    
    // Find user by email
    const targetUser = await userDb.getUserByEmail(email) as User | null;
    
    if (!targetUser) {
      res.status(404).json({
        error: {
          type: 'not_found',
          message: 'User not found',
          status: 404
        }
      });
      return;
    }
    
    // Ensure targetUser has an id property
    if (!isUser(targetUser)) {
      throw new Error('Invalid user data returned from database');
    }
    
    // Use the id from the validated user
    const success = grantAccess(documentId, targetUser.id, role as AccessRole);
    
    if (!success) {
      res.status(500).json({
        error: {
          type: 'server_error',
          message: 'Failed to grant access',
          status: 500
        }
      });
      return;
    }
    
    // Log access grant
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.GRANT_ACCESS,
      resourceType: ResourceType.DOCUMENT,
      resourceId: documentId,
      details: JSON.stringify({ targetUserId: targetUser.id, role }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.DOCUMENT, req.params.id);
  }
}));

/**
 * @route   DELETE /api/documents/:id/access/:userId
 * @desc    Revoke access to a document
 * @access  Private
 */
router.delete('/:id/access/:userId', authenticate, asyncHandler(async (req: express.Request, res: express.Response, next: NextFunction): Promise<void> => {
  try {
    const documentId = req.params.id;
    const targetUserId = req.params.userId;
    
    // Check if user is the owner of the document
    if (!hasAccess(documentId, req.user!.id, AccessRole.OWNER)) {
      res.status(403).json({
        error: {
          type: 'authorization_error',
          message: 'Only the owner can revoke access',
          status: 403
        }
      });
      return;
    }
    
    // Cannot revoke owner's access
    if (hasAccess(documentId, targetUserId, AccessRole.OWNER)) {
      res.status(400).json({
        error: {
          type: 'validation_error',
          message: "Cannot revoke the owner's access",
          status: 400
        }
      });
      return;
    }
    
    // Revoke access
    const success = revokeAccess(documentId, targetUserId);
    
    // Log access revocation
    logAuditEvent({
      userId: req.user!.id,
      action: AuditAction.REVOKE_ACCESS,
      resourceType: ResourceType.DOCUMENT,
      resourceId: documentId,
      details: JSON.stringify({ targetUserId }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success });
    return;
  } catch (error) {
    handleApiError(error, res, req.user?.id, ResourceType.DOCUMENT, req.params.id);
  }
}));

export default router;