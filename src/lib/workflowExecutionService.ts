import { Workflow, WorkflowNode } from './workflowTypes';

/**
 * Types for node execution lifecycle and results
 */
interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: string;
}

interface WorkflowExecutionResult {
  success: boolean;
  output?: Record<string, any>;
  error?: string;
  nodeResults?: Record<string, NodeExecutionResult>;
  executionTime: string;
}

interface ExecutionCallbacks {
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, output: any) => void;
  onNodeError?: (nodeId: string, error: string) => void;
  onLogUpdate?: (log: string) => void;
  onWorkflowComplete?: (result: WorkflowExecutionResult) => void;
}

/**
 * Class to handle workflow execution
 */
class WorkflowExecutionService {
  private executingWorkflowId: string | null = null;
  private nodeResults: Record<string, NodeExecutionResult> = {};
  private context: Record<string, any> = {};
  private logs: string[] = [];
  private callbacks: ExecutionCallbacks = {};

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
   * Add a log message
   */
  private log(message: string) {
    const timestamp = new Date().toISOString().split('T')[1].replace('Z', '');
    const log = `[${timestamp}] ${message}`;
    this.logs.push(log);
    this.callbacks.onLogUpdate?.(log);
  }
  
  /**
   * Execute a node and return its result
   */
  private async executeNode(node: WorkflowNode): Promise<NodeExecutionResult> {
    const startTime = performance.now();
    this.log(`Starting execution of node: ${node.id} (${node.type})`);
    this.callbacks.onNodeStart?.(node.id);
    
    try {
      let result;
      
      switch (node.type) {
        case 'trigger':
          // Trigger nodes just pass their data along
          result = node.data.payload || {};
          break;
          
        case 'llm':
          result = await this.executeLLMNode(node);
          break;
          
        case 'rag':
          result = await this.executeRAGNode(node);
          break;
          
        case 'web-search':
          result = await this.executeWebSearchNode(node);
          break;
          
        case 'conditional':
          result = await this.executeConditionalNode(node);
          break;
          
        case 'function':
          result = await this.executeFunctionNode(node);
          break;
          
        case 'input':
          result = node.data.value || this.context[node.data.variableName] || {};
          break;
          
        case 'output':
          // Output nodes store their input in the context
          const outputValue = this.context[`${node.id}_input`] || {};
          this.context[node.data.variableName] = outputValue;
          result = outputValue;
          break;
          
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }
      
      const endTime = performance.now();
      const executionTime = `${((endTime - startTime) / 1000).toFixed(2)}s`;
      
      this.log(`Node ${node.id} completed in ${executionTime}`);
      this.callbacks.onNodeComplete?.(node.id, result);
      
      return {
        success: true,
        output: result,
        executionTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Error in node ${node.id}: ${errorMessage}`);
      this.callbacks.onNodeError?.(node.id, errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        executionTime: `${((performance.now() - startTime) / 1000).toFixed(2)}s`
      };
    }
  }
  
  /**
   * Execute an LLM node
   */
  private async executeLLMNode(node: WorkflowNode): Promise<any> {
    // In a real implementation, this would call an actual LLM API
    const { model, prompt, temperature } = node.data;
    
    this.log(`LLM Node - Using model: ${model}, Temperature: ${temperature}`);
    
    // Process variables in the prompt
    let processedPrompt = prompt;
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const variables = prompt.match(variablePattern) || [];
    
    for (const variable of variables) {
      const varName = variable.slice(2, -2).trim();
      const varValue = this.context[varName];
      
      if (varValue) {
        processedPrompt = processedPrompt.replace(variable, String(varValue));
      }
    }
    
    this.log(`LLM Node - Processed prompt: ${processedPrompt.substring(0, 100)}...`);
    
    // Simulated delay and response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      text: `This is a simulated response for prompt: "${processedPrompt.substring(0, 30)}..."`,
      model,
      usage: { total_tokens: Math.floor(Math.random() * 1000) + 100 }
    };
  }
  
  /**
   * Execute a RAG node
   */
  private async executeRAGNode(node: WorkflowNode): Promise<any> {
    const { retrievalMethod, topK, documents } = node.data;
    
    this.log(`RAG Node - Method: ${retrievalMethod}, TopK: ${topK}`);
    
    // In a real implementation, this would retrieve documents from a vector store
    // For the demo, we'll just return the configured documents or simulated ones
    const retrievedDocs = documents && documents.length > 0 
      ? documents.slice(0, topK) 
      : Array(topK).fill(0).map((_, i) => ({
          id: `doc-${i}`,
          title: `Sample Document ${i}`,
          content: `This is sample content for document ${i}`,
          score: (Math.random() * 0.3 + 0.7).toFixed(2) // Random score between 0.7 and 1.0
        }));
    
    this.log(`RAG Node - Retrieved ${retrievedDocs.length} documents`);
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      documents: retrievedDocs,
      count: retrievedDocs.length,
      method: retrievalMethod
    };
  }
  
  /**
   * Execute a web search node
   */
  private async executeWebSearchNode(node: WorkflowNode): Promise<any> {
    const { query, resultCount, provider } = node.data;
    
    this.log(`WebSearch Node - Query: ${query}, Provider: ${provider || 'default'}`);
    
    // Process variables in the query
    let processedQuery = query;
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const variables = query.match(variablePattern) || [];
    
    for (const variable of variables) {
      const varName = variable.slice(2, -2).trim();
      const varValue = this.context[varName];
      
      if (varValue) {
        processedQuery = processedQuery.replace(variable, String(varValue));
      }
    }
    
    // Simulated search results
    const results = Array(resultCount || 3).fill(0).map((_, i) => ({
      title: `Search Result ${i+1} for "${processedQuery}"`,
      url: `https://example.com/result-${i+1}`,
      snippet: `This is a snippet of content related to "${processedQuery}" with some information that might be useful.`,
      position: i+1
    }));
    
