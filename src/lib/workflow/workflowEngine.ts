/**
 * Workflow Engine
 * 
 * Central orchestrator for executing workflows with various node types
 */

import { Workflow, WorkflowNode, WorkflowEdge } from '../workflowTypes';
import agentNodeExecutor from './executors/AgentNodeExecutor';
import conditionalNodeExecutor from './executors/ConditionalNodeExecutor';
import functionNodeExecutor from './executors/FunctionNodeExecutor';

// Define the types of execution results
export interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: string;
}

export interface WorkflowExecutionResult {
  success: boolean;
  output: Record<string, any>;
  error?: string;
  nodeResults: Record<string, NodeExecutionResult>;
  executionTime: string;
  logs: string[];
}

export interface WorkflowExecutionOptions {
  initialContext?: Record<string, any>;
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, output: any) => void;
  onNodeError?: (nodeId: string, error: string) => void;
  onLogUpdate?: (log: string) => void;
  onWorkflowComplete?: (result: WorkflowExecutionResult) => void;
}

/**
 * Workflow Engine class
 * Responsible for orchestrating the execution of workflows
 */
export class WorkflowEngine {
  private logs: string[] = [];
  private nodeResults: Record<string, NodeExecutionResult> = {};
  private executingWorkflowId: string | null = null;
  private context: Record<string, any> = {};
  
  /**
   * Log a message with timestamp
   */
  private log(message: string, options?: { onLogUpdate?: (log: string) => void }): void {
    const timestamp = new Date().toISOString().split('T')[1].replace('Z', '');
    const log = `[${timestamp}] ${message}`;
    this.logs.push(log);
    options?.onLogUpdate?.(log);
  }
  
  /**
   * Get the execution order of nodes by performing a topological sort
   */
  private getExecutionOrder(workflow: Workflow): string[] {
    const nodes = new Map<string, WorkflowNode>();
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    // Initialize data structures
    workflow.nodes.forEach(node => {
      nodes.set(node.id, node);
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });
    
    // Build the adjacency list and in-degree maps
    workflow.edges.forEach(edge => {
      const source = edge.source;
      const target = edge.target;
      
      adjacencyList.get(source)?.push(target);
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    });
    
    // Find all nodes with in-degree 0 (entry points)
    const queue = Array.from(inDegree.entries())
      .filter(([_, degree]) => degree === 0)
      .map(([nodeId]) => nodeId);
    
    // Perform topological sort
    const result: string[] = [];
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);
      
