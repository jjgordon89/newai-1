/**
 * API Key Management System
 * Centralized system for storing, retrieving, and validating API keys for various providers
 */

import { useToast } from "@/hooks/use-toast";
import { apiKeyDb } from "./db/sqlite";

// Define supported API providers
export type ApiProvider =
  | "hugging face"
  | "openai"
  | "anthropic"
  | "google"
  | "mistral"
  | "ollama"
  | "openrouter"
  | "brave"
  | "serp"
  | "duckduckgo"
  | "weather"
  | "custom";

// Interface for API key validation results
export interface ApiKeyValidationResult {
  isValid: boolean;
  message?: string;
  provider: ApiProvider;
  timestamp: Date;
}

// Interface for API key metadata
export interface ApiKeyMetadata {
  provider: ApiProvider;
  lastValidated?: Date;
  isValid?: boolean;
  usageCount?: number;
  lastUsed?: Date;
  label?: string;
}

/**
 * API Key Manager Class
 * Provides methods for managing API keys across different providers
 */
export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private apiKeys: Map<ApiProvider, string> = new Map();
  private metadata: Map<ApiProvider, ApiKeyMetadata> = new Map();
  private currentUserId: string | null = null;

  // Private constructor for singleton pattern
  private constructor() {
    this.loadKeysFromStorage();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  /**
   * Set the current user ID
   */
  public setCurrentUserId(userId: string | null): void {
    this.currentUserId = userId;
    if (userId) {
      this.loadKeysFromDatabase(userId);
    } else {
      this.apiKeys.clear();
      this.metadata.clear();
    }
  }

  /**
   * Load API keys from localStorage (for backward compatibility)
   */
  private loadKeysFromStorage(): void {
    try {
      // Load API keys
      const savedKeys = localStorage.getItem("api_keys");
      if (savedKeys) {
        const parsedKeys = JSON.parse(savedKeys);
        Object.entries(parsedKeys).forEach(([provider, key]) => {
          this.apiKeys.set(provider as ApiProvider, key as string);
        });
      }

      // Load metadata
      const savedMetadata = localStorage.getItem("api_keys_metadata");
      if (savedMetadata) {
        const parsedMetadata = JSON.parse(savedMetadata);
        Object.entries(parsedMetadata).forEach(([provider, meta]) => {
          this.metadata.set(provider as ApiProvider, {
            ...(meta as ApiKeyMetadata),
            lastValidated: meta.lastValidated
              ? new Date(meta.lastValidated)
              : undefined,
            lastUsed: meta.lastUsed ? new Date(meta.lastUsed) : undefined,
          });
        });
      }
    } catch (error) {
      console.error("Error loading API keys from storage:", error);
    }
  }

  /**
   * Load API keys from database for a specific user
   */
  private async loadKeysFromDatabase(userId: string): Promise<void> {
    try {
      const userKeys = await apiKeyDb.getUserApiKeys(userId);

      // Clear existing keys
      this.apiKeys.clear();
      this.metadata.clear();

      // Load keys from database
      userKeys.forEach((key) => {
        this.apiKeys.set(key.service as ApiProvider, key.apiKey);
        this.metadata.set(key.service as ApiProvider, {
          provider: key.service as ApiProvider,
          lastUsed: key.lastUsed ? new Date(key.lastUsed) : undefined,
          usageCount: 0, // We don't track this in the database yet
        });
      });
    } catch (error) {
      console.error("Error loading API keys from database:", error);
    }
  }

  /**
   * Save API keys to localStorage (for backward compatibility)
   */
  private saveKeysToStorage(): void {
    try {
      // Save API keys
      const keysObject: Record<string, string> = {};
      this.apiKeys.forEach((value, key) => {
        keysObject[key] = value;
      });
      localStorage.setItem("api_keys", JSON.stringify(keysObject));

      // Save metadata
      const metadataObject: Record<string, ApiKeyMetadata> = {};
      this.metadata.forEach((value, key) => {
        metadataObject[key] = value;
      });
      localStorage.setItem("api_keys_metadata", JSON.stringify(metadataObject));
    } catch (error) {
      console.error("Error saving API keys to storage:", error);
    }
  }

  /**
   * Set an API key for a provider
   * @param provider The API provider
   * @param key The API key
   * @param metadata Optional metadata for the key
   * @returns True if successful
   */
  public async setApiKey(
    provider: ApiProvider,
    key: string,
    metadata?: Partial<ApiKeyMetadata>,
  ): Promise<boolean> {
    try {
      // Store in memory
      if (key) {
        this.apiKeys.set(provider, key);

        // Update or create metadata
        const existingMetadata = this.metadata.get(provider) || { provider };
        this.metadata.set(provider, {
          ...existingMetadata,
          ...metadata,
          provider,
        });

        // Save to storage for backward compatibility
        this.saveKeysToStorage();

        // Save to database if user is logged in
        if (this.currentUserId) {
          await apiKeyDb.saveApiKey(this.currentUserId, provider, key);
        }

        return true;
      } else {
        // Remove the key if empty string is provided
        return await this.removeApiKey(provider);
      }
    } catch (error) {
      console.error(`Error setting API key for ${provider}:`, error);
      return false;
    }
  }

  /**
   * Get an API key for a provider
   * @param provider The API provider
   * @returns The API key or null if not found
   */
  public getApiKey(provider: ApiProvider): string | null {
    const key = this.apiKeys.get(provider);

    // Update usage metadata
    if (key) {
      const meta = this.metadata.get(provider) || { provider };
      this.metadata.set(provider, {
        ...meta,
        usageCount: (meta.usageCount || 0) + 1,
        lastUsed: new Date(),
      });
      this.saveKeysToStorage();

      // Update usage in database if user is logged in
      if (this.currentUserId) {
        apiKeyDb.updateApiKeyUsage(this.currentUserId, provider);
      }
    }

    return key || null;
  }

  /**
   * Remove an API key
   * @param provider The API provider
   * @returns True if successful
   */
  public async removeApiKey(provider: ApiProvider): Promise<boolean> {
    try {
      this.apiKeys.delete(provider);
      this.metadata.delete(provider);
      this.saveKeysToStorage();

      // Remove from database if user is logged in
      if (this.currentUserId) {
        await apiKeyDb.deleteApiKey(this.currentUserId, provider);
      }

      return true;
    } catch (error) {
      console.error(`Error removing API key for ${provider}:`, error);
      return false;
    }
  }

  /**
   * Check if an API key exists for a provider
   * @param provider The API provider
   * @returns True if the key exists
   */
  public hasApiKey(provider: ApiProvider): boolean {
    return this.apiKeys.has(provider) && !!this.apiKeys.get(provider);
  }

  /**
   * Get all available API providers with keys
   * @returns Array of providers that have keys set
   */
  public getAvailableProviders(): ApiProvider[] {
    return Array.from(this.apiKeys.keys()).filter(
      (provider) => !!this.apiKeys.get(provider),
    );
  }

  /**
   * Update metadata for an API key
   * @param provider The API provider
   * @param metadata The metadata to update
   * @returns True if successful
   */
  public updateMetadata(
    provider: ApiProvider,
    metadata: Partial<ApiKeyMetadata>,
  ): boolean {
    try {
      const existingMetadata = this.metadata.get(provider) || { provider };
      this.metadata.set(provider, {
        ...existingMetadata,
        ...metadata,
      });
      this.saveKeysToStorage();
      return true;
    } catch (error) {
      console.error(`Error updating metadata for ${provider}:`, error);
      return false;
    }
  }

  /**
   * Get metadata for an API key
   * @param provider The API provider
   * @returns The metadata or null if not found
   */
  public getMetadata(provider: ApiProvider): ApiKeyMetadata | null {
    return this.metadata.get(provider) || null;
  }

  /**
   * Clear all API keys
   * @returns True if successful
   */
  public async clearAllKeys(): Promise<boolean> {
    try {
      this.apiKeys.clear();
      this.metadata.clear();
      localStorage.removeItem("api_keys");
      localStorage.removeItem("api_keys_metadata");

      // Clear from database if user is logged in
      if (this.currentUserId) {
        const providers = await apiKeyDb.getUserApiKeys(this.currentUserId);
        for (const provider of providers) {
          await apiKeyDb.deleteApiKey(this.currentUserId, provider.service);
        }
      }

      return true;
    } catch (error) {
      console.error("Error clearing API keys:", error);
      return false;
    }
  }
}

