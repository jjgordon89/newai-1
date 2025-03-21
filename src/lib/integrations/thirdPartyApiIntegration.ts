/**
 * Third-Party API Integration Service
 *
 * Provides integration with various third-party APIs and services.
 */

export interface ApiConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  authType?: "none" | "apiKey" | "bearer" | "basic" | "oauth2";
  headers?: Record<string, string>;
  defaultParams?: Record<string, string>;
}

export interface ApiRequestOptions {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

export class ThirdPartyApiIntegration {
  private apis: Map<string, ApiConfig> = new Map();

  /**
   * Register a new API configuration
   */
  registerApi(id: string, config: ApiConfig): void {
    this.apis.set(id, config);
    console.log(`Registered API: ${config.name} (${id})`);
  }

  /**
   * Remove an API configuration
   */
  removeApi(id: string): boolean {
    return this.apis.delete(id);
  }

  /**
   * Get all registered APIs
   */
  getApis(): Array<{ id: string; name: string }> {
    return Array.from(this.apis.entries()).map(([id, config]) => ({
      id,
      name: config.name,
    }));
  }

  /**
   * Make a request to a third-party API
   */
  async request(apiId: string, options: ApiRequestOptions): Promise<any> {
    if (!this.apis.has(apiId)) {
      throw new Error(`API not found: ${apiId}`);
    }

    const apiConfig = this.apis.get(apiId)!;
    const url = new URL(options.endpoint, apiConfig.baseUrl);

    // Add default params from API config
    if (apiConfig.defaultParams) {
      Object.entries(apiConfig.defaultParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Add request-specific params
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    // Prepare headers
    const headers: Record<string, string> = {
      ...apiConfig.headers,
      ...options.headers,
    };

    // Add authentication
    if (apiConfig.authType === "apiKey" && apiConfig.apiKey) {
      headers["X-API-Key"] = apiConfig.apiKey;
    } else if (apiConfig.authType === "bearer" && apiConfig.apiKey) {
      headers["Authorization"] = `Bearer ${apiConfig.apiKey}`;
    }

    try {
      const response = await fetch(url.toString(), {
        method: options.method || "GET",
        headers,
        body: options.data ? JSON.stringify(options.data) : undefined,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error making request to ${apiConfig.name}:`, error);
      throw new Error(
        `API request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

// Create a singleton instance
const thirdPartyApiIntegration = new ThirdPartyApiIntegration();
export default thirdPartyApiIntegration;
