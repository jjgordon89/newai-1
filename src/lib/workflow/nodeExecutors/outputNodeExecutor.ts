/**
 * Output Node Executor
 * Executes an output node in a workflow
 */

import { NodeExecutor, WorkflowContext } from "../workflowEngine";
import { WorkflowNode } from "../../workflowTypes";

/**
 * Output node executor implementation
 */
export const outputNodeExecutor: NodeExecutor = {
  /**
   * Execute an output node
   * @param node The output node to execute
   * @param context The workflow execution context
   * @returns The output execution result
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    console.log(`Executing output node: ${node.id}`);

    // Extract output configuration from node data
    const { outputKey, value, format } = node.data || {};

    // If a specific value is provided, use it
    if (value !== undefined) {
      // Substitute variables in the value if it's a string
      const processedValue =
        typeof value === "string"
          ? substituteVariables(value, context.variables)
          : value;

      // Format the output if needed
      const formattedValue = formatOutput(processedValue, format);

      // If an output key is provided, store the result in the context variables
      if (outputKey) {
        context.variables[outputKey] = formattedValue;
      }

      return formattedValue;
    }

    // If no value is provided, return the entire variables object
    return context.variables;
  },

  /**
   * Validate an output node configuration
   * @param node The output node to validate
   * @returns Whether the node configuration is valid
   */
  validate(node: WorkflowNode): boolean {
    // Output nodes are always valid
    return true;
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
 * Format the output value based on the specified format
 * @param value The value to format
 * @param format The format to apply
 * @returns The formatted value
 */
function formatOutput(value: any, format?: string): any {
  if (!format) {
    return value;
  }

  switch (format.toLowerCase()) {
    case "json":
      return typeof value === "string" ? JSON.parse(value) : value;
    case "string":
      return typeof value === "object" ? JSON.stringify(value) : String(value);
    case "number":
      return Number(value);
    case "boolean":
      return Boolean(value);
    case "date":
      return new Date(value).toISOString();
    default:
      return value;
  }
}

export default outputNodeExecutor;
