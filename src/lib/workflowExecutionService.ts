/**
 * Workflow Execution Service
 * 
 * A service for executing workflows, delegating to the WorkflowEngine
 */

import { Workflow } from './workflowTypes';
import { workflowEngine } from './workflow/workflowEngine';

// Export the types from the workflow engine
export type { 
  NodeExecutionResult, 
  WorkflowExecutionResult,
  WorkflowExecutionOptions
} from './workflow/workflowEngine';

/**
 * Class to handle workflow execution
 * This is a wrapper around the new WorkflowEngine implementation
 */
class WorkflowExecutionService {
  private executingWorkflowId: string | null = null;
  
  /**
   * Execute a workflow
   * @param workflow The workflow to execute
   * @param callbacks Callbacks for execution events
   */
  public async executeWorkflow(
    workflow: Workflow, 
    callbacks: {
      onNodeStart?: (nodeId: string) => void;
      onNodeComplete?: (nodeId: string, output: any) => void;
      onNodeError?: (nodeId: string, error: string) => void;
      onLogUpdate?: (log: string) => void;
      onWorkflowComplete?: (result: any) => void;
    } = {}
  ) {
    try {
      this.executingWorkflowId = workflow.id;
      
      // Execute the workflow using the engine
      const result = await workflowEngine.executeWorkflow(workflow, {
        onNodeStart: callbacks.onNodeStart,
        onNodeComplete: callbacks.onNodeComplete,
        onNodeError: callbacks.onNodeError,
        onLogUpdate: callbacks.onLogUpdate,
        onWorkflowComplete: callbacks.onWorkflowComplete
      });
      
      return result;
    } catch (error) {
      console.error('Workflow execution error:', error);
      
      // Create a minimal error result
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const errorResult = {
        success: false,
        output: {},
        error: errorMessage,
        nodeResults: {},
        executionTime: '0s',
        logs: [`Error executing workflow: ${errorMessage}`]
      };
      
      callbacks.onWorkflowComplete?.(errorResult);
      return errorResult;
    } finally {
      this.executingWorkflowId = null;
    }
  }
  
  /**
   * Check if a workflow is currently being executed
   */
  public isExecuting(workflowId?: string): boolean {
    if (!workflowId) {
      return this.executingWorkflowId !== null;
    }
    
    return this.executingWorkflowId === workflowId;
  }
}

// Export a singleton instance
export const workflowExecutionService = new WorkflowExecutionService();