/**
 * LangChain integration for the workflow builder
 * Provides adapters and utilities to connect workflow nodes with LangChain components
 */

import { ChatOpenAI } from "langchain/chat_models/openai";
import { HuggingFaceInference } from "langchain/llms/hf";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { RetrievalQAChain } from "langchain/chains";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { Tool } from "langchain/tools";
import { WebBrowser } from "langchain/tools/webbrowser";
import { Calculator } from "langchain/tools/calculator";

/**
 * Creates a LangChain LLM instance based on node configuration
 */
export function createLLMFromNode(nodeData: any) {
  const { model, temperature = 0.7 } = nodeData;

  // Select the appropriate LLM based on the model name
  if (model?.includes("gpt")) {
    return new ChatOpenAI({
      modelName: model || "gpt-3.5-turbo",
      temperature: parseFloat(temperature),
    });
  } else if (model?.includes("claude")) {
    // For Claude models, we would use Anthropic integration
    // This is a placeholder as LangChain's Anthropic integration would be used here
    return new ChatOpenAI({
      modelName: "gpt-3.5-turbo", // Fallback for now
      temperature: parseFloat(temperature),
    });
  } else if (model?.includes("mistral") || model?.includes("llama")) {
    // For open source models, we can use HuggingFace inference API
    return new HuggingFaceInference({
      model: model || "mistralai/Mistral-7B-Instruct-v0.1",
      temperature: parseFloat(temperature),
    });
  }

  // Default to OpenAI
  return new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: parseFloat(temperature),
  });
}

/**
 * Creates a LangChain chain from an LLM node
 */
export function createChainFromLLMNode(nodeData: any) {
  const llm = createLLMFromNode(nodeData);
  const { systemPrompt } = nodeData;

  if (systemPrompt) {
    const prompt = PromptTemplate.fromTemplate(
      `System: ${systemPrompt}\n\nHuman: {input}\n\nAI:`,
    );

    return new LLMChain({
      llm,
      prompt,
      outputKey: "output",
    });
  }

  return llm;
}

/**
 * Creates a LangChain RAG chain from a RAG node
 */
export function createRAGChainFromNode(nodeData: any, vectorStore: any) {
  const llm = createLLMFromNode(
    nodeData.llmModel ? { model: nodeData.llmModel } : {},
  );
  const { topK = 5, includeMetadata = true } = nodeData;

  // Configure retriever from the vector store
  const retriever = vectorStore.asRetriever({
    k: parseInt(topK),
    includeMetadata,
  });

  // Create a RetrievalQAChain
  return RetrievalQAChain.fromLLM(llm, retriever);
}

/**
 * Creates a LangChain agent from an agent node
 */
export function createAgentFromNode(nodeData: any, availableTools: any[] = []) {
  const llm = createLLMFromNode(
    nodeData.llmModel ? { model: nodeData.llmModel } : {},
  );
  const { agentType, tools = {}, maxIterations = 10 } = nodeData;

  // Initialize tools based on configuration
  const selectedTools: Tool[] = [];

  if (tools.webSearch) {
    // This is a placeholder - in a real implementation you would
    // configure the WebBrowser tool with appropriate credentials
    selectedTools.push(new WebBrowser({ model: llm }));
  }

  if (tools.calculator) {
    selectedTools.push(new Calculator());
  }

  // Add any custom tools passed in
  if (availableTools.length > 0) {
    selectedTools.push(...availableTools);
  }

  // Create the appropriate agent based on type
  if (agentType === "react") {
    const agent = createReactAgent(llm, selectedTools);
    return AgentExecutor.fromAgentAndTools({
      agent,
      tools: selectedTools,
      maxIterations: parseInt(maxIterations),
      verbose: true,
    });
  }

  // Default to ReAct agent if type not specified or supported
  const agent = createReactAgent(llm, selectedTools);
  return AgentExecutor.fromAgentAndTools({
    agent,
    tools: selectedTools,
    maxIterations: parseInt(maxIterations),
    verbose: true,
  });
}

/**
 * Creates a LangChain web search tool from a web search node
 */
export function createWebSearchToolFromNode(nodeData: any) {
  const { searchProvider, maxResults = 5 } = nodeData;

  // This is a placeholder - in a real implementation you would
  // configure the search tool with appropriate credentials and API keys
  // based on the selected provider
  return {
    name: "web-search",
    description: "Search the web for information",
    provider: searchProvider || "google",
    maxResults: parseInt(maxResults),
    call: async (query: string) => {
      // Placeholder for actual implementation
      return `Results for: ${query} (using ${searchProvider} search)`;
    },
  };
}

