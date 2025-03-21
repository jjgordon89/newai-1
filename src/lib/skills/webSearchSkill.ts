/**
 * Web Search Skill - Search the web for information
 */

import { searchWeb, isWebSearchApiKeySet } from "../webSearchService";
import { Skill, SkillResult, WebSearchResult } from "./skillTypes";

/**
 * Web search skill implementation
 */
export const webSearchSkill: Skill = {
  id: "webSearch",
  name: "Web Search",
  description: "Search the web for information",
  enabled: true,
  requiresApiKey: true,
  isApiKeySet: isWebSearchApiKeySet,
  keywords: ["search", "find", "lookup", "google", "bing", "web"],
  priority: 1,
  icon: "search",
  category: "search",
  detectionFn: (query: string) => {
    const searchRegex = /^(?:search|find|lookup|google)\s+(?:for\s+)?(.+)$/i;
    return searchRegex.test(query);
  },
  handler: async (query: string): Promise<SkillResult> => {
    try {
      // Extract search query
      const searchRegex = /^(?:search|find|lookup|google)\s+(?:for\s+)?(.+)$/i;
      const match = query.match(searchRegex);

      if (!match || !match[1]) {
        return {
          success: false,
          error: "Search query not found",
          type: "error",
        };
      }

      const searchQuery = match[1].trim();
      const searchResults = await searchWeb(searchQuery);

      // Format the search results for display
      const formatted = formatSearchResults(searchQuery, searchResults);

      return {
        success: true,
        data: {
          query: searchQuery,
          results: searchResults,
        },
        formatted,
        type: "search",
        sources: searchResults.map((result) => result.url),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      };
    }
  },
};

/**
 * Format search results into a human-readable response
 * @param query The search query
 * @param results The search results
 * @returns Formatted search results
 */
function formatSearchResults(
  query: string,
  results: WebSearchResult[],
): string {
  if (results.length === 0) {
    return `No results found for "${query}".`;
  }

  let response = `Search results for "${query}":\n\n`;

  results.forEach((result, index) => {
    response += `${index + 1}. ${result.title}\n${result.snippet}\n${result.url}\n\n`;
  });

  return response;
}
