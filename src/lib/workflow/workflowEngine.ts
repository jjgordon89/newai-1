/**
 * Workflow Execution Engine
 * Handles the execution of workflow nodes in sequence or parallel based on the workflow definition
 */

import { v4 as uuidv4 } from "uuid";
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  WorkflowExecutionResult,
} from "../workflowTypes";

/**
 * Workflow execution context that is passed between nodes
 */
export interface WorkflowContext {
  id: string;
  startTime: Date;
  variables: Record<string, any>;
  nodeResults: Record<string, any>;
  currentNodeId: string | null;
  status: "running" | "completed" | "failed" | "paused";
  error?: Error;
}

/**
 * Node execution status tracking
 */
export interface NodeExecutionStatus {
  status: "pending" | "running" | "completed" | "failed";
  startTime: Date | null;
  endTime: Date | null;
  output?: any;
  error?: string;
}

/**
 * Creates a new workflow execution context
 */
export function createWorkflowContext(): WorkflowContext {
  return {
    id: uuidv4(),
    startTime: new Date(),
    variables: {},
    nodeResults: {},
    currentNodeId: null,
    status: "running",
  };
}

/**
 * Node executor interface - all node types must implement this
 */
export interface NodeExecutor {
  execute(node: WorkflowNode, context: WorkflowContext): Promise<any>;
  validate(node: WorkflowNode): boolean;
}

/**
 * Registry of node executors by node type
 */
const nodeExecutors: Record<string, NodeExecutor> = {};

/**
 * Register a node executor for a specific node type
 */
export function registerNodeExecutor(
  type: NodeType,
  executor: NodeExecutor,
): void {
  nodeExecutors[type] = executor;
}

/**
 * Executes a workflow based on its definition
 * @param workflow The workflow definition to execute
 * @param initialContext Optional initial context with variables
 * @returns The execution result
 */
export async function executeWorkflow(
  workflow: Workflow,
  initialContext?: Partial<WorkflowContext>,
): Promise<WorkflowExecutionResult> {
  // Create or use the provided context
  const context: WorkflowContext = {
    ...createWorkflowContext(),
    ...initialContext,
    variables: { ...initialContext?.variables },
    nodeResults: { ...initialContext?.nodeResults },
  };

  // Find the trigger node (entry point)
  const triggerNode = workflow.nodes.find((node) => node.type === "trigger");
  if (!triggerNode) {
    return {
      success: false,
      error: "No trigger node found in workflow",
      nodeResults: {},
      executionTime: "0s",
    };
  }

  // Track node execution status
  const nodeStatuses: Record<string, NodeExecutionStatus> = {};
  workflow.nodes.forEach((node) => {
    nodeStatuses[node.id] = {
      status: "pending",
      startTime: null,
      endTime: null,
    };
  });

  try {
    // Start execution from the trigger node
    const result = await executeNode(
      triggerNode.id,
      workflow,
      context,
      nodeStatuses,
    );

    // Find output nodes and collect their results
    const outputNodes = workflow.nodes.filter((node) => node.type === "output");
    const outputs = outputNodes.map((node) => context.nodeResults[node.id]);

    return {
      success: true,
      output: outputs.length === 1 ? outputs[0] : outputs,
      nodeResults: nodeStatuses,
      executionTime: `${((new Date().getTime() - context.startTime.getTime()) / 1000).toFixed(2)}s`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      nodeResults: nodeStatuses,
      executionTime: `${((new Date().getTime() - context.startTime.getTime()) / 1000).toFixed(2)}s`,
    };
  }
}

/**
 * Executes a single node and its downstream nodes
 */
async function executeNode(
  nodeId: string,
  workflow: Workflow,
  context: WorkflowContext,
  nodeStatuses: Record<string, NodeExecutionStatus>,
): Promise<any> {
  // Find the node to execute
  const node = workflow.nodes.find((n) => n.id === nodeId);
  if (!node) {
    throw new Error(`Node with id ${nodeId} not found`);
  }

  // Update context and status
  context.currentNodeId = nodeId;
  nodeStatuses[nodeId] = {
    status: "running",
    startTime: new Date(),
    endTime: null,
  };

  try {
    // Get the appropriate executor for this node type
    const executor = nodeExecutors[node.type];
    if (!executor) {
      throw new Error(`No executor found for node type: ${node.type}`);
    }

    // Execute the node
    const result = await executor.execute(node, context);

    // Store the result in context
    context.nodeResults[nodeId] = result;

    // Update node status
    nodeStatuses[nodeId] = {
      status: "completed",
      startTime: nodeStatuses[nodeId].startTime,
      endTime: new Date(),
      output: result,
    };

    // Find outgoing edges from this node
    const outgoingEdges = workflow.edges.filter(
      (edge) => edge.source === nodeId,
    );

    // For conditional nodes, evaluate the condition to determine which path to take
    if (
      node.type === "conditional" &&
      result &&
      typeof result.result === "boolean"
    ) {
      const conditionResult = result.result;

      // Find the edge that matches the condition result (true/false)
      const matchingEdge = outgoingEdges.find((edge) => {
        return edge.sourceHandle === (conditionResult ? "true" : "false");
      });

      if (matchingEdge) {
        // Execute the next node in the conditional path
        await executeNode(matchingEdge.target, workflow, context, nodeStatuses);
      }
    } else {
      // For non-conditional nodes, execute all outgoing nodes in sequence
      for (const edge of outgoingEdges) {
        await executeNode(edge.target, workflow, context, nodeStatuses);
      }
    }

    return result;
  } catch (error) {
    // Update node status on error
    nodeStatuses[nodeId] = {
      status: "failed",
      startTime: nodeStatuses[nodeId].startTime,
      endTime: new Date(),
      error: error instanceof Error ? error.message : String(error),
    };

    // Propagate the error
    throw error;
  }
}

/**
 * Pauses a running workflow
 */
export function pauseWorkflow(executionId: string): boolean {
  // Implementation would depend on how workflow state is stored
  console.log(`Pausing workflow execution: ${executionId}`);
  return true;
}

/**
 * Resumes a paused workflow
 */
export function resumeWorkflow(executionId: string): boolean {
  // Implementation would depend on how workflow state is stored
  console.log(`Resuming workflow execution: ${executionId}`);
  return true;
}

/**
 * Cancels a running workflow
 */
export function cancelWorkflow(executionId: string): boolean {
  // Implementation would depend on how workflow state is stored
  console.log(`Cancelling workflow execution: ${executionId}`);
  return true;
}

export default {
  executeWorkflow,
  registerNodeExecutor,
  pauseWorkflow,
  resumeWorkflow,
  cancelWorkflow,
  createWorkflowContext,
};