/**
 * Executes a workflow defined by nodes and edges
 */
export async function executeWorkflow(
  nodes: any[],
  edges: any[],
  input: string,
) {
  // Create a map of nodes by ID for easy lookup
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  // Create a map of node outputs
  const outputs = new Map<string, any>();

  // Find trigger nodes (starting points)
  const triggerNodes = nodes.filter((node) => node.type === "trigger");

  if (triggerNodes.length === 0) {
    throw new Error("No trigger node found in workflow");
  }

  // Start with the first trigger node
  const startNode = triggerNodes[0];
  outputs.set(startNode.id, { input });

  // Find all nodes that need to be executed
  const nodesToProcess = new Set<string>();
  const processedNodes = new Set<string>();

  // Helper to find next nodes to process
  function findNextNodes(nodeId: string) {
    const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      nodesToProcess.add(edge.target);
    }
  }

  // Start with nodes connected to the trigger
  findNextNodes(startNode.id);

  // Process nodes in order based on dependencies
  while (nodesToProcess.size > 0) {
    const currentNodeIds = Array.from(nodesToProcess);
    nodesToProcess.clear();

    for (const nodeId of currentNodeIds) {
      const node = nodeMap.get(nodeId);
      if (!node) continue;

      // Check if all inputs are available
      const incomingEdges = edges.filter((edge) => edge.target === nodeId);
      const allInputsReady = incomingEdges.every(
        (edge) => processedNodes.has(edge.source) && outputs.has(edge.source),
      );

      if (!allInputsReady) {
        // Put back in the queue for later processing
        nodesToProcess.add(nodeId);
        continue;
      }

      // Gather inputs from connected nodes
      const nodeInputs: Record<string, any> = {};
      for (const edge of incomingEdges) {
        const sourceOutput = outputs.get(edge.source);
        if (sourceOutput) {
          // Use the output key if specified in the edge, otherwise use default
          const outputKey = edge.outputKey || "output";
          nodeInputs[edge.inputKey || "input"] =
            sourceOutput[outputKey] || sourceOutput;
        }
      }

      try {
        // Process the node based on its type
        let result;
        switch (node.type) {
          case "llm":
            const llmChain = createChainFromLLMNode(node.data);
            result = await llmChain.invoke(nodeInputs);
            break;

          case "rag":
            // This would require a configured vector store
            // For now, we'll return a placeholder
            result = {
              output: `RAG results for: ${JSON.stringify(nodeInputs)}`,
            };
            break;

          case "agent":
            const agent = createAgentFromNode(node.data);
            result = await agent.invoke(nodeInputs);
            break;

          case "webSearch":
            const searchTool = createWebSearchToolFromNode(node.data);
            result = { output: await searchTool.call(nodeInputs.input) };
            break;

          case "output":
            // Output nodes pass through their input
            result = nodeInputs;
            break;

          default:
            result = {
              output: `Processed ${node.type} node with inputs: ${JSON.stringify(nodeInputs)}`,
            };
        }

        // Store the result
        outputs.set(nodeId, result);
        processedNodes.add(nodeId);

        // Find next nodes to process
        findNextNodes(nodeId);
      } catch (error) {
        console.error(`Error processing node ${nodeId}:`, error);
        outputs.set(nodeId, { error: `Error: ${error.message}` });
        processedNodes.add(nodeId);
        findNextNodes(nodeId);
      }
    }

    // If no progress was made in this iteration, we might have a cycle
    if (
      currentNodeIds.length > 0 &&
      nodesToProcess.size === currentNodeIds.length
    ) {
      const remainingNodes = Array.from(nodesToProcess).join(", ");
      throw new Error(
        `Possible cycle detected in workflow. Could not process nodes: ${remainingNodes}`,
      );
    }
  }

  // Find output nodes
  const outputNodes = nodes.filter((node) => node.type === "output");

  if (outputNodes.length === 0) {
    // If no output nodes, return the last processed node's output
    const lastProcessedNode = Array.from(processedNodes).pop();
    return lastProcessedNode ? outputs.get(lastProcessedNode) : null;
  }

  // Return outputs from all output nodes
  return outputNodes.reduce((result, node) => {
    const output = outputs.get(node.id);
    if (output) {
      result[node.id] = output;
    }
    return result;
  }, {});
}
