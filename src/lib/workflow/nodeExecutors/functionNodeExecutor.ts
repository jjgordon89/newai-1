/**
 * Function Node Executor
 * Executes a function node in a workflow
 */

import { NodeExecutor, WorkflowContext } from "../workflowEngine";
import { WorkflowNode } from "../../workflowTypes";

// Registry of available functions that can be called by function nodes
const functionRegistry: Record<string, Function> = {
  // String manipulation functions
  toUpperCase: (input: string) => input.toUpperCase(),
  toLowerCase: (input: string) => input.toLowerCase(),
  trim: (input: string) => input.trim(),
  replace: (input: string, search: string, replacement: string) =>
    input.replace(new RegExp(search, "g"), replacement),

  // Array functions
  filter: (array: any[], predicate: string) => {
    const filterFn = new Function("item", `return ${predicate};`);
    return array.filter((item) => filterFn(item));
  },
  map: (array: any[], mapper: string) => {
    const mapFn = new Function("item", `return ${mapper};`);
    return array.map((item) => mapFn(item));
  },
  sort: (array: any[], key?: string) => {
    if (key) {
      return [...array].sort((a, b) => (a[key] > b[key] ? 1 : -1));
    }
    return [...array].sort();
  },

  // Object functions
  pick: (obj: Record<string, any>, keys: string[]) => {
    return keys.reduce(
      (result, key) => {
        if (obj.hasOwnProperty(key)) {
          result[key] = obj[key];
        }
        return result;
      },
      {} as Record<string, any>,
    );
  },
  omit: (obj: Record<string, any>, keys: string[]) => {
    return Object.keys(obj).reduce(
      (result, key) => {
        if (!keys.includes(key)) {
          result[key] = obj[key];
        }
        return result;
      },
      {} as Record<string, any>,
    );
  },

  // Math functions
  add: (a: number, b: number) => a + b,
  subtract: (a: number, b: number) => a - b,
  multiply: (a: number, b: number) => a * b,
  divide: (a: number, b: number) => a / b,
  round: (num: number, decimals: number = 0) => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  },
};

/**
 * Register a custom function in the function registry
 */
export function registerCustomFunction(name: string, fn: Function): void {
  functionRegistry[name] = fn;
}

/**
 * Function node executor implementation
 */
export const functionNodeExecutor: NodeExecutor = {
  /**
   * Execute a function node
   * @param node The function node to execute
   * @param context The workflow execution context
   * @returns The function execution result
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    console.log(`Executing function node: ${node.id}`);

    // Extract function configuration from node data
    const { functionName, params } = node.data || {};

    if (!functionName) {
      throw new Error("Function node requires a function name");
    }

    // Check if the function exists in the registry
    const fn = functionRegistry[functionName];
    if (!fn) {
      throw new Error(`Function "${functionName}" not found in registry`);
    }

    // Process parameters by substituting variables
    const processedParams = processParameters(params || {}, context.variables);

    try {
      // Execute the function with the processed parameters
      const result = await fn(...Object.values(processedParams));
      return result;
    } catch (error) {
      console.error(`Error executing function "${functionName}":`, error);
      throw new Error(
        `Function execution failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  /**
   * Validate a function node configuration
   * @param node The function node to validate
   * @returns Whether the node configuration is valid
   */
  validate(node: WorkflowNode): boolean {
    // Check if the node has the required data
    const { functionName } = node.data || {};
    return !!functionName && !!functionRegistry[functionName];
  },
};

/**
 * Process parameters by substituting variables
 * @param params The parameters object
 * @param variables The variables to substitute
 * @returns The processed parameters
 */
function processParameters(
  params: Record<string, any>,
  variables: Record<string, any>,
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      // Substitute variables in string parameters
      result[key] = substituteVariables(value, variables);
    } else if (typeof value === "object" && value !== null) {
      // Recursively process nested objects
      result[key] = processParameters(value, variables);
    } else {
      // Keep other types as is
      result[key] = value;
    }
  }

  return result;
}

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

export default functionNodeExecutor;
