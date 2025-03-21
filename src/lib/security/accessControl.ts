/**
 * Access Control Service
 *
 * Provides document access control functionality
 */

import { userDb } from "../db/sqlite";
import { initDatabase } from "../db/sqlite";
import crypto from "crypto";

// Initialize database
const db = initDatabase();

// Create access control tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS document_permissions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    user_id TEXT,
    role TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(document_id, user_id)
  )
`);

// Access roles
export enum AccessRole {
  OWNER = "owner",
  EDITOR = "editor",
  VIEWER = "viewer",
  NONE = "none",
}

// Document permission interface
export interface DocumentPermission {
  id: string;
  documentId: string;
  userId?: string;
  role: AccessRole;
  createdAt: number;
  updatedAt: number;
}

/**
 * Grant access to a document for a user
 * @param documentId Document ID
 * @param userId User ID
 * @param role Access role
 * @returns True if successful
 */
export function grantAccess(
  documentId: string,
  userId: string,
  role: AccessRole,
): boolean {
  try {
    const now = Date.now();

    // Check if permission already exists
    const existingPermission = getPermission(documentId, userId);

    if (existingPermission) {
      // Update existing permission
      const stmt = db.prepare(`
        UPDATE document_permissions
        SET role = ?, updated_at = ?
        WHERE document_id = ? AND user_id = ?
      `);

      stmt.run(role, now, documentId, userId);
    } else {
      // Create new permission
      const stmt = db.prepare(`
        INSERT INTO document_permissions (id, document_id, user_id, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const id = crypto.randomUUID();
      stmt.run(id, documentId, userId, role, now, now);
    }

    return true;
  } catch (error) {
    console.error("Error granting access:", error);
    return false;
  }
}

/**
 * Revoke access to a document for a user
 * @param documentId Document ID
 * @param userId User ID
 * @returns True if successful
 */
export function revokeAccess(documentId: string, userId: string): boolean {
  try {
    const stmt = db.prepare(`
      DELETE FROM document_permissions
      WHERE document_id = ? AND user_id = ?
    `);

    const result = stmt.run(documentId, userId);
    return result.changes > 0;
  } catch (error) {
    console.error("Error revoking access:", error);
    return false;
  }
}

/**
 * Get a user's permission for a document
 * @param documentId Document ID
 * @param userId User ID
 * @returns Permission or null if not found
 */
export function getPermission(
  documentId: string,
  userId: string,
): DocumentPermission | null {
  try {
    const stmt = db.prepare(`
      SELECT id, document_id as documentId, user_id as userId, role, created_at as createdAt, updated_at as updatedAt
      FROM document_permissions
      WHERE document_id = ? AND user_id = ?
    `);

    return stmt.get(documentId, userId) || null;
  } catch (error) {
    console.error("Error getting permission:", error);
    return null;
  }
}

/**
 * Check if a user has access to a document
 * @param documentId Document ID
 * @param userId User ID
 * @param requiredRole Minimum required role
 * @returns True if user has required access
 */
export function hasAccess(
  documentId: string,
  userId: string,
  requiredRole: AccessRole,
): boolean {
  try {
    const permission = getPermission(documentId, userId);

    if (!permission) return false;

    // Role hierarchy: OWNER > EDITOR > VIEWER > NONE
    const roleValues = {
      [AccessRole.OWNER]: 3,
      [AccessRole.EDITOR]: 2,
      [AccessRole.VIEWER]: 1,
      [AccessRole.NONE]: 0,
    };

    return roleValues[permission.role] >= roleValues[requiredRole];
  } catch (error) {
    console.error("Error checking access:", error);
    return false;
  }
}

/**
 * Get all users with access to a document
 * @param documentId Document ID
 * @returns Array of user IDs and their roles
 */
export function getDocumentUsers(
  documentId: string,
): Array<{ userId: string; role: AccessRole }> {
  try {
    const stmt = db.prepare(`
      SELECT user_id as userId, role
      FROM document_permissions
      WHERE document_id = ?
    `);

    return stmt.all(documentId) || [];
  } catch (error) {
    console.error("Error getting document users:", error);
    return [];
  }
}

/**
 * Get all documents a user has access to
 * @param userId User ID
 * @param role Optional role filter
 * @returns Array of document IDs
 */
export function getUserDocuments(userId: string, role?: AccessRole): string[] {
  try {
    let query = `
      SELECT document_id as documentId
      FROM document_permissions
      WHERE user_id = ?
    `;

    const params = [userId];

    if (role) {
      query += ` AND role = ?`;
      params.push(role);
    }

    const stmt = db.prepare(query);
    const results = stmt.all(...params);

    return results.map((result) => result.documentId);
  } catch (error) {
    console.error("Error getting user documents:", error);
    return [];
  }
}

export default {
  AccessRole,
  grantAccess,
  revokeAccess,
  getPermission,
  hasAccess,
  getDocumentUsers,
  getUserDocuments,
};
