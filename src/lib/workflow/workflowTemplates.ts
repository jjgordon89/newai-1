/**
 * Workflow Templates
 * Predefined workflow templates for common use cases
 */

import { WorkflowTemplate } from "../workflowTypes";
import { v4 as uuidv4 } from "uuid";
import { ragWorkflowTemplates } from "./templates/ragWorkflowTemplates";

/**
 * Simple RAG Template
 * A basic workflow that uses retrieval augmented generation
 */
export const simpleRagTemplate: WorkflowTemplate = {
  id: "template-1",
  name: "Simple RAG Workflow",
  description: "A basic workflow that uses retrieval augmented generation",
  category: "RAG",
  nodes: [
    {
      id: "trigger-1",
      type: "trigger",
      position: { x: 100, y: 100 },
      data: {
        label: "Start",
        description: "Workflow entry point",
        triggerType: "manual",
        outputVariable: "input",
      },
    },
    {
      id: "rag-1",
      type: "rag",
      position: { x: 100, y: 250 },
      data: {
        label: "RAG",
        description: "Retrieve relevant documents",
        query: "{{input.query}}",
        datasource: "documents",
        topK: 3,
      },
    },
    {
      id: "llm-1",
      type: "llm",
      position: { x: 100, y: 400 },
      data: {
        label: "LLM",
        description: "Generate a response using the retrieved documents",
        model: "gpt-4",
        prompt:
          "Answer the following question using the provided context. If the answer is not in the context, say so.\n\nContext: {{rag-1.context}}\n\nQuestion: {{input.query}}\n\nAnswer:",
        systemPrompt:
          "You are a helpful assistant that answers questions based on the provided context.",
        temperature: 0.7,
        maxTokens: 500,
      },
    },
    {
      id: "output-1",
      type: "output",
      position: { x: 100, y: 550 },
      data: {
        label: "Output",
        description: "Workflow output",
        variableName: "result",
        dataType: "string",
      },
    },
  ],
  edges: [
    {
      id: uuidv4(),
      source: "trigger-1",
      target: "rag-1",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "rag-1",
      target: "llm-1",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "llm-1",
      target: "output-1",
      type: "smoothstep",
      animated: true,
    },
  ],
};

/**
 * Web Search Agent Template
 * A workflow that uses web search to gather information
 */
export const webSearchTemplate: WorkflowTemplate = {
  id: "template-2",
  name: "Web Search Agent",
  description: "A workflow that uses web search to gather information",
  category: "Web Search",
  nodes: [
    {
      id: "trigger-1",
      type: "trigger",
      position: { x: 100, y: 100 },
      data: {
        label: "Start",
        description: "Workflow entry point",
        triggerType: "manual",
        outputVariable: "input",
      },
    },
    {
      id: "web-search-1",
      type: "web-search",
      position: { x: 100, y: 250 },
      data: {
        label: "Web Search",
        description: "Search the web for information",
        query: "{{input.query}}",
        searchProvider: "brave",
        resultCount: 5,
        safeSearch: true,
      },
    },
    {
      id: "llm-1",
      type: "llm",
      position: { x: 100, y: 400 },
      data: {
        label: "LLM",
        description: "Generate a response using the search results",
        model: "gpt-4",
        prompt:
          "Answer the following question using the provided search results. If the answer is not in the results, say so.\n\nSearch Results:\n{{#each web-search-1.results}}\n- {{this.title}}: {{this.snippet}}\n{{/each}}\n\nQuestion: {{input.query}}\n\nAnswer:",
        systemPrompt:
          "You are a helpful assistant that answers questions based on web search results.",
        temperature: 0.7,
        maxTokens: 500,
      },
    },
    {
      id: "output-1",
      type: "output",
      position: { x: 100, y: 550 },
      data: {
        label: "Output",
        description: "Workflow output",
        variableName: "result",
        dataType: "string",
      },
    },
  ],
  edges: [
    {
      id: uuidv4(),
      source: "trigger-1",
      target: "web-search-1",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "web-search-1",
      target: "llm-1",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "llm-1",
      target: "output-1",
      type: "smoothstep",
      animated: true,
    },
  ],
};

/**
 * OpenRouter AI Agent Template
 * A workflow that uses OpenRouter models with RAG capabilities
 */
export const openRouterAgentTemplate: WorkflowTemplate = {
  id: "openrouter-agent-template",
  name: "OpenRouter AI Agent",
  description:
    "An AI agent workflow leveraging OpenRouter's models with RAG capabilities",
  category: "AI Agent",
  nodes: [
    {
      id: "trigger-1",
      type: "trigger",
      position: { x: 100, y: 100 },
      data: {
        label: "Start",
        description: "Workflow entry point",
        triggerType: "manual",
        outputVariable: "input",
      },
    },
    {
      id: "agent-1",
      type: "agent",
      position: { x: 100, y: 250 },
      data: {
        label: "OpenRouter Agent",
        description: "AI agent powered by OpenRouter",
        name: "Research Assistant",
        model: "anthropic/claude-3-opus",
        systemPrompt:
          "You are a helpful research assistant that can search for information and answer questions accurately. Use the tools available to you to provide the best possible answer.",
        temperature: 0.7,
        maxTokens: 1000,
        skills: ["web-search", "knowledge-base", "calculator"],
        memory: {
          enabled: true,
          contextWindow: 10,
        },
        tools: ["web-search", "knowledge-base"],
        ragSettings: {
          enabled: true,
          similarityThreshold: 0.7,
          maxRetrievedDocs: 5,
        },
      },
    },
    {
      id: "output-1",
      type: "output",
      position: { x: 100, y: 400 },
      data: {
        label: "Output",
        description: "Workflow output",
        variableName: "result",
        dataType: "object",
      },
    },
  ],
  edges: [
    {
      id: uuidv4(),
      source: "trigger-1",
      target: "agent-1",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "agent-1",
      target: "output-1",
      type: "smoothstep",
      animated: true,
    },
  ],
};

// Combine all templates
export const workflowTemplates = [
  simpleRagTemplate,
  webSearchTemplate,
  openRouterAgentTemplate,
  ...ragWorkflowTemplates,
];

export default workflowTemplates;
