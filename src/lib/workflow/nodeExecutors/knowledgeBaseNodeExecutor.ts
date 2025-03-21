/**
 * Knowledge Base Node Executor
 * Executes a Knowledge Base node in a workflow
 */

import { NodeExecutor, WorkflowContext } from "../workflowEngine";
import { WorkflowNode } from "../../workflowTypes";
import {
  retrieveKnowledge,
  RetrievalOptions,
} from "../../knowledgeRetrievalService";
import { processQuery } from "../../queryProcessing";

/**
 * Knowledge Base node executor implementation
 */
export const knowledgeBaseNodeExecutor: NodeExecutor = {
  /**
   * Execute a Knowledge Base node
   * @param node The Knowledge Base node to execute
   * @param context The workflow execution context
   * @returns The Knowledge Base execution result
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    console.log(`Executing Knowledge Base node: ${node.id}`);

    // Extract Knowledge Base configuration from node data
    const {
      query,
      workspaceId,
      topK = 5,
      similarityThreshold = 70,
      retrievalMethod = "hybrid",
      useQueryExpansion = true,
      includeMetadata = true,
      formatResults = "text",
      maxContextLength = 2000,
      enhancedContext = false,
      generateCitations = true,
      filterOptions = {},
    } = node.data || {};

    if (!query) {
      throw new Error("Knowledge Base node requires a query");
    }

    if (!workspaceId) {
      throw new Error("Knowledge Base node requires a workspace ID");
    }

    // Substitute variables in the query
    const processedQuery = substituteVariables(query, context.variables);

    // Set up retrieval options
    const retrievalOptions: RetrievalOptions = {
      workspaceId,
      limit: topK,
      threshold: similarityThreshold / 100, // Convert from percentage to 0-1 scale
      useHybridSearch: retrievalMethod === "hybrid",
      keywordWeight:
        retrievalMethod === "hybrid" ? node.data.keywordWeight || 0.3 : 0,
      includeMetadata,
      includeSourceText: true,
      maxContextLength,
    };

    // Apply filters if provided
    if (filterOptions && Object.keys(filterOptions).length > 0) {
      retrievalOptions.filters = processFilters(
        filterOptions,
        context.variables,
      );
    }

    try {
      // Retrieve knowledge
      const result = await retrieveKnowledge(processedQuery, retrievalOptions);

      // Format the results based on the specified format
      const formattedResults = formatKnowledgeResults(result, formatResults, {
        enhancedContext,
        generateCitations,
      });

      return formattedResults;
    } catch (error) {
      console.error("Error executing Knowledge Base node:", error);
      throw new Error(
        `Knowledge Base node execution failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  /**
   * Validate a Knowledge Base node configuration
   * @param node The Knowledge Base node to validate
   * @returns Whether the node configuration is valid
   */
  validate(node: WorkflowNode): boolean {
    // Check if the node has the required data
    const { query, workspaceId } = node.data || {};
    return !!query && !!workspaceId;
  },
};

/**
 * Substitute variables in a string with values from the context
 * @param text The text containing variable placeholders
 * @param variables The variables to substitute
 * @returns The text with variables substituted
 */
function substituteVariables(
  text: string,
  variables: Record<string, any>,
): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    return variables[trimmedName] !== undefined
      ? String(variables[trimmedName])
      : match;
  });
}

/**
 * Process filter options and substitute variables
 * @param filterOptions The filter options
 * @param variables The variables to substitute
 * @returns Processed filters
 */
function processFilters(
  filterOptions: Record<string, any>,
  variables: Record<string, any>,
): Record<string, any> {
  const processedFilters: Record<string, any> = {};

  for (const [key, value] of Object.entries(filterOptions)) {
    if (typeof value === "string") {
      processedFilters[key] = substituteVariables(value, variables);
    } else if (Array.isArray(value)) {
      processedFilters[key] = value.map((item) =>
        typeof item === "string" ? substituteVariables(item, variables) : item,
      );
    } else {
      processedFilters[key] = value;
    }
  }

  return processedFilters;
}

/**
 * Format knowledge retrieval results based on the specified format
 * @param result The knowledge retrieval result
 * @param format The desired format
 * @param options Formatting options
 * @returns Formatted results
 */
function formatKnowledgeResults(
  result: any,
  format: string = "text",
  options: { enhancedContext?: boolean; generateCitations?: boolean } = {},
): any {
  const { enhancedContext = false, generateCitations = true } = options;

  switch (format.toLowerCase()) {
    case "text":
      return {
        context: result.context,
        citations: generateCitations ? result.citations : [],
        query: result.query.processedQuery,
        expandedQuery: result.query.expandedQueries.join("; "),
        documentCount: result.results.length,
        executionTime: result.metadata.executionTimeMs,
      };

    case "json":
      return {
        context: result.context,
        citations: generateCitations ? result.citations : [],
        results: result.results,
        query: {
          original: result.query.originalQuery,
          processed: result.query.processedQuery,
          expanded: result.query.expandedQueries,
        },
        metadata: result.metadata,
      };

    case "compact":
      return {
        context: result.context,
        documentCount: result.results.length,
        topDocuments: result.results.slice(0, 3).map((doc: any) => ({
          title: doc.documentName,
          score: doc.similarity,
        })),
      };

    case "citations-only":
      if (!generateCitations) {
        return { message: "Citations were disabled in the node configuration" };
      }
      return {
        citations: result.citations,
        query: result.query.processedQuery,
      };

    case "raw":
    default:
      return result;
  }
}

export default knowledgeBaseNodeExecutor;
