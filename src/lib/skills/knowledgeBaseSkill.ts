/**
 * Knowledge Base Skill - Search the knowledge base for information
 */

import { vectorSearch } from "../lanceDbService";
import { enhancedRagService } from "../enhancedRagService";
import { Skill, SkillResult, KnowledgeBaseResult } from "./skillTypes";

/**
 * Knowledge base skill implementation
 */
export const knowledgeBaseSkill: Skill = {
  id: "knowledgeBase",
  name: "Knowledge Base",
  description: "Search your document knowledge base",
  enabled: true,
  requiresApiKey: false,
  keywords: ["knowledge", "documents", "kb", "docs"],
  priority: 2,
  icon: "database",
  category: "knowledge",
  detectionFn: (query: string) => {
    const kbRegex =
      /^(?:kb|knowledge base|docs|documents)\s+(?:search\s+)?(.+)$/i;
    return kbRegex.test(query);
  },
  handler: async (
    query: string,
    options?: { workspaceId: string },
  ): Promise<SkillResult> => {
    try {
      // Extract search query
      const kbRegex =
        /^(?:kb|knowledge base|docs|documents)\s+(?:search\s+)?(.+)$/i;
      const match = query.match(kbRegex);

      if (!match || !match[1]) {
        return {
          success: false,
          error: "Search query not found",
          type: "error",
        };
      }

      const searchQuery = match[1].trim();
      const workspaceId = options?.workspaceId || "default";

      // Search the vector database
      const searchResults = await vectorSearch(
        workspaceId,
        searchQuery,
        5, // Top 5 results
        70, // 70% similarity threshold
      );

      if (searchResults.length === 0) {
        return {
          success: false,
          error: `No documents found in the knowledge base for "${searchQuery}".`,
          type: "error",
        };
      }

      // Convert search results to RAG documents format
      const ragDocs = searchResults.map((result) => ({
        id: result.id,
        content: result.text,
        metadata: {
          ...result.metadata,
          title: result.documentName,
          similarity: result.similarity * 100, // Convert to percentage
        },
      }));

      // Generate enhanced context
      const retrievalResult = {
        results: ragDocs,
        executionTime: 0,
      };

      const context =
        await enhancedRagService.getEnhancedContext(retrievalResult);

      // Format the knowledge base results
      const sources = searchResults.map((result) => ({
        id: result.id,
        title: result.documentName,
        similarity: result.similarity,
      }));

      return {
        success: true,
        data: {
          content: context,
          sources,
        },
        formatted: context,
        type: "knowledge",
        sources: sources.map(
          (source) =>
            `${source.title} (${Math.round(source.similarity * 100)}% match)`,
        ),
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
