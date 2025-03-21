/**
 * Workflow executor for running workflows with LangChain
 * Provides a high-level API for executing workflows defined in the builder
 */

import { executeWorkflow } from "./langchainIntegration";
import { Node, Edge } from "reactflow";

export interface WorkflowExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  executionTime?: number;
  nodeResults?: Record<string, any>;
}

/**
 * Execute a workflow with the given input
 */
export async function runWorkflow(
  nodes: Node[],
  edges: Edge[],
  input: string,
): Promise<WorkflowExecutionResult> {
  const startTime = Date.now();

  try {
    // Validate workflow
    validateWorkflow(nodes, edges);

    // Execute the workflow
    const result = await executeWorkflow(nodes, edges, input);

    return {
      success: true,
      output: result,
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error("Workflow execution error:", error);

    return {
      success: false,
      output: null,
      error:
        error.message || "An unknown error occurred during workflow execution",
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Validate a workflow before execution
 */
function validateWorkflow(nodes: Node[], edges: Edge[]): void {
  // Check if workflow has at least one node
  if (nodes.length === 0) {
    throw new Error("Workflow must contain at least one node");
  }

  // Check if workflow has a trigger node
  const triggerNodes = nodes.filter((node) => node.type === "trigger");
  if (triggerNodes.length === 0) {
    throw new Error("Workflow must have a trigger node");
  }

  // Check if workflow has an output node
  const outputNodes = nodes.filter((node) => node.type === "output");
  if (outputNodes.length === 0) {
    throw new Error("Workflow must have at least one output node");
  }

  // Check for disconnected nodes
  const connectedNodeIds = new Set<string>();

  // Add all nodes that are connected by edges
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  // Check if all nodes are connected
  const disconnectedNodes = nodes.filter(
    (node) => !connectedNodeIds.has(node.id),
  );
  if (disconnectedNodes.length > 0) {
    const nodeNames = disconnectedNodes
      .map((node) => node.data.label || node.id)
      .join(", ");
    throw new Error(`Workflow contains disconnected nodes: ${nodeNames}`);
  }

  // Check for cycles in the graph
  checkForCycles(nodes, edges);
}

/**
 * Check for cycles in the workflow graph
 */
function checkForCycles(nodes: Node[], edges: Edge[]): void {
  // Create adjacency list
  const adjacencyList = new Map<string, string[]>();

  // Initialize adjacency list for all nodes
  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
  });

  // Populate adjacency list with edges
  edges.forEach((edge) => {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  });

  // Track visited and recursion stack
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  // DFS function to detect cycles
  function dfs(nodeId: string): boolean {
    // Mark current node as visited and add to recursion stack
    visited.add(nodeId);
    recursionStack.add(nodeId);

    // Visit all neighbors
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      // If not visited, recurse
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true; // Cycle detected
        }
      }
      // If the neighbor is in recursion stack, cycle exists
      else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    // Remove from recursion stack
    recursionStack.delete(nodeId);
    return false;
  }

  // Check all nodes
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        throw new Error("Workflow contains cycles, which are not supported");
      }
    }
  }
}
