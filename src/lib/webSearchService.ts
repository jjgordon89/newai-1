/**
 * Web search service for RAG integration
 * This is a simplified implementation for demonstration purposes
 */

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  source: string;
  publishedDate?: string;
}

export interface WebSearchOptions {
  timeRange?: "day" | "week" | "month" | "year";
  pageSize?: number;
  safeSearch?: "off" | "moderate" | "strict";
  market?: string;
}

/**
 * Configure web search service with API keys and default options
 * @param options Configuration options
 */
export function configureWebSearch(options: {
  serpApiKey?: string;
  googleApiKey?: string;
  duckDuckGoApiKey?: string;
  defaultOptions?: WebSearchOptions;
}): any {
  console.log("Configuring web search service with options:", options);

  return {
    /**
     * Perform a web search query
     * @param query Search query
     * @param options Search options
     * @returns Search results
     */
    search: async (
      query: string,
      options?: WebSearchOptions,
    ): Promise<SearchResult[]> => {
      console.log(`Searching for: "${query}" with options:`, options);

      // This is a mock implementation - in a real app, this would call an actual search API
      const mockResults: SearchResult[] = [
        {
          url: "https://huggingface.co/docs/transformers/index",
          title: "Hugging Face Transformers Documentation",
          snippet:
            "Transformers provides APIs to easily download and use those pretrained models on a given text, fine-tune them on your own datasets...",
          source: "huggingface.co",
          publishedDate: "2023-02-15",
        },
        {
          url: "https://www.sbert.net/examples/applications/semantic-search/README.html",
          title: "Semantic Search - Sentence Transformers Documentation",
          snippet:
            "Semantic search seeks to improve search accuracy by understanding the content of the search query instead of using keyword matching.",
          source: "sbert.net",
          publishedDate: "2022-11-03",
        },
        {
          url: "https://www.pinecone.io/learn/vector-embeddings/",
          title: "Vector Embeddings Explained | Pinecone",
          snippet:
            "Vector embeddings are numerical representations that capture the semantics or meaning of data in a way that machines can understand and process.",
          source: "pinecone.io",
          publishedDate: "2023-01-22",
        },
      ];

      // Simulate search delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return mockResults;
    },

    /**
     * Check if the web search service is properly configured
     * @returns True if configured
     */
    isConfigured: (): boolean => {
      // Always return true to allow mock searches without requiring an API key
      return true;
    },
  };
}

/**
 * Default web search service instance with no configuration
 */
export const defaultWebSearchService = configureWebSearch({});

/**
 * Check if a Brave API key is set
 * @returns Whether a Brave API key is set
 */
export function isBraveApiKeySet(): boolean {
  const key = localStorage.getItem("brave_api_key");
  return !!key && key.length > 5;
}

/**
 * Get the stored Brave API key
 * @returns The Brave API key or null if not set
 */
export function getBraveApiKey(): string | null {
  return localStorage.getItem("brave_api_key");
}

/**
 * Check if a Google API key is set
 * @returns Whether a Google API key is set
 */
export function isGoogleApiKeySet(): boolean {
  const key = localStorage.getItem("google_api_key");
  return !!key && key.length > 5;
}

/**
 * Get the stored Google API key
 * @returns The Google API key or null if not set
 */
export function getGoogleApiKey(): string | null {
  return localStorage.getItem("google_api_key");
}

/**
 * Set the Brave API key
 * @param key The Brave API key to store
 */
export function setBraveApiKey(key: string): void {
  localStorage.setItem("brave_api_key", key);
}

/**
 * Set the Google API key
 * @param key The Google API key to store
 */
export function setGoogleApiKey(key: string): void {
  localStorage.setItem("google_api_key", key);
}

/**
 * Check if a DuckDuckGo API key is set
 * @returns Whether a DuckDuckGo API key is set
 */
export function isDuckDuckGoApiKeySet(): boolean {
  const key = localStorage.getItem("duckduckgo_api_key");
  return !!key && key.length > 5;
}

/**
 * Get the stored DuckDuckGo API key
 * @returns The DuckDuckGo API key or null if not set
 */
export function getDuckDuckGoApiKey(): string | null {
  return localStorage.getItem("duckduckgo_api_key");
}

/**
 * Set the DuckDuckGo API key
 * @param key The DuckDuckGo API key to store
 */
export function setDuckDuckGoApiKey(key: string): void {
  localStorage.setItem("duckduckgo_api_key", key);
}

/**
 * Check if a SERP API key is set
 * @returns Whether a SERP API key is set
 */
