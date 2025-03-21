/**
 * Agent Node Executor
 * Executes an agent node in a workflow
 */

import { NodeExecutor, WorkflowContext } from "../workflowEngine";
import { WorkflowNode } from "../../workflowTypes";

/**
 * Agent node executor implementation
 */
export const agentNodeExecutor: NodeExecutor = {
  /**
   * Execute an agent node
   * @param node The agent node to execute
   * @param context The workflow execution context
   * @returns The agent execution result
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    console.log(`Executing agent node: ${node.id}`);

    // Extract agent configuration from node data
    const { agentId, prompt, systemPrompt, tools } = node.data || {};

    if (!prompt) {
      throw new Error("Agent node requires a prompt");
    }

    // Substitute variables in the prompt
    const processedPrompt = substituteVariables(prompt, context.variables);
    const processedSystemPrompt = systemPrompt
      ? substituteVariables(systemPrompt, context.variables)
      : undefined;

    // Mock agent execution for now
    // In a real implementation, this would call an actual agent service
    const result = await mockAgentExecution({
      agentId,
      prompt: processedPrompt,
      systemPrompt: processedSystemPrompt,
      tools: tools || [],
      context,
    });

    return result;
  },

  /**
   * Validate an agent node configuration
   * @param node The agent node to validate
   * @returns Whether the node configuration is valid
   */
  validate(node: WorkflowNode): boolean {
    // Check if the node has the required data
    const { prompt } = node.data || {};
    return !!prompt;
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
 * Mock agent execution for development purposes
 * @param params Agent execution parameters
 * @returns Mock agent response
 */
async function mockAgentExecution(params: {
  agentId?: string;
  prompt: string;
  systemPrompt?: string;
  tools: string[];
  context: WorkflowContext;
}): Promise<any> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return a mock response
  return {
    response: `This is a mock agent response to: "${params.prompt}"`,
    toolCalls: [],
    executionTime: 500,
    tokenUsage: {
      prompt: 50,
      completion: 30,
      total: 80,
    },
  };
}

export default agentNodeExecutor;
