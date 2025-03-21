/**
 * Audit Logging Service
 *
 * Provides audit logging functionality for security and compliance
 */

import { initDatabase } from "../db/sqlite";
import crypto from "crypto";

// Initialize database
const db = initDatabase();

// Create audit log table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    user_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT
  )
`);

// Audit log event types
export enum AuditAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  LOGIN = "login",
  LOGOUT = "logout",
  REGISTER = "register",
  GRANT_ACCESS = "grant_access",
  REVOKE_ACCESS = "revoke_access",
  EXPORT = "export",
  IMPORT = "import",
  API_KEY_CREATE = "api_key_create",
  API_KEY_DELETE = "api_key_delete",
  API_KEY_USE = "api_key_use",
}

// Resource types
export enum ResourceType {
  USER = "user",
  DOCUMENT = "document",
  API_KEY = "api_key",
  KNOWLEDGE_BASE = "knowledge_base",
  SYSTEM = "system",
}

// Audit log entry interface
export interface AuditLogEntry {
  id: string;
  timestamp: number;
  userId?: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 * @param entry Audit log entry
 * @returns True if successful
 */
export function logAuditEvent(
  entry: Omit<AuditLogEntry, "id" | "timestamp">,
): boolean {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, action, resource_type, resource_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const id = crypto.randomUUID();
    const timestamp = Date.now();

    stmt.run(
      id,
      timestamp,
      entry.userId || null,
      entry.action,
      entry.resourceType,
      entry.resourceId || null,
      entry.details ? JSON.stringify(entry.details) : null,
      entry.ipAddress || null,
      entry.userAgent || null,
    );

    return true;
  } catch (error) {
    console.error("Error logging audit event:", error);
    return false;
  }
}

/**
 * Get audit logs
 * @param filters Optional filters
 * @param limit Maximum number of logs to return
 * @param offset Offset for pagination
 * @returns Array of audit log entries
 */
export function getAuditLogs(
  filters?: {
    userId?: string;
    action?: AuditAction;
    resourceType?: ResourceType;
    resourceId?: string;
    startTime?: number;
    endTime?: number;
  },
  limit: number = 100,
  offset: number = 0,
): AuditLogEntry[] {
  try {
    let query = `
      SELECT id, timestamp, user_id as userId, action, resource_type as resourceType, 
             resource_id as resourceId, details, ip_address as ipAddress, user_agent as userAgent
      FROM audit_logs
      WHERE 1=1
    `;

    const params: any[] = [];

    // Add filters
    if (filters) {
      if (filters.userId) {
        query += ` AND user_id = ?`;
        params.push(filters.userId);
      }

      if (filters.action) {
        query += ` AND action = ?`;
        params.push(filters.action);
      }

      if (filters.resourceType) {
        query += ` AND resource_type = ?`;
        params.push(filters.resourceType);
      }

      if (filters.resourceId) {
        query += ` AND resource_id = ?`;
        params.push(filters.resourceId);
      }

      if (filters.startTime) {
        query += ` AND timestamp >= ?`;
        params.push(filters.startTime);
      }

      if (filters.endTime) {
        query += ` AND timestamp <= ?`;
        params.push(filters.endTime);
      }
    }

    // Add order, limit and offset
    query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const results = stmt.all(...params);

    // Parse details JSON
    return results.map((result) => ({
      ...result,
      details: result.details ? JSON.parse(result.details) : undefined,
    }));
  } catch (error) {
    console.error("Error getting audit logs:", error);
    return [];
  }
}

/**
 * Get count of audit logs matching filters
 * @param filters Optional filters
 * @returns Count of matching logs
 */
export function getAuditLogsCount(filters?: {
  userId?: string;
  action?: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  startTime?: number;
  endTime?: number;
}): number {
  try {
    let query = `
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE 1=1
    `;

    const params: any[] = [];

    // Add filters
    if (filters) {
      if (filters.userId) {
        query += ` AND user_id = ?`;
        params.push(filters.userId);
      }

      if (filters.action) {
        query += ` AND action = ?`;
        params.push(filters.action);
      }

      if (filters.resourceType) {
        query += ` AND resource_type = ?`;
        params.push(filters.resourceType);
      }

      if (filters.resourceId) {
        query += ` AND resource_id = ?`;
        params.push(filters.resourceId);
      }

      if (filters.startTime) {
        query += ` AND timestamp >= ?`;
        params.push(filters.startTime);
      }

      if (filters.endTime) {
        query += ` AND timestamp <= ?`;
        params.push(filters.endTime);
      }
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params);

    return result?.count || 0;
  } catch (error) {
    console.error("Error getting audit logs count:", error);
    return 0;
  }
}

/**
 * Clear audit logs (for testing or data retention policies)
 * @param olderThan Optional timestamp to delete logs older than
 * @returns Number of logs deleted
 */
export function clearAuditLogs(olderThan?: number): number {
  try {
    let query = `DELETE FROM audit_logs`;
    const params: any[] = [];

    if (olderThan) {
      query += ` WHERE timestamp < ?`;
      params.push(olderThan);
    }

    const stmt = db.prepare(query);
    const result = stmt.run(...params);

    return result.changes;
  } catch (error) {
    console.error("Error clearing audit logs:", error);
    return 0;
  }
}

export default {
  AuditAction,
  ResourceType,
  logAuditEvent,
  getAuditLogs,
  getAuditLogsCount,
  clearAuditLogs,
};
