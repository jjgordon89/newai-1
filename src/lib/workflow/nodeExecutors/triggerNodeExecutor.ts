/**
 * Trigger Node Executor
 * Executes a trigger node in a workflow
 */

import { NodeExecutor, WorkflowContext } from "../workflowEngine";
import { WorkflowNode } from "../../workflowTypes";

/**
 * Trigger node executor implementation
 */
export const triggerNodeExecutor: NodeExecutor = {
  /**
   * Execute a trigger node
   * @param node The trigger node to execute
   * @param context The workflow execution context
   * @returns The trigger execution result
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    console.log(`Executing trigger node: ${node.id}`);

    // Extract trigger configuration from node data
    const { triggerType, inputs } = node.data || {};

    // Process inputs if they exist
    let processedInputs: Record<string, any> = {};
    if (inputs) {
      for (const [key, value] of Object.entries(inputs)) {
        // Add the input to the workflow variables
        context.variables[key] = value;
        processedInputs[key] = value;
      }
    }

    // Return the trigger result
    return {
      triggerType: triggerType || "manual",
      inputs: processedInputs,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Validate a trigger node configuration
   * @param node The trigger node to validate
   * @returns Whether the node configuration is valid
   */
  validate(node: WorkflowNode): boolean {
    // Trigger nodes are always valid as they can be manually triggered
    return true;
  },
};

export default triggerNodeExecutor;
