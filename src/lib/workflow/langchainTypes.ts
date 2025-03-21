/**
 * Type definitions for LangChain integration
 */

// LLM Node Types
export interface LLMNodeData {
  label?: string;
  description?: string;
  model: string;
  temperature?: number;
  systemPrompt?: string;
  maxTokens?: number;
}

// RAG Node Types
export interface RAGNodeData {
  label?: string;
  description?: string;
  knowledgeBase: string;
  vectorStore?: string;
  embeddingModel?: string;
  topK?: number;
  similarityThreshold?: number;
  hybridSearch?: boolean;
  reranking?: boolean;
  includeMetadata?: boolean;
  queryTemplate?: string;
}

// Agent Node Types
export interface AgentNodeData {
  label?: string;
  description?: string;
  agentType:
    | "react"
    | "planAndExecute"
    | "conversational"
    | "function"
    | "custom";
  llmModel?: string;
  systemPrompt?: string;
  maxIterations?: number;
  tools?: {
    webSearch?: boolean;
    knowledgeBase?: boolean;
    calculator?: boolean;
    codeInterpreter?: boolean;
    [key: string]: boolean | undefined;
  };
}

// Web Search Node Types
export interface WebSearchNodeData {
  label?: string;
  description?: string;
  searchProvider: "google" | "bing" | "duckduckgo" | "brave";
  maxResults?: number;
  includeLinks?: boolean;
}

// Trigger Node Types
export interface TriggerNodeData {
  label?: string;
  description?: string;
  triggerType: "manual" | "scheduled" | "webhook" | "event";
  schedule?: string;
  webhookPath?: string;
  eventName?: string;
}

// Output Node Types
export interface OutputNodeData {
  label?: string;
  description?: string;
  outputType: "text" | "json" | "file" | "database" | "webhook";
  webhookUrl?: string;
  databaseTable?: string;
  formatOutput?: boolean;
}

// LangChain Chain Result
export interface ChainResult {
  output: string;
  intermediateSteps?: any[];
  sourceDocuments?: any[];
  error?: string;
}

// LangChain Document
export interface LangChainDocument {
  pageContent: string;
  metadata: Record<string, any>;
}

// LangChain Tool
export interface LangChainTool {
  name: string;
  description: string;
  call: (input: string) => Promise<string>;
}
