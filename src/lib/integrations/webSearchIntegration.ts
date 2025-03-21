/**
 * Web Search Integration Service
 *
 * Provides integration with various web search APIs to retrieve information from the internet.
 */

import { webSearchService } from "../webSearchService";

export interface WebSearchOptions {
  query: string;
  limit?: number;
  safeSearch?: boolean;
  provider?: "brave" | "google" | "duckduckgo" | "serp";
  region?: string;
  language?: string;
  timeframe?: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  timestamp: string;
  provider: string;
}

export class WebSearchIntegration {
  private apiKeys: Record<string, string> = {};
  private defaultProvider: string = "brave";

  /**
   * Set API key for a specific provider
   */
  setApiKey(provider: string, apiKey: string): void {
    this.apiKeys[provider] = apiKey;
  }

  /**
   * Set the default search provider
   */
  setDefaultProvider(provider: string): void {
    this.defaultProvider = provider;
  }

  /**
   * Search the web using the specified provider
   */
  async search(options: WebSearchOptions): Promise<WebSearchResult[]> {
    const provider = options.provider || this.defaultProvider;
    const apiKey = this.apiKeys[provider];

    if (!apiKey) {
      throw new Error(`API key not set for provider: ${provider}`);
    }

    try {
      // Use the existing webSearchService with the appropriate provider
      const results = await webSearchService.search({
        query: options.query,
        provider: provider as any,
        limit: options.limit || 10,
        safeSearch: options.safeSearch !== false,
        region: options.region,
        language: options.language,
        timeframe: options.timeframe,
      });

      return results.map((result) => ({
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        source: result.source || provider,
        timestamp: new Date().toISOString(),
        provider: provider,
      }));
    } catch (error) {
      console.error(`Error searching with ${provider}:`, error);
      throw new Error(
        `Web search failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Check if a provider is configured with an API key
   */
  isProviderConfigured(provider: string): boolean {
    return !!this.apiKeys[provider];
  }

  /**
   * Get all configured providers
   */
  getConfiguredProviders(): string[] {
    return Object.keys(this.apiKeys);
  }
}

// Create a singleton instance
const webSearchIntegration = new WebSearchIntegration();
export default webSearchIntegration;
