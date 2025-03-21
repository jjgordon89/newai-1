/**
 * SQLite Database Service
 *
 * Provides a lightweight SQLite database for storing user information and API keys
 */

import type { Database } from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

let db: Database | null = null;

/**
 * Initialize the SQLite database
 */
export async function initDatabase() {
  if (db) return db;

  try {
    // Import better-sqlite3 dynamically to avoid SSR issues
    const sqlite3Module = await import("better-sqlite3");
    const sqlite3 = sqlite3Module.default;

    // Create database instance with in-memory option for browser environment
    db = new sqlite3(":memory:");

    // Create tables if they don't exist
    createTables();

    console.log("SQLite database initialized successfully");
    return db;
  } catch (error) {
    console.error("Failed to initialize SQLite database:", error);
    throw error;
  }
}

/**
 * Create database tables
 */
function createTables() {
  if (!db) throw new Error("Database not initialized");

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_login INTEGER
    )
  `);

  // API Keys table
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      service TEXT NOT NULL,
      api_key TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_used INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE (user_id, service)
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
}

/**
 * User-related database operations
 */
export const userDb = {
  /**
   * Create a new user
   */
  createUser: async (username: string, email: string, password: string) => {
    if (!db) await initDatabase();

    const now = Date.now();
    const userId = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);

    try {
      if (!db) throw new Error("Database not initialized");
      const stmt = db.prepare(`
        INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(userId, username, email.toLowerCase(), passwordHash, now, now);
      return { id: userId, username, email, createdAt: now };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string) => {
    if (!db) await initDatabase();

    try {
      if (!db) throw new Error("Database not initialized");
      const stmt = db.prepare(`
        SELECT id, username, email, created_at as createdAt, updated_at as updatedAt, last_login as lastLogin
        FROM users
        WHERE id = ?
      `);

      return stmt.get(id) || null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  },

  /**
   * Get user by email
   */
  getUserByEmail: async (email: string) => {
    if (!db) await initDatabase();

    try {
      if (!db) throw new Error("Database not initialized");
      const stmt = db.prepare(`
        SELECT id, username, email, password_hash as passwordHash, created_at as createdAt, updated_at as updatedAt
        FROM users
        WHERE email = ?
      `);

      return stmt.get(email.toLowerCase()) || null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  },

  /**
   * Authenticate user
   */
  authenticateUser: async (email: string, password: string) => {
    if (!db) await initDatabase();

    try {
      const user = await userDb.getUserByEmail(email);

      if (!user) return null;

      const passwordMatch = bcrypt.compareSync(password, user.passwordHash);

      if (!passwordMatch) return null;

      // Update last login time
      const now = Date.now();
      if (!db) throw new Error("Database not initialized");
      const updateStmt = db.prepare(`
        UPDATE users
        SET last_login = ?, updated_at = ?
        WHERE id = ?
      `);

      updateStmt.run(now, now, user.id);

      // Remove password hash from returned user object
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error("Error authenticating user:", error);
      throw error;
    }
  },

  /**
   * Create a new session for a user
   */
  createSession: async (userId: string, expiresInHours = 24) => {
    if (!db) await initDatabase();

    const now = Date.now();
    const expiresAt = now + expiresInHours * 60 * 60 * 1000;
    const sessionId = uuidv4();
    const token = uuidv4();

    try {
      if (!db) throw new Error("Database not initialized");
      const stmt = db.prepare(`
        INSERT INTO sessions (id, user_id, token, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(sessionId, userId, token, expiresAt, now);
      return { id: sessionId, token, expiresAt };
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  },

  /**
   * Get session by token
   */
  getSessionByToken: async (token: string) => {
    if (!db) await initDatabase();

    try {
      if (!db) throw new Error("Database not initialized");
      const stmt = db.prepare(`
        SELECT id, user_id as userId, token, expires_at as expiresAt, created_at as createdAt
        FROM sessions
        WHERE token = ? AND expires_at > ?
      `);

      return stmt.get(token, Date.now()) || null;
    } catch (error) {
      console.error("Error getting session by token:", error);
      throw error;
    }
  },

  /**
   * Delete session
   */
  deleteSession: async (token: string) => {
    if (!db) await initDatabase();

    try {
      if (!db) throw new Error("Database not initialized");
      const stmt = db.prepare(`
        DELETE FROM sessions
        WHERE token = ?
      `);

      const result = stmt.run(token);
      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  },

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions: async () => {
    if (!db) await initDatabase();

    try {
      if (!db) throw new Error("Database not initialized");
      const stmt = db.prepare(`
        DELETE FROM sessions
        WHERE expires_at <= ?
      `);

      const result = stmt.run(Date.now());
      return result.changes;
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      throw error;
    }
  },
};

/**
 * API Key-related database operations
 */
export const apiKeyDb = {
  /**
   * Save an API key for a user
   */
  saveApiKey: async (userId: string, service: string, apiKey: string) => {
    if (!db) await initDatabase();

    const now = Date.now();
    const id = uuidv4();

    try {
      // Check if key already exists for this user and service
      const existingKey = await apiKeyDb.getApiKey(userId, service);

      if (existingKey) {
        // Update existing key
        if (!db) throw new Error("Database not initialized");
        const updateStmt = db.prepare(`
          UPDATE api_keys
          SET api_key = ?, updated_at = ?
          WHERE user_id = ? AND service = ?
        `);

        updateStmt.run(apiKey, now, userId, service);
        return { id: existingKey.id, userId, service, updatedAt: now };
      } else {
        // Insert new key
        if (!db) throw new Error("Database not initialized");
        const insertStmt = db.prepare(`
          INSERT INTO api_keys (id, user_id, service, api_key, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        insertStmt.run(id, userId, service, apiKey, now, now);
        return { id, userId, service, createdAt: now, updatedAt: now };
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      throw error;
    }
  },

  /**
   * Get an API key for a user and service
   */
  getApiKey: async (userId: string, service: string) => {
    if (!db) await initDatabase();

    try {
      if (!db) throw new Error("Database not initialized");
      const stmt = db.prepare(`
        SELECT id, user_id as userId, service, api_key as apiKey, created_at as createdAt, updated_at as updatedAt, last_used as lastUsed
        FROM api_keys
        WHERE user_id = ? AND service = ?
      `);

      return stmt.get(userId, service) || null;
    } catch (error) {
      console.error("Error getting API key:", error);
      throw error;
    }
  },

  /**
   * Get all API keys for a user
   */
  getUserApiKeys: async (userId: string) => {
    if (!db) await initDatabase();

    try {
      if (!db) throw new Error("Database not initialized");
      const stmt = db.prepare(`
        SELECT id, user_id as userId, service, created_at as createdAt, updated_at as updatedAt, last_used as lastUsed
        FROM api_keys
        WHERE user_id = ?
      `);

      return stmt.all(userId) || [];
    } catch (error) {
      console.error("Error getting user API keys:", error);
      throw error;
    }
  },

  /**
   * Delete an API key
   */
  deleteApiKey: async (userId: string, service: string) => {
    if (!db) await initDatabase();

    try {
      if (!db) throw new Error("Database not initialized");
      const stmt = db.prepare(`
        DELETE FROM api_keys
        WHERE user_id = ? AND service = ?
      `);

      const result = stmt.run(userId, service);
      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting API key:", error);
      throw error;
    }
  },

  /**
   * Update last used timestamp for an API key
   */
  updateApiKeyUsage: async (userId: string, service: string) => {
    if (!db) await initDatabase();

    try {
      if (!db) throw new Error("Database not initialized");
      const stmt = db.prepare(`
        UPDATE api_keys
        SET last_used = ?
        WHERE user_id = ? AND service = ?
      `);

      const result = stmt.run(Date.now(), userId, service);
      return result.changes > 0;
    } catch (error) {
      console.error("Error updating API key usage:", error);
      throw error;
    }
  },
};

/**
 * Close the database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log("SQLite database connection closed");
  }
}

export default {
  initDatabase,
  closeDatabase,
  userDb,
  apiKeyDb,
};
