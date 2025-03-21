/**
 * Types for the workflow system
 */

export type NodeType =
  | "trigger"
  | "llm"
  | "rag"
  | "lancedb"
  | "knowledge-base"
  | "web-search"
  | "conditional"
  | "input"
  | "output"
  | "function"
  | "agent";

export type Position = {
  x: number;
  y: number;
};

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: {
    label: string;
    description?: string;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  animated?: boolean;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  category?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  logs?: string[];
}

export interface WorkflowVariable {
  name: string;
  value: any;
  type: "string" | "number" | "boolean" | "object" | "array";
}

export interface WorkflowExecutionContext {
  variables: Record<string, WorkflowVariable>;
  workflowId: string;
  startedAt: string;
  status: "running" | "completed" | "failed";
  currentNodeId?: string;
}

export interface WorkflowTriggerConfig {
  type: "manual" | "scheduled" | "webhook";
  schedule?: string; // cron expression for scheduled triggers
  webhookUrl?: string; // URL for webhook triggers
}

export interface LLMNodeConfig {
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature: number;
  maxTokens?: number;
}

export interface RAGNodeConfig {
  retrievalMethod: "similarity" | "mmr" | "hybrid";
  query?: string;
  topK: number;
  documents: string[]; // document IDs
}

export interface WebSearchNodeConfig {
  query: string;
  resultCount: number;
}

export interface ConditionalNodeConfig {
  condition: string; // JavaScript expression
}

export interface FunctionNodeConfig {
  functionName: string;
  code: string;
  parameters?: Record<string, any>;
}

export interface InputOutputNodeConfig {
  variableName: string;
  dataType: "string" | "number" | "boolean" | "object" | "array";
  defaultValue?: any;
  required?: boolean;
}

export interface AgentNodeConfig {
  name: string;
  description?: string;
  model: string;
  systemPrompt?: string;
  temperature: number;
  maxTokens?: number;
  skills: string[];
  memory?: {
    enabled: boolean;
    contextWindow: number;
  };
  tools?: string[];
  ragSettings?: {
    enabled: boolean;
    similarityThreshold: number;
    maxRetrievedDocs: number;
  };
}
