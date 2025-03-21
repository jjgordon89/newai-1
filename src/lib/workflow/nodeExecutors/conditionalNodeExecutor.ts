/**
 * Conditional Node Executor
 * Executes a conditional node in a workflow
 */

import { NodeExecutor, WorkflowContext } from "../workflowEngine";
import { WorkflowNode } from "../../workflowTypes";

/**
 * Conditional node executor implementation
 */
export const conditionalNodeExecutor: NodeExecutor = {
  /**
   * Execute a conditional node
   * @param node The conditional node to execute
   * @param context The workflow execution context
   * @returns The condition evaluation result
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    console.log(`Executing conditional node: ${node.id}`);

    // Extract condition from node data
    const { condition, leftValue, operator, rightValue } = node.data || {};

    // There are two ways to define conditions:
    // 1. Using a JavaScript expression in the 'condition' field
    // 2. Using leftValue, operator, and rightValue fields for a structured condition

    let result: boolean;

    if (condition) {
      // Evaluate the JavaScript expression
      result = evaluateConditionExpression(condition, context.variables);
    } else if (leftValue && operator && rightValue !== undefined) {
      // Evaluate the structured condition
      result = evaluateStructuredCondition(
        substituteVariables(leftValue, context.variables),
        operator,
        substituteVariables(rightValue, context.variables),
      );
    } else {
      throw new Error(
        "Conditional node requires either a condition expression or leftValue, operator, and rightValue",
      );
    }

    return {
      result,
      path: result ? "true" : "false",
    };
  },

  /**
   * Validate a conditional node configuration
   * @param node The conditional node to validate
   * @returns Whether the node configuration is valid
   */
  validate(node: WorkflowNode): boolean {
    // Check if the node has the required data
    const { condition, leftValue, operator, rightValue } = node.data || {};
    return (
      !!condition || (!!leftValue && !!operator && rightValue !== undefined)
    );
  },
};

/**
 * Evaluate a condition expression against variables
 * @param expression The condition expression
 * @param variables The variables to use in evaluation
 * @returns The evaluation result
 */
function evaluateConditionExpression(
  expression: string,
  variables: Record<string, any>,
): boolean {
  try {
    // Create a function that evaluates the expression with access to variables
    const evalFn = new Function(
      "variables",
      `with(variables) { return ${expression}; }`,
    );

    return !!evalFn(variables);
  } catch (error) {
    console.error("Error evaluating condition expression:", error);
    throw new Error(
      `Condition evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Evaluate a structured condition
 * @param left The left value
 * @param operator The comparison operator
 * @param right The right value
 * @returns The evaluation result
 */
function evaluateStructuredCondition(
  left: any,
  operator: string,
  right: any,
): boolean {
  // Convert string values to numbers if they look like numbers
  if (typeof left === "string" && !isNaN(Number(left))) {
    left = Number(left);
  }

  if (typeof right === "string" && !isNaN(Number(right))) {
    right = Number(right);
  }

  switch (operator) {
    case "==":
      return left == right;
    case "===":
      return left === right;
    case "!=":
      return left != right;
    case "!==":
      return left !== right;
    case ">":
      return left > right;
    case ">=":
      return left >= right;
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case "contains":
      if (typeof left === "string") {
        return left.includes(String(right));
      }
      if (Array.isArray(left)) {
        return left.includes(right);
      }
      return false;
    case "startsWith":
      return typeof left === "string" && left.startsWith(String(right));
    case "endsWith":
      return typeof left === "string" && left.endsWith(String(right));
    case "matches":
      return typeof left === "string" && new RegExp(String(right)).test(left);
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

/**
 * Substitute variables in a string with values from the context
 * @param value The value that may contain variable placeholders
 * @param variables The variables to substitute
 * @returns The value with variables substituted
 */
function substituteVariables(value: any, variables: Record<string, any>): any {
  if (typeof value !== "string") {
    return value;
  }

  // Check if the value is a direct variable reference
  if (value.startsWith("{{") && value.endsWith("}}")) {
    const variableName = value.slice(2, -2).trim();
    if (variables[variableName] !== undefined) {
      return variables[variableName];
    }
  }

  // Otherwise, substitute variables in the string
  return value.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    return variables[trimmedName] !== undefined
      ? String(variables[trimmedName])
      : match;
  });
}

export default conditionalNodeExecutor;
