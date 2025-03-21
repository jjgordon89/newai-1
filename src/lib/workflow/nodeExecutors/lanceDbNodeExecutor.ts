/**
 * LanceDB Node Executor
 * Executes a LanceDB node in a workflow
 */

import { NodeExecutor, WorkflowContext } from "../workflowEngine";
import { WorkflowNode } from "../../workflowTypes";

/**
 * LanceDB node executor implementation
 */
export const lanceDbNodeExecutor: NodeExecutor = {
  /**
   * Execute a LanceDB node
   * @param node The LanceDB node to execute
   * @param context The workflow execution context
   * @returns The LanceDB execution result
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    console.log(`Executing LanceDB node: ${node.id}`);

    // Extract LanceDB configuration from node data
    const { operation, table, query, embeddings, limit, filter } =
      node.data || {};

    if (!operation) {
      throw new Error("LanceDB node requires an operation");
    }

    if (!table) {
      throw new Error("LanceDB node requires a table");
    }

    // Substitute variables in the query and filter if they exist
    const processedQuery = query
      ? substituteVariables(query, context.variables)
      : undefined;
    const processedFilter = filter
      ? substituteVariables(filter, context.variables)
      : undefined;

    // Mock LanceDB execution for now
    // In a real implementation, this would call an actual LanceDB service
    const result = await mockLanceDbExecution({
      operation,
      table,
      query: processedQuery,
      embeddings,
      limit: limit || 10,
      filter: processedFilter,
      context,
    });

    return result;
  },

  /**
   * Validate a LanceDB node configuration
   * @param node The LanceDB node to validate
   * @returns Whether the node configuration is valid
   */
  validate(node: WorkflowNode): boolean {
    // Check if the node has the required data
    const { operation, table } = node.data || {};
    return !!operation && !!table;
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
 * Mock LanceDB execution for development purposes
 * @param params LanceDB execution parameters
 * @returns Mock LanceDB response
 */
async function mockLanceDbExecution(params: {
  operation: string;
  table: string;
  query?: string;
  embeddings?: number[];
  limit: number;
  filter?: string;
  context: WorkflowContext;
}): Promise<any> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Generate mock results based on the operation
  switch (params.operation) {
    case "search":
      return mockSearchOperation(params);
    case "insert":
      return mockInsertOperation(params);
    case "update":
      return mockUpdateOperation(params);
    case "delete":
      return mockDeleteOperation(params);
    default:
      throw new Error(`Unsupported LanceDB operation: ${params.operation}`);
  }
}

/**
 * Mock a search operation
 */
function mockSearchOperation(params: any): any {
  const results = Array.from({ length: Math.min(params.limit, 5) }, (_, i) => ({
    id: `doc-${i + 1}`,
    text: `This is a document about ${params.query || "various topics"}`,
    metadata: {
      source: `${params.table}/document-${i + 1}`,
      score: 0.9 - i * 0.1,
    },
    vector: Array.from({ length: 5 }, () => Math.random()),
  }));

  return {
    operation: "search",
    table: params.table,
    query: params.query,
    results,
    count: results.length,
    executionTime: 300,
  };
}

/**
 * Mock an insert operation
 */
function mockInsertOperation(params: any): any {
  return {
    operation: "insert",
    table: params.table,
    inserted: 1,
    executionTime: 300,
  };
}

/**
 * Mock an update operation
 */
function mockUpdateOperation(params: any): any {
  return {
    operation: "update",
    table: params.table,
    filter: params.filter,
    updated: 1,
    executionTime: 300,
  };
}

/**
 * Mock a delete operation
 */
function mockDeleteOperation(params: any): any {
  return {
    operation: "delete",
    table: params.table,
    filter: params.filter,
    deleted: 1,
    executionTime: 300,
  };
}

export default lanceDbNodeExecutor;
