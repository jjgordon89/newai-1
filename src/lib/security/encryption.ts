/**
 * Encryption Service
 *
 * Provides encryption and decryption functionality for sensitive data
 */

import crypto from "crypto";

// Environment variables for encryption (should be set in production)
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "default-encryption-key-32-characters";
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || "default-iv-16chr";

// Encryption algorithm
const ALGORITHM = "aes-256-cbc";

/**
 * Encrypt sensitive data
 * @param data Data to encrypt
 * @returns Encrypted data as a string
 */
export function encrypt(data: string): string {
  try {
    // Create a buffer from the encryption key and IV
    const key = Buffer.from(ENCRYPTION_KEY);
    const iv = Buffer.from(ENCRYPTION_IV);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the data
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    return encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt encrypted data
 * @param encryptedData Encrypted data as a string
 * @returns Decrypted data
 */
export function decrypt(encryptedData: string): string {
  try {
    // Create a buffer from the encryption key and IV
    const key = Buffer.from(ENCRYPTION_KEY);
    const iv = Buffer.from(ENCRYPTION_IV);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    // Decrypt the data
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Hash data (one-way, for passwords etc.)
 * @param data Data to hash
 * @param salt Optional salt (will be generated if not provided)
 * @returns Hashed data and salt
 */
export function hashData(
  data: string,
  salt?: string,
): { hash: string; salt: string } {
  try {
    // Generate salt if not provided
    const useSalt = salt || crypto.randomBytes(16).toString("hex");

    // Create hash
    const hash = crypto
      .pbkdf2Sync(data, useSalt, 10000, 64, "sha512")
      .toString("hex");

    return { hash, salt: useSalt };
  } catch (error) {
    console.error("Hashing error:", error);
    throw new Error("Failed to hash data");
  }
}

/**
 * Verify hashed data
 * @param data Data to verify
 * @param hash Hash to compare against
 * @param salt Salt used for hashing
 * @returns True if data matches hash
 */
export function verifyHash(data: string, hash: string, salt: string): boolean {
  try {
    const { hash: newHash } = hashData(data, salt);
    return newHash === hash;
  } catch (error) {
    console.error("Hash verification error:", error);
    return false;
  }
}

/**
 * Generate a secure random token
 * @param length Length of the token
 * @returns Random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export default {
  encrypt,
  decrypt,
  hashData,
  verifyHash,
  generateToken,
};