/**
 * React hook for using the API Key Manager
 * @returns API Key Manager methods
 */
export function useApiKeyManager() {
  const manager = ApiKeyManager.getInstance();
  const { toast } = useToast();

  return {
    setApiKey: async (
      provider: ApiProvider,
      key: string,
      metadata?: Partial<ApiKeyMetadata>,
    ): Promise<boolean> => {
      const result = await manager.setApiKey(provider, key, metadata);
      if (result) {
        if (key) {
          toast({
            title: "API Key Saved",
            description: `${provider} API key has been saved successfully`,
          });
        } else {
          toast({
            title: "API Key Removed",
            description: `${provider} API key has been removed`,
          });
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to save ${provider} API key`,
          variant: "destructive",
        });
      }
      return result;
    },
    getApiKey: (provider: ApiProvider): string | null =>
      manager.getApiKey(provider),
    removeApiKey: async (provider: ApiProvider): Promise<boolean> => {
      const result = await manager.removeApiKey(provider);
      if (result) {
        toast({
          title: "API Key Removed",
          description: `${provider} API key has been removed`,
        });
      }
      return result;
    },
    hasApiKey: (provider: ApiProvider): boolean => manager.hasApiKey(provider),
    getAvailableProviders: (): ApiProvider[] => manager.getAvailableProviders(),
    updateMetadata: (
      provider: ApiProvider,
      metadata: Partial<ApiKeyMetadata>,
    ): boolean => manager.updateMetadata(provider, metadata),
    getMetadata: (provider: ApiProvider): ApiKeyMetadata | null =>
      manager.getMetadata(provider),
    clearAllKeys: async (): Promise<boolean> => {
      const result = await manager.clearAllKeys();
      if (result) {
        toast({
          title: "All API Keys Cleared",
          description: "All API keys have been removed",
        });
      }
      return result;
    },
    setCurrentUserId: (userId: string | null): void => {
      manager.setCurrentUserId(userId);
    },
  };
}

// Export a singleton instance
export const apiKeyManager = ApiKeyManager.getInstance();