      adjacencyList.get(nodeId)?.forEach(neighborId => {
        inDegree.set(neighborId, (inDegree.get(neighborId) || 0) - 1);
        
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      });
    }
    
    // Check for cycles
    if (result.length !== workflow.nodes.length) {
      this.log("Warning: Workflow contains cycles or unreachable nodes");
    }
    
    return result;
  }
  
  /**
   * Determine next nodes to execute after a conditional node
   */
  private getConditionalNextNodes(
    node: WorkflowNode,
    edges: WorkflowEdge[],
    result: boolean
  ): string[] {
    const nextNodes: string[] = [];
    
    // Find edges that connect from this node
    const outgoingEdges = edges.filter(edge => edge.source === node.id);
    
    // Determine which edges to follow based on the condition result
    outgoingEdges.forEach(edge => {
      // Determine if this edge should be followed based on the condition result
      // The label is used to determine if it's the 'true' or 'false' branch
      const isInTrueBranch = edge.label === 'true' || edge.sourceHandle?.includes('true');
      const isInFalseBranch = edge.label === 'false' || edge.sourceHandle?.includes('false');
      
      // If the edge is in the correct branch according to the result, add the target to next nodes
      if ((result && isInTrueBranch) || (!result && isInFalseBranch)) {
        nextNodes.push(edge.target);
      } else if (!isInTrueBranch && !isInFalseBranch) {
        // If the edge is not labeled as true or false, follow it regardless (default behavior)
        nextNodes.push(edge.target);
      }
    });
    
    return nextNodes;
  }
  
  /**
   * Execute a single node
   */
  private async executeNode(
    node: WorkflowNode,
    options: WorkflowExecutionOptions = {}
  ): Promise<NodeExecutionResult> {
    const startTime = performance.now();
    this.log(`Starting execution of node: ${node.id} (${node.type})`, options);
    options.onNodeStart?.(node.id);
    
    try {
      // Execute node based on its type
      let result: NodeExecutionResult;
      
      switch (node.type) {
        case 'trigger':
          // Trigger nodes just pass their data along
          result = {
            success: true,
            output: node.data.payload || {}
          };
          break;
          
        case 'llm':
        case 'agent':
          result = await agentNodeExecutor.execute(node, {
            context: this.context,
            onLog: (message) => this.log(message, options)
          });
          break;
          
        case 'conditional':
          const condResult = await conditionalNodeExecutor.execute(node, {
            context: this.context,
            onLog: (message) => this.log(message, options)
          });
          result = condResult;
          break;
          
        case 'function':
          result = await functionNodeExecutor.execute(node, {
            context: this.context,
            onLog: (message) => this.log(message, options)
          });
          break;
          
        case 'input':
          // Input nodes take input from context or data
          result = {
            success: true,
            output: node.data.value || this.context[node.data.variableName] || {}
          };
          break;
          
        case 'output':
          // Output nodes store their input in the context
          const outputValue = this.context[`${node.id}_input`] || {};
          this.context[node.data.variableName] = outputValue;
          result = {
            success: true,
            output: outputValue
          };
          break;
          
        case 'rag':
        case 'web-search':
        case 'knowledge-base':
        case 'lancedb':
          // Implement or integrate with other executors here
          // For now, return a mock result
          result = {
            success: true,
            output: {
              message: `Simulated result for ${node.type} node`,
              data: node.data
            }
          };
          break;
          
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }
      
      const endTime = performance.now();
      const executionTime = `${((endTime - startTime) / 1000).toFixed(2)}s`;
      
      this.log(`Node ${node.id} completed in ${executionTime}`, options);
      options.onNodeComplete?.(node.id, result.output);
      
      return {
        ...result,
        executionTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Error in node ${node.id}: ${errorMessage}`, options);
      options.onNodeError?.(node.id, errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        executionTime: `${((performance.now() - startTime) / 1000).toFixed(2)}s`
      };
    }
  }
  
  /**
   * Execute a workflow
   */
  public async executeWorkflow(
    workflow: Workflow,
    options: WorkflowExecutionOptions = {}
  ): Promise<WorkflowExecutionResult> {
    // Reset state
    this.executingWorkflowId = workflow.id;
    this.nodeResults = {};
    this.logs = [];
    this.context = { ...(options.initialContext || {}) };
    
    const startTime = performance.now();
    this.log(`Starting execution of workflow: ${workflow.id} - ${workflow.name}`, options);
    
    try {
      // Get the initial execution order
      const executionOrder = this.getExecutionOrder(workflow);
      this.log(`Initial execution order: ${executionOrder.join(' → ')}`, options);
      
      // Execute each node, considering conditional branching
      const nodesToExecute = [...executionOrder];
      const executedNodes = new Set<string>();
      
      while (nodesToExecute.length > 0) {
        const nodeId = nodesToExecute.shift();
        
        if (!nodeId || executedNodes.has(nodeId)) continue;
        
        const node = workflow.nodes.find(n => n.id === nodeId);
        
        if (!node) {
          this.log(`Node ${nodeId} not found`, options);
          continue;
        }
        
        // Get the input values for this node from its incoming edges
        const incomingEdges = workflow.edges.filter(edge => edge.target === nodeId);
        
        for (const edge of incomingEdges) {
          const sourceNodeId = edge.source;
          const sourceNodeResult = this.nodeResults[sourceNodeId];
          
          if (sourceNodeResult && sourceNodeResult.success) {
            this.context[`${nodeId}_input`] = sourceNodeResult.output;
            
            // If the edge has a source handle, store it by name too
            if (edge.sourceHandle) {
              const handleName = edge.sourceHandle.replace('handle-', '');
              this.context[handleName] = sourceNodeResult.output;
            }
          }
        }
        
        // Execute the node
        const result = await this.executeNode(node, options);
        this.nodeResults[nodeId] = result;
        executedNodes.add(nodeId);
        
        // Update context with node output
        if (result.success) {
          this.context[nodeId] = result.output;
          
          // If this is a conditional node, update execution path
          if (node.type === 'conditional' && result.output?.result !== undefined) {
            const conditionalResult = result.output.result;
            const nextNodes = this.getConditionalNextNodes(node, workflow.edges, conditionalResult);
            
            // Add next nodes to execution queue
            for (const nextNode of nextNodes) {
              if (!executedNodes.has(nextNode)) {
                nodesToExecute.push(nextNode);
              }
            }
          }
        } else {
          // Handle node failure based on error handling strategy
          // For now, we continue with other nodes
          this.log(`Node ${nodeId} failed, continuing with other nodes`, options);
        }
      }
      
      // Check for output nodes to gather workflow outputs
      const outputNodes = workflow.nodes.filter(node => node.type === 'output');
      const output: Record<string, any> = {};
      
      outputNodes.forEach(node => {
        if (node.data.variableName && this.context[node.data.variableName]) {
          output[node.data.variableName] = this.context[node.data.variableName];
        }
      });
      
      // Calculate overall success (all nodes succeeded)
      const overallSuccess = Object.values(this.nodeResults).every(r => r.success);
      
      const endTime = performance.now();
      const executionTime = `${((endTime - startTime) / 1000).toFixed(2)}s`;
      
      this.log(`Workflow execution ${overallSuccess ? 'completed successfully' : 'failed'} in ${executionTime}`, options);
      
      const result: WorkflowExecutionResult = {
        success: overallSuccess,
        output,
        nodeResults: { ...this.nodeResults },
        executionTime,
        logs: [...this.logs]
      };
      
      options.onWorkflowComplete?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Workflow execution failed: ${errorMessage}`, options);
      
      const executionTime = `${((performance.now() - startTime) / 1000).toFixed(2)}s`;
      const result: WorkflowExecutionResult = {
        success: false,
        output: {},
        error: errorMessage,
        nodeResults: { ...this.nodeResults },
        executionTime,
        logs: [...this.logs]
      };
      
      options.onWorkflowComplete?.(result);
      return result;
    } finally {
      this.executingWorkflowId = null;
    }
  }
}

// Export a singleton instance
export const workflowEngine = new WorkflowEngine();
