/**
 * Agent Node Executor
 * 
 * Responsible for executing agent-specific tasks within a workflow
 */

import { WorkflowNode } from '@/lib/workflowTypes';

export interface AgentExecutionOptions {
  context: Record<string, any>;
  onLog?: (message: string) => void;
}

export interface AgentExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
}

/**
 * Agent Node Executor class for handling AI agent operations
 */
export class AgentNodeExecutor {
  /**
   * Execute an agent node
   */
  public async execute(
    node: WorkflowNode, 
    options: AgentExecutionOptions
  ): Promise<AgentExecutionResult> {
    const { context, onLog } = options;
    const { agentType, prompt, tools, systemPrompt, model } = node.data;
    
    // Log the operation
    onLog?.(`Agent Node - Type: ${agentType}, Model: ${model}`);
    
    try {
      // Process variables in prompts
      const processedPrompt = this.processTemplate(prompt, context);
      const processedSystemPrompt = this.processTemplate(systemPrompt, context);
      
      onLog?.(`Agent Node - Processed prompt: ${processedPrompt.substring(0, 100)}...`);
      
      // Select execution strategy based on agent type
      switch (agentType) {
        case 'chat':
          return await this.executeChatAgent(processedSystemPrompt, processedPrompt, model, tools, context);
        
        case 'function-calling':
          return await this.executeFunctionCallingAgent(processedSystemPrompt, processedPrompt, model, tools, context);
        
        case 'reasoning':
          return await this.executeReasoningAgent(processedSystemPrompt, processedPrompt, model, tools, context);
        
        default:
          throw new Error(`Unsupported agent type: ${agentType}`);
      }
    } catch (error) {
      onLog?.(`Agent Node - Execution error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Replace variables in a template string with values from context
   */
  private processTemplate(template: string, context: Record<string, any>): string {
    if (!template) return '';
    
    const variablePattern = /\{\{([^}]+)\}\}/g;
    let result = template;
    let match;
    
    while ((match = variablePattern.exec(template)) !== null) {
      const fullMatch = match[0];
      const variablePath = match[1].trim();
      
      // Get the variable value from context using path (e.g. "user.name")
      const value = this.getValueByPath(context, variablePath);
      
      if (value !== undefined) {
        const stringValue = typeof value === 'object' 
          ? JSON.stringify(value, null, 2) 
          : String(value);
        
        result = result.replace(fullMatch, stringValue);
      }
    }
    
    return result;
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
   * Execute a standard chat agent
   */
  private async executeChatAgent(
    systemPrompt: string,
    prompt: string,
    model: string,
    tools: any[],
    context: Record<string, any>
  ): Promise<AgentExecutionResult> {
    // In a production application, this would call an actual AI model API
    
    // Simulated delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demonstration, return a simulated response
    return {
      success: true,
      output: {
        response: `This is a simulated agent response to: "${prompt.substring(0, 30)}..."`,
        model,
        usage: {
          total_tokens: Math.floor(Math.random() * 1000) + 200,
          prompt_tokens: Math.floor(Math.random() * 500) + 100,
          completion_tokens: Math.floor(Math.random() * 500) + 100
        },
        reasoning: "First, I analyzed the user's request. Then, I determined the best approach would be to provide a clear, comprehensive response."
      }
    };
  }
  
  /**
   * Execute a function-calling agent
   */
  private async executeFunctionCallingAgent(
    systemPrompt: string,
    prompt: string,
    model: string,
    tools: any[],
    context: Record<string, any>
  ): Promise<AgentExecutionResult> {
    // In a production application, this would call an AI model with function-calling capabilities
    
    // Simulated delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demonstration, parse the tools and simulate function calls
    const toolCalls = [];
    
    if (tools && tools.length > 0) {
      const randomTool = tools[Math.floor(Math.random() * tools.length)];
      
      toolCalls.push({
        id: `call_${Date.now()}`,
        type: 'function',
        function: {
          name: randomTool.name,
          arguments: JSON.stringify(
            // Create dummy arguments based on the tool's parameters
            randomTool.parameters?.properties 
              ? Object.fromEntries(
                  Object.entries(randomTool.parameters.properties).map(
                    ([key, value]: [string, any]) => [key, `sample_${key}`]
                  )
                )
              : {}
          )
        }
      });
    }
    
    return {
      success: true,
      output: {
        response: `This is a simulated function-calling agent response to: "${prompt.substring(0, 30)}..."`,
        model,
        tool_calls: toolCalls,
        reasoning: "I analyzed the request and determined that using tools would be the most effective approach to answer the query."
      }
    };
  }
  
  /**
   * Execute a reasoning agent with step-by-step thinking
   */
  private async executeReasoningAgent(
    systemPrompt: string,
    prompt: string,
    model: string,
    tools: any[],
    context: Record<string, any>
  ): Promise<AgentExecutionResult> {
    // In a production application, this would call an AI model with step-by-step reasoning
    
    // Simulated delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // For demonstration, generate a multi-step reasoning process
    const steps = [
      {
        step: 1,
        thinking: "First, I need to understand what the user is asking for.",
        conclusion: "The user wants information about the topic mentioned in the prompt."
      },
      {
        step: 2,
        thinking: "Now I need to analyze the key components of the query.",
        conclusion: "The main concepts are [X] and [Y] and how they relate."
      },
      {
        step: 3,
        thinking: "Let me consider the best approach to provide a comprehensive answer.",
        conclusion: "I should explain the relationship between [X] and [Y], with examples."
      },
      {
        step: 4,
        thinking: "Finally, I need to synthesize the information into a clear response.",
        conclusion: "The user will best understand if I organize my response in a structured format."
      }
    ];
    
    return {
      success: true,
      output: {
        response: `This is a simulated reasoning agent response to: "${prompt.substring(0, 30)}..."`,
        model,
        reasoning_steps: steps,
        final_answer: "After careful consideration, here is my comprehensive response to your question..."
      }
    };
  }
}

export default new AgentNodeExecutor();