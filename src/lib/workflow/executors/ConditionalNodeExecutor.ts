/**
 * Conditional Node Executor
 * 
 * Responsible for evaluating conditions and branching logic within a workflow
 */

import { WorkflowNode } from '@/lib/workflowTypes';

export interface ConditionalExecutionOptions {
  context: Record<string, any>;
  onLog?: (message: string) => void;
}

export interface ConditionalExecutionResult {
  success: boolean;
  output?: {
    result: boolean;
    condition: string;
    path?: 'true' | 'false';
    evaluatedExpression?: string;
  };
  error?: string;
}

/**
 * Conditional Node Executor class for handling branching logic
 */
export class ConditionalNodeExecutor {
  /**
   * Execute a conditional node
   */
  public async execute(
    node: WorkflowNode, 
    options: ConditionalExecutionOptions
  ): Promise<ConditionalExecutionResult> {
    const { context, onLog } = options;
    const { conditionType, condition } = node.data;
    
    // Log the operation
    onLog?.(`Conditional Node - Type: ${conditionType}, Evaluating condition`);
    
    try {
      let result = false;
      let evaluatedExpression = '';
      
      // Select evaluation strategy based on condition type
      if (conditionType === 'expression') {
        const evalResult = this.evaluateExpression(condition, context, onLog);
        result = evalResult.result;
        evaluatedExpression = evalResult.evaluatedExpression;
      } else if (conditionType === 'comparison') {
        const evalResult = this.evaluateComparison(node.data, context, onLog);
        result = evalResult.result;
        evaluatedExpression = evalResult.evaluatedExpression;
      } else if (conditionType === 'exists') {
        const evalResult = this.evaluateExists(node.data.variable, context, onLog);
        result = evalResult.result;
        evaluatedExpression = evalResult.evaluatedExpression;
      } else {
        throw new Error(`Unsupported condition type: ${conditionType}`);
      }
      
      onLog?.(`Conditional Node - Condition evaluated to: ${result}`);
      
      return {
        success: true,
        output: {
          result,
          condition: condition || '',
          path: result ? 'true' : 'false',
          evaluatedExpression
        }
      };
    } catch (error) {
      onLog?.(`Conditional Node - Evaluation error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Evaluate an expression-based condition
   */
  private evaluateExpression(
    expression: string, 
    context: Record<string, any>,
    onLog?: (message: string) => void
  ): { result: boolean; evaluatedExpression: string } {
    // Process variables in the expression
    let processedExpression = expression;
    const variablePattern = /\{\{([^}]+)\}\}/g;
    let match;
    
    while ((match = variablePattern.exec(expression)) !== null) {
      const fullMatch = match[0];
      const variablePath = match[1].trim();
      
      // Get the variable value from context
      const value = this.getValueByPath(context, variablePath);
      
      if (value !== undefined) {
        const stringValue = typeof value === 'object' 
          ? JSON.stringify(value)
          : typeof value === 'string' 
            ? `"${value}"`
            : String(value);
        
        processedExpression = processedExpression.replace(fullMatch, stringValue);
      }
    }
    
    onLog?.(`Conditional Node - Processed expression: ${processedExpression}`);
    
    // In a production environment, you should use a safer alternative to eval
    // such as a proper expression parser/evaluator
    
    try {
      // This is using Function instead of eval for slightly better isolation
      // but still not recommended for production
      const result = new Function(`return (${processedExpression});`)();
      return { 
        result: Boolean(result),
        evaluatedExpression: processedExpression
      };
    } catch (error) {
      throw new Error(`Error evaluating expression "${processedExpression}": ${error}`);
    }
  }
  
  /**
   * Evaluate a comparison condition
   */
  private evaluateComparison(
    nodeData: any,
    context: Record<string, any>,
    onLog?: (message: string) => void
  ): { result: boolean; evaluatedExpression: string } {
    const { left, operator, right } = nodeData;
    
    // Get values, which could be direct values or references to context variables
    const leftValue = this.resolveValue(left, context);
    const rightValue = this.resolveValue(right, context);
    
    let result = false;
    
    // Perform the comparison
    switch (operator) {
      case '==': result = leftValue == rightValue; break;
      case '===': result = leftValue === rightValue; break;
      case '!=': result = leftValue != rightValue; break;
      case '!==': result = leftValue !== rightValue; break;
      case '>': result = leftValue > rightValue; break;
      case '>=': result = leftValue >= rightValue; break;
      case '<': result = leftValue < rightValue; break;
      case '<=': result = leftValue <= rightValue; break;
      case 'contains': 
        result = String(leftValue).includes(String(rightValue)); 
        break;
      case 'startsWith': 
        result = String(leftValue).startsWith(String(rightValue)); 
        break;
      case 'endsWith': 
        result = String(leftValue).endsWith(String(rightValue)); 
        break;
      default: 
        throw new Error(`Unknown operator: ${operator}`);
    }
    
    const leftDisplay = typeof leftValue === 'string' ? `"${leftValue}"` : leftValue;
    const rightDisplay = typeof rightValue === 'string' ? `"${rightValue}"` : rightValue;
    const evaluatedExpression = `${leftDisplay} ${operator} ${rightDisplay}`;
    
    onLog?.(`Conditional Node - ${evaluatedExpression} = ${result}`);
    
    return { result, evaluatedExpression };
  }
  
  /**
   * Evaluate if a variable exists in the context
   */
  private evaluateExists(
    variable: string,
    context: Record<string, any>,
    onLog?: (message: string) => void
  ): { result: boolean; evaluatedExpression: string } {
    // If the variable contains a path with dots, use getValueByPath
    const exists = variable.includes('.')
      ? this.getValueByPath(context, variable) !== undefined
      : context[variable] !== undefined;
    
    const evaluatedExpression = `${variable} exists: ${exists}`;
    onLog?.(`Conditional Node - Checking if ${variable} exists: ${exists}`);
    
    return { result: exists, evaluatedExpression };
  }
  
  /**
   * Get a value from an object by dot-notation path
   */
  private getValueByPath(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : undefined;
    }, obj);
  }
  
  /**
   * Resolve a value that might be a reference to a context variable
   */
  private resolveValue(value: any, context: Record<string, any>): any {
    if (typeof value !== 'string') {
      return value;
    }
    
    // Check if it's a variable reference (with {{ }})
    const variableMatch = value.match(/^\s*\{\{\s*([^}]+)\s*\}\}\s*$/);
    if (variableMatch) {
      const variablePath = variableMatch[1].trim();
      return this.getValueByPath(context, variablePath);
    }
    
    // Check if it's a direct context variable name
    if (context[value] !== undefined) {
      return context[value];
    }
    
    // Otherwise, return the literal value
    return value;
  }
}

export default new ConditionalNodeExecutor();