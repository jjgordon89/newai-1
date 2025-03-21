/**
 * LLM Node Executor
 * Executes an LLM node in a workflow
 */

import { NodeExecutor, WorkflowContext } from "../workflowEngine";
import { WorkflowNode } from "../../workflowTypes";

/**
 * LLM node executor implementation
 */
export const llmNodeExecutor: NodeExecutor = {
  /**
   * Execute an LLM node
   * @param node The LLM node to execute
   * @param context The workflow execution context
   * @returns The LLM execution result
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    console.log(`Executing LLM node: ${node.id}`);

    // Extract LLM configuration from node data
    const { model, prompt, systemPrompt, temperature, maxTokens } =
      node.data || {};

    if (!prompt) {
      throw new Error("LLM node requires a prompt");
    }

    if (!model) {
      throw new Error("LLM node requires a model");
    }

    // Substitute variables in the prompt
    const processedPrompt = substituteVariables(prompt, context.variables);
    const processedSystemPrompt = systemPrompt
      ? substituteVariables(systemPrompt, context.variables)
      : undefined;

    // Mock LLM execution for now
    // In a real implementation, this would call an actual LLM service
    const result = await mockLlmExecution({
      model,
      prompt: processedPrompt,
      systemPrompt: processedSystemPrompt,
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 1000,
      context,
    });

    return result;
  },

  /**
   * Validate an LLM node configuration
   * @param node The LLM node to validate
   * @returns Whether the node configuration is valid
   */
  validate(node: WorkflowNode): boolean {
    // Check if the node has the required data
    const { model, prompt } = node.data || {};
    return !!model && !!prompt;
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
 * Mock LLM execution for development purposes
 * @param params LLM execution parameters
 * @returns Mock LLM response
 */
async function mockLlmExecution(params: {
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature: number;
  maxTokens: number;
  context: WorkflowContext;
}): Promise<any> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return a mock response
  return {
    text: `This is a mock response from ${params.model} to: "${params.prompt}"`,
    executionTime: 300,
    tokenUsage: {
      prompt: 30,
      completion: 20,
      total: 50,
    },
  };
}

export default llmNodeExecutor;