    this.log(`WebSearch Node - Found ${results.length} results`);
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      results,
      query: processedQuery,
      totalResults: results.length,
      provider: provider || 'default'
    };
  }
  
  /**
   * Execute a conditional node
   */
  private async executeConditionalNode(node: WorkflowNode): Promise<any> {
    const { condition, conditionType } = node.data;
    
    this.log(`Conditional Node - Type: ${conditionType}, Evaluating condition`);
    
    let result = false;
    
    if (conditionType === 'expression') {
      // Simple expression evaluation
      try {
        // Replace variables in the condition
        let processedCondition = condition;
        const variablePattern = /\{\{([^}]+)\}\}/g;
        const variables = condition.match(variablePattern) || [];
        
        for (const variable of variables) {
          const varName = variable.slice(2, -2).trim();
          const varValue = this.context[varName];
          
          if (varValue !== undefined) {
            processedCondition = processedCondition.replace(
              variable, 
              typeof varValue === 'object' ? JSON.stringify(varValue) : String(varValue)
            );
          }
        }
        
        // WARNING: eval is used for demonstration only - in a real app, use a safer alternative
        // eslint-disable-next-line no-eval
        result = eval(processedCondition);
        this.log(`Conditional Node - Condition evaluated to: ${result}`);
      } catch (error) {
        this.log(`Conditional Node - Error evaluating condition: ${error}`);
        throw new Error(`Error evaluating condition: ${error}`);
      }
    } else if (conditionType === 'comparison') {
      // Simple comparison
      const { left, operator, right } = node.data;
      const leftValue = this.context[left] || left;
      const rightValue = this.context[right] || right;
      
      switch (operator) {
        case '==': result = leftValue == rightValue; break;
        case '===': result = leftValue === rightValue; break;
        case '!=': result = leftValue != rightValue; break;
        case '!==': result = leftValue !== rightValue; break;
        case '>': result = leftValue > rightValue; break;
        case '>=': result = leftValue >= rightValue; break;
        case '<': result = leftValue < rightValue; break;
        case '<=': result = leftValue <= rightValue; break;
        default: throw new Error(`Unknown operator: ${operator}`);
      }
      
      this.log(`Conditional Node - ${leftValue} ${operator} ${rightValue} = ${result}`);
    }
    
    return { result, condition };
  }
  
  /**
   * Execute a function node
   */
  private async executeFunctionNode(node: WorkflowNode): Promise<any> {
    const { code, language, functionName } = node.data;
    
    this.log(`Function Node - Executing ${functionName || 'anonymous function'}`);
    
    // In a production environment, you'd use a safer execution method like a web worker
    // or a remote serverless function rather than eval
    try {
      // Create a context object with variables
      const contextStr = Object.entries(this.context)
        .map(([key, value]) => `const ${key} = ${JSON.stringify(value)};`)
        .join('\n');
      
      // Prepare the function to execute
      const functionBody = `
        ${contextStr}
        
        ${code}
        
        // Execute the function with context
        ${functionName ? functionName : '(function(context) { ' + code + ' })'};
      `;
      
      // WARNING: eval is used for demonstration only - in a real app, use a safer alternative
      // eslint-disable-next-line no-eval
      const result = eval(functionBody)(this.context);
      this.log(`Function Node - Execution successful`);
      
      return result;
    } catch (error) {
      this.log(`Function Node - Execution error: ${error}`);
      throw new Error(`Error executing function: ${error}`);
    }
  }
  
  /**
   * Execute the workflow
   */
  public async executeWorkflow(
    workflow: Workflow, 
    callbacks: ExecutionCallbacks = {}
  ): Promise<WorkflowExecutionResult> {
    // Reset state
    this.executingWorkflowId = workflow.id;
    this.nodeResults = {};
    this.context = {};
    this.logs = [];
    this.callbacks = callbacks;
    
    const startTime = performance.now();
    this.log(`Starting execution of workflow: ${workflow.id} - ${workflow.name}`);
    
    try {
      // Get the execution order
      const executionOrder = this.getExecutionOrder(workflow);
      this.log(`Execution order: ${executionOrder.join(' → ')}`);
      
      // Execute each node in order
      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId);
        
        if (!node) {
          this.log(`Node ${nodeId} not found`);
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
        const result = await this.executeNode(node);
        this.nodeResults[nodeId] = result;
        
        // Update context with node output
        if (result.success) {
          this.context[nodeId] = result.output;
        } else {
          // Handle node failure, maybe skip dependent nodes
          this.log(`Node ${nodeId} failed, skipping dependent nodes`);
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
      
      this.log(`Workflow execution ${overallSuccess ? 'completed successfully' : 'failed'} in ${executionTime}`);
      
      const result = {
        success: overallSuccess,
        output,
        nodeResults: { ...this.nodeResults },
        executionTime
      };
      
      callbacks.onWorkflowComplete?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Workflow execution failed: ${errorMessage}`);
      
      const executionTime = `${((performance.now() - startTime) / 1000).toFixed(2)}s`;
      const result = {
        success: false,
        error: errorMessage,
        nodeResults: { ...this.nodeResults },
        executionTime
      };
      
      callbacks.onWorkflowComplete?.(result);
      return result;
    } finally {
      this.executingWorkflowId = null;
    }
  }
}

export const workflowExecutionService = new WorkflowExecutionService();