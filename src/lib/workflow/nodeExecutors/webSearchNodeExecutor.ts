/**
 * Web Search Node Executor
 * Executes a web search node in a workflow
 */

import { NodeExecutor, WorkflowContext } from "../workflowEngine";
import { WorkflowNode } from "../../workflowTypes";
import { searchWeb } from "../../webSearchService";

/**
 * Web Search node executor implementation
 */
export const webSearchNodeExecutor: NodeExecutor = {
  /**
   * Execute a web search node
   * @param node The web search node to execute
   * @param context The workflow execution context
   * @returns The web search execution result
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    console.log(`Executing web search node: ${node.id}`);

    // Extract web search configuration from node data
    const { query, maxResults, timeRange } = node.data || {};

    if (!query) {
      throw new Error("Web search node requires a query");
    }

    // Substitute variables in the query
    const processedQuery = substituteVariables(query, context.variables);

    try {
      // Perform the web search
      const results = await searchWeb(
        processedQuery,
        maxResults || 3,
        timeRange || "month",
      );

      return {
        query: processedQuery,
        results,
        executionTime: Date.now(),
        count: results.length,
      };
    } catch (error) {
      console.error("Error executing web search node:", error);
      throw new Error(
        `Web search failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  /**
   * Validate a web search node configuration
   * @param node The web search node to validate
   * @returns Whether the node configuration is valid
   */
  validate(node: WorkflowNode): boolean {
    // Check if the node has the required data
    const { query } = node.data || {};
    return !!query;
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

export default webSearchNodeExecutor;
