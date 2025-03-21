/**
 * RAG Node Executor
 * Executes a RAG (Retrieval Augmented Generation) node in a workflow
 */

import { NodeExecutor, WorkflowContext } from "../workflowEngine";
import { WorkflowNode } from "../../workflowTypes";

/**
 * RAG node executor implementation
 */
export const ragNodeExecutor: NodeExecutor = {
  /**
   * Execute a RAG node
   * @param node The RAG node to execute
   * @param context The workflow execution context
   * @returns The RAG execution result
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    console.log(`Executing RAG node: ${node.id}`);

    // Extract RAG configuration from node data
    const {
      query,
      datasource,
      topK = 3,
      model,
      prompt,
      retrievalMethod = "similarity",
      similarityThreshold = 70,
      enhancedContext = false,
      documentStore = "default",
    } = node.data || {};

    if (!query) {
      throw new Error("RAG node requires a query");
    }

    if (!datasource && !documentStore) {
      throw new Error("RAG node requires a datasource or document store");
    }

    // Substitute variables in the query
    const processedQuery = substituteVariables(query, context.variables);
    const processedPrompt = prompt
      ? substituteVariables(prompt, context.variables)
      : undefined;

    // Try to use the RagSystem if available, otherwise fall back to mock
    try {
      // Import the RagSystem dynamically to avoid circular dependencies
      const { RagSystem } = await import("../../ragSystem");

      // Configure the RAG system with the node settings
      RagSystem.updateSettings({
        retrievalMethod,
        topK,
        similarityThreshold: similarityThreshold / 100, // Convert from percentage to 0-1 scale
        useQueryExpansion: node.data.useQueryExpansion !== false,
        useReranking: node.data.useReranking !== false,
        enhancedContext,
      });

      // Execute the query
      const result = await RagSystem.query(processedQuery, {
        useAdvancedFeatures: true,
        topK,
        similarityThreshold: similarityThreshold / 100,
      });

      return {
        query: processedQuery,
        context: result.context,
        citations: result.citations,
        results: result.results,
        expandedQuery: result.expandedQuery,
        executionTime: 400, // Placeholder
      };
    } catch (error) {
      console.warn(
        "RagSystem not available, falling back to mock implementation",
        error,
      );

      // Mock RAG execution as fallback
      const result = await mockRagExecution({
        query: processedQuery,
        datasource: datasource || documentStore,
        topK,
        model: model || "default",
        prompt: processedPrompt,
        context,
      });

      return result;
    }
  },

  /**
   * Validate a RAG node configuration
   * @param node The RAG node to validate
   * @returns Whether the node configuration is valid
   */
  validate(node: WorkflowNode): boolean {
    // Check if the node has the required data
    const { query, datasource } = node.data || {};
    return !!query && !!datasource;
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
 * Mock RAG execution for development purposes
 * @param params RAG execution parameters
 * @returns Mock RAG response
 */
async function mockRagExecution(params: {
  query: string;
  datasource: string;
  topK: number;
  model: string;
  prompt?: string;
  context: WorkflowContext;
}): Promise<any> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Generate mock retrieved documents
  const documents = Array.from({ length: params.topK }, (_, i) => ({
    id: `doc-${i + 1}`,
    content: `This is document ${i + 1} related to "${params.query}"`,
    metadata: {
      source: `${params.datasource}/document-${i + 1}`,
      score: 0.9 - i * 0.1,
    },
  }));

  // Return a mock response
  return {
    query: params.query,
    documents,
    answer: `This is a mock RAG answer to "${params.query}" based on ${params.topK} documents from ${params.datasource}`,
    executionTime: 400,
    tokenUsage: {
      retrieval: 20,
      generation: 30,
      total: 50,
    },
  };
}

export default ragNodeExecutor;
