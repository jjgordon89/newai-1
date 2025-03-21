/**
 * Secure Database Service
 *
 * Extends the SQLite database with encryption for sensitive data
 */

import { initDatabase } from "./sqlite";
import { encrypt, decrypt } from "../security/encryption";
import crypto from "crypto";

// Initialize database
const db = initDatabase();

// Create secure data table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS secure_data (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data_type TEXT NOT NULL,
    encrypted_data TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    metadata TEXT,
    UNIQUE(user_id, data_type)
  )
`);

/**
 * Store encrypted data
 * @param userId User ID
 * @param dataType Type of data (e.g., 'api_key', 'personal_info')
 * @param data Data to encrypt and store
 * @param metadata Optional metadata (not encrypted)
 * @returns True if successful
 */
export function storeSecureData(
  userId: string,
  dataType: string,
  data: string,
  metadata?: Record<string, any>,
): boolean {
  try {
    const now = Date.now();
    const encryptedData = encrypt(data);

    // Check if data already exists
    const existingData = getSecureData(userId, dataType);

    if (existingData) {
      // Update existing data
      const stmt = db.prepare(`
        UPDATE secure_data
        SET encrypted_data = ?, updated_at = ?, metadata = ?
        WHERE user_id = ? AND data_type = ?
      `);

      stmt.run(
        encryptedData,
        now,
        metadata ? JSON.stringify(metadata) : null,
        userId,
        dataType,
      );
    } else {
      // Insert new data
      const stmt = db.prepare(`
        INSERT INTO secure_data (id, user_id, data_type, encrypted_data, created_at, updated_at, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const id = crypto.randomUUID();
      stmt.run(
        id,
        userId,
        dataType,
        encryptedData,
        now,
        now,
        metadata ? JSON.stringify(metadata) : null,
      );
    }

    return true;
  } catch (error) {
    console.error("Error storing secure data:", error);
    return false;
  }
}

/**
 * Retrieve and decrypt data
 * @param userId User ID
 * @param dataType Type of data
 * @returns Decrypted data or null if not found
 */
export function getSecureData(
  userId: string,
  dataType: string,
): { data: string; metadata?: any } | null {
  try {
    const stmt = db.prepare(`
      SELECT encrypted_data, metadata
      FROM secure_data
      WHERE user_id = ? AND data_type = ?
    `);

    const result = stmt.get(userId, dataType);

    if (!result) return null;

    const decryptedData = decrypt(result.encrypted_data);
    const metadata = result.metadata ? JSON.parse(result.metadata) : undefined;

    return { data: decryptedData, metadata };
  } catch (error) {
    console.error("Error getting secure data:", error);
    return null;
  }
}

/**
 * Delete secure data
 * @param userId User ID
 * @param dataType Type of data
 * @returns True if successful
 */
export function deleteSecureData(userId: string, dataType: string): boolean {
  try {
    const stmt = db.prepare(`
      DELETE FROM secure_data
      WHERE user_id = ? AND data_type = ?
    `);

    const result = stmt.run(userId, dataType);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting secure data:", error);
    return false;
  }
}

/**
 * Get all secure data types for a user
 * @param userId User ID
 * @returns Array of data types
 */
export function getUserSecureDataTypes(userId: string): string[] {
  try {
    const stmt = db.prepare(`
      SELECT data_type
      FROM secure_data
      WHERE user_id = ?
    `);

    const results = stmt.all(userId);
    return results.map((result) => result.data_type);
  } catch (error) {
    console.error("Error getting user secure data types:", error);
    return [];
  }
}

export default {
  storeSecureData,
  getSecureData,
  deleteSecureData,
  getUserSecureDataTypes,
};