export function isSerpApiKeySet(): boolean {
  const key = localStorage.getItem("serp_api_key");
  return !!key && key.length > 5;
}

/**
 * Get the stored SERP API key
 * @returns The SERP API key or null if not set
 */
export function getSerpApiKey(): string | null {
  return localStorage.getItem("serp_api_key");
}

/**
 * Set the SERP API key
 * @param key The SERP API key to store
 */
export function setSerpApiKey(key: string): void {
  localStorage.setItem("serp_api_key", key);
}

/**
 * SearchEngine type definition
 */
export type SearchEngine = "brave" | "google" | "duckduckgo" | "serpapi";

/**
 * Get the preferred search engine
 * @returns The preferred search engine
 */
export function getPreferredSearchEngine(): SearchEngine {
  const preference = localStorage.getItem("preferred_search_engine");
  if (
    preference &&
    ["brave", "google", "duckduckgo", "serpapi"].includes(preference)
  ) {
    return preference as SearchEngine;
  }
  return "google"; // Default to Google if no preference is set
}

/**
 * Set the preferred search engine
 * @param engine The search engine to set as preferred
 */
export function setPreferredSearchEngine(engine: SearchEngine): void {
  localStorage.setItem("preferred_search_engine", engine);
}

/**
 * Search the web with a given query
 * @param query The search query
 * @param maxResults Maximum number of results to return (default: 3)
 * @param timeRange Time range for search (default: 'month')
 * @returns Array of search results
 */
export async function searchWeb(
  query: string,
  maxResults: number = 3,
  timeRange: "day" | "week" | "month" | "year" = "month",
): Promise<SearchResult[]> {
  console.log(`Performing web search for: "${query}"`);

  // Get the preferred search engine
  const preferredEngine = getPreferredSearchEngine();

  // Generate mock results based on the query
  const mockResults: SearchResult[] = [
    {
      url: `https://example.com/search/${encodeURIComponent(query)}/1`,
      title: `${query} - Overview and Explanation`,
      snippet: `Comprehensive information about ${query} including its definition, applications, and examples.`,
      source: "example.com",
      publishedDate: new Date().toISOString().split("T")[0],
    },
    {
      url: `https://example.com/search/${encodeURIComponent(query)}/2`,
      title: `Latest Research on ${query}`,
      snippet: `Recent studies and findings related to ${query}, including methodologies and results.`,
      source: "example.com",
      publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      url: `https://example.com/search/${encodeURIComponent(query)}/3`,
      title: `How to Implement ${query} in Practice`,
      snippet: `Step-by-step guide on implementing ${query} with practical examples and code snippets.`,
      source: "example.com",
      publishedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      url: `https://example.com/search/${encodeURIComponent(query)}/4`,
      title: `${query} vs Alternative Approaches`,
      snippet: `Comparative analysis of ${query} against other methods, highlighting strengths and weaknesses.`,
      source: "example.com",
      publishedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  ];

  // Simulate search delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return requested number of results
  return mockResults.slice(0, maxResults);
}

/**
 * Format search results into a context string for LLM input
 * @param results The search results to format
 * @returns Formatted context string
 */
export function formatSearchResultsAsContext(results: SearchResult[]): string {
  if (!results || results.length === 0) {
    return "No relevant web search results found.";
  }

  const formattedResults = results.map((result, index) => {
    return `[${index + 1}] "${result.title}" (${result.url})
${result.snippet}
${result.publishedDate ? `Published: ${result.publishedDate}` : ""}`;
  });

  return `WEB SEARCH RESULTS:
${formattedResults.join("\n\n")}
  
Please use this information to help answer the user's query.`;
}

/**
 * Check if any web search API key is set
 * @returns Whether any web search API key is set
 */
export function isWebSearchApiKeySet(): boolean {
  return (
    isBraveApiKeySet() ||
    isGoogleApiKeySet() ||
    isDuckDuckGoApiKeySet() ||
    isSerpApiKeySet()
  );
}

export default {
  configureWebSearch,
  defaultWebSearchService,
  searchWeb,
  formatSearchResultsAsContext,
  isWebSearchApiKeySet,
  isBraveApiKeySet,
  isGoogleApiKeySet,
  isDuckDuckGoApiKeySet,
  isSerpApiKeySet,
  getBraveApiKey,
  getGoogleApiKey,
  getDuckDuckGoApiKey,
  getSerpApiKey,
  setBraveApiKey,
  setGoogleApiKey,
  setDuckDuckGoApiKey,
  setSerpApiKey,
  getPreferredSearchEngine,
  setPreferredSearchEngine,
};
