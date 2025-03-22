/**
 * Function Node Executor
 * 
 * Responsible for executing custom code functions within a workflow
 */

import { WorkflowNode } from '@/lib/workflowTypes';

export interface FunctionExecutionOptions {
  context: Record<string, any>;
  onLog?: (message: string) => void;
}

export interface FunctionExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
}

/**
 * Function Node Executor class for handling custom code execution
 */
export class FunctionNodeExecutor {
  /**
   * Execute a function node
   */
  public async execute(
    node: WorkflowNode, 
    options: FunctionExecutionOptions
  ): Promise<FunctionExecutionResult> {
    const { context, onLog } = options;
    const { code, language, functionName, inputVariables, outputVariable } = node.data;
    
    // Log the operation
    onLog?.(`Function Node - Executing ${functionName || 'anonymous function'} (${language || 'javascript'})`);
    
    try {
      // Prepare input parameters from context if specified
      const inputParams: Record<string, any> = {};
      
      if (inputVariables && Array.isArray(inputVariables)) {
        inputVariables.forEach(varName => {
          if (typeof varName === 'string') {
            inputParams[varName] = context[varName];
          }
        });
      }
      
      // Process the code based on language
      let result: any;
      
      switch (language?.toLowerCase() || 'javascript') {
        case 'javascript':
          result = await this.executeJavaScript(code, functionName, inputParams, context, onLog);
          break;
          
        default:
          throw new Error(`Unsupported language: ${language || 'undefined'}`);
      }
      
      // Store output in context if specified
      if (outputVariable && typeof outputVariable === 'string') {
        context[outputVariable] = result;
      }
      
      onLog?.(`Function Node - Execution successful`);
      
      return {
        success: true,
        output: result
      };
    } catch (error) {
      onLog?.(`Function Node - Execution error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Execute JavaScript/TypeScript code
   */
  private async executeJavaScript(
    code: string,
    functionName: string | undefined,
    inputParams: Record<string, any>,
    context: Record<string, any>,
    onLog?: (message: string) => void
  ): Promise<any> {
    // In a production environment, you should use a safer execution method
    // such as a sandboxed environment, web worker, or serverless function
    
    // Create a safer function execution context
    const safeObject = this.createSafeExecutionObject(context);
    
    // Prepare the function to execute
    try {
      // Create function parameter string
      const paramNames = Object.keys(inputParams);
      const paramValues = Object.values(inputParams);
      
      // Determine which approach to use based on whether a function name is provided
      if (functionName) {
        // Case 1: Execute a named function defined in the code
        // Create a module-like context with the user code
        const executionContext = new Function(`
          ${code}
          return typeof ${functionName} === 'function' ? ${functionName} : null;
        `)();
        
        if (typeof executionContext !== 'function') {
          throw new Error(`Function "${functionName}" is not defined or not a function`);
        }
        
        // Call the function with the input parameters and context
        return await executionContext.apply(safeObject, [...paramValues, safeObject]);
      } else {
        // Case 2: Execute anonymous function or code block
        // Create and immediately execute a function with the input parameters
        const executionFunction = new Function(
          ...paramNames, 
          'context',
          `
            try {
              ${code}
            } catch (error) {
              throw new Error("Execution error: " + error.message);
            }
          `
        );
        
        // Execute the function with parameters and context
        return await executionFunction.apply(safeObject, [...paramValues, safeObject]);
      }
    } catch (error) {
      onLog?.(`Error in JavaScript execution: ${error}`);
      throw error;
    }
  }
  
  /**
   * Create a safe object for function execution
   * This limits what the user code can access
   */
  private createSafeExecutionObject(context: Record<string, any>): Record<string, any> {
    // Create a new object with limited functionality
    const safeObject: Record<string, any> = {
      // Provide read-only access to context
      context: { ...context },
      
      // Provide safe versions of common utilities
      console: {
        log: (...args: any[]) => console.log('Function node:', ...args),
        error: (...args: any[]) => console.error('Function node:', ...args),
        warn: (...args: any[]) => console.warn('Function node:', ...args),
        info: (...args: any[]) => console.info('Function node:', ...args),
      },
      
      // Provide safe utility functions
      utils: {
        // String utilities
        formatString: (template: string, values: Record<string, any>) => {
          return template.replace(/\{(\w+)\}/g, (_, key) => 
            values[key] !== undefined ? String(values[key]) : ''
          );
        },
        
        // Array utilities
        unique: <T>(arr: T[]): T[] => [...new Set(arr)],
        groupBy: <T>(arr: T[], key: keyof T): Record<string, T[]> => {
          return arr.reduce((result, item) => {
            const groupKey = String(item[key]);
            result[groupKey] = result[groupKey] || [];
            result[groupKey].push(item);
            return result;
          }, {} as Record<string, T[]>);
        },
        
        // Object utilities
        pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
          return keys.reduce((result, key) => {
            if (obj[key] !== undefined) {
              result[key] = obj[key];
            }
            return result;
          }, {} as Pick<T, K>);
        },
        omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
          const result = { ...obj };
          keys.forEach(key => { delete result[key]; });
          return result as Omit<T, K>;
        },
        
        // Date utilities
        formatDate: (date: Date, format: string = 'YYYY-MM-DD'): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          
          return format
            .replace('YYYY', String(year))
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
        }
      }
    };
    
    return safeObject;
  }
}

export default new FunctionNodeExecutor();