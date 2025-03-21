/**
 * RAG Workflow Templates
 * Predefined workflow templates for RAG use cases
 */

import { WorkflowTemplate } from "../../workflowTypes";
import { v4 as uuidv4 } from "uuid";

/**
 * Basic RAG Workflow Template
 * A simple workflow that uses a knowledge base to answer questions
 */
export const basicRagTemplate: WorkflowTemplate = {
  id: "basic-rag-template",
  name: "Basic RAG Workflow",
  description:
    "A simple workflow that uses a knowledge base to answer questions",
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
      id: "knowledge-base-1",
      type: "knowledge-base",
      position: { x: 100, y: 250 },
      data: {
        label: "Knowledge Retrieval",
        description: "Retrieve relevant information from the knowledge base",
        query: "{{input.query}}",
        workspaceId: "", // User will need to set this
        retrievalMethod: "hybrid",
        topK: 5,
        similarityThreshold: 70,
        formatResults: "text",
        useQueryExpansion: true,
        enhancedContext: false,
        generateCitations: true,
      },
    },
    {
      id: "llm-1",
      type: "llm",
      position: { x: 100, y: 400 },
      data: {
        label: "Generate Response",
        description: "Generate a response using the retrieved information",
        model: "gpt-4",
        prompt:
          "Answer the following question using the provided context. If the answer is not in the context, say so.\n\nContext: {{knowledge-base-1.context}}\n\nQuestion: {{input.query}}\n\nAnswer:",
        systemPrompt:
          "You are a helpful assistant that answers questions based on the provided context. Be concise and accurate.",
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
        dataType: "object",
      },
    },
  ],
  edges: [
    {
      id: uuidv4(),
      source: "trigger-1",
      target: "knowledge-base-1",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "knowledge-base-1",
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
 * Advanced RAG Workflow Template
 * A more advanced workflow with query preprocessing, multiple knowledge sources, and result formatting
 */
export const advancedRagTemplate: WorkflowTemplate = {
  id: "advanced-rag-template",
  name: "Advanced RAG Workflow",
  description:
    "Advanced workflow with query preprocessing and multiple knowledge sources",
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
      id: "function-1",
      type: "function",
      position: { x: 100, y: 250 },
      data: {
        label: "Query Preprocessing",
        description: "Preprocess and analyze the query",
        functionName: "preprocessQuery",
        code: "function preprocessQuery(input) {\n  const query = input.query;\n  \n  // Extract potential entities or keywords\n  const keywords = query.toLowerCase().split(' ');\n  \n  // Determine query type (question, command, etc.)\n  const isQuestion = query.trim().endsWith('?');\n  const hasWh = ['what', 'who', 'where', 'when', 'why', 'how'].some(wh => keywords.includes(wh));\n  const queryType = isQuestion || hasWh ? 'question' : 'statement';\n  \n  return {\n    originalQuery: query,\n    processedQuery: query.trim(),\n    queryType,\n    keywords: keywords.filter(k => k.length > 3),\n    isQuestion\n  };\n}",
      },
    },
    {
      id: "conditional-1",
      type: "conditional",
      position: { x: 100, y: 400 },
      data: {
        label: "Route by Query Type",
        description: "Route to different knowledge sources based on query type",
        condition: "input.queryType === 'question'",
      },
    },
    {
      id: "knowledge-base-1",
      type: "knowledge-base",
      position: { x: -100, y: 550 },
      data: {
        label: "Primary Knowledge Base",
        description: "Search the primary knowledge base for questions",
        query: "{{function-1.processedQuery}}",
        workspaceId: "", // User will need to set this
        retrievalMethod: "hybrid",
        topK: 5,
        similarityThreshold: 70,
        formatResults: "json",
        useQueryExpansion: true,
        enhancedContext: true,
        generateCitations: true,
      },
    },
    {
      id: "web-search-1",
      type: "web-search",
      position: { x: 300, y: 550 },
      data: {
        label: "Web Search",
        description: "Search the web for additional information",
        searchProvider: "brave",
        query: "{{function-1.processedQuery}}",
        resultCount: 3,
        safeSearch: true,
      },
    },
    {
      id: "function-2",
      type: "function",
      position: { x: 100, y: 700 },
      data: {
        label: "Merge Results",
        description: "Combine results from different sources",
        functionName: "mergeResults",
        code: "function mergeResults(input) {\n  // Get results from both sources\n  const kbResults = input['knowledge-base-1'] || { context: '', citations: [] };\n  const webResults = input['web-search-1'] || { results: [] };\n  \n  // Combine contexts\n  let combinedContext = '';\n  \n  if (kbResults.context) {\n    combinedContext += '### Knowledge Base Information:\n' + kbResults.context + '\n\n';\n  }\n  \n  if (webResults.results && webResults.results.length > 0) {\n    combinedContext += '### Web Search Results:\n';\n    webResults.results.forEach((result, i) => {\n      combinedContext += `${i+1}. ${result.title}: ${result.snippet}\n`;\n    });\n  }\n  \n  // Combine citations\n  const citations = [\n    ...(kbResults.citations || []),\n    ...(webResults.results || []).map((r, i) => ({\n      id: `web-${i}`,\n      documentName: r.title,\n      text: r.snippet,\n      url: r.url\n    }))\n  ];\n  \n  return {\n    combinedContext,\n    citations,\n    sources: {\n      knowledgeBase: kbResults,\n      webSearch: webResults\n    }\n  };\n}",
      },
    },
    {
      id: "llm-1",
      type: "llm",
      position: { x: 100, y: 850 },
      data: {
        label: "Generate Response",
        description:
          "Generate a comprehensive response using all retrieved information",
        model: "gpt-4",
        prompt:
          "Answer the following question using the provided context. If the answer is not in the context, say so.\n\nContext: {{function-2.combinedContext}}\n\nQuestion: {{input.query}}\n\nAnswer:",
        systemPrompt:
          "You are a helpful assistant that answers questions based on the provided context. Cite your sources when possible. Be concise and accurate.",
        temperature: 0.7,
        maxTokens: 800,
      },
    },
    {
      id: "function-3",
      type: "function",
      position: { x: 100, y: 1000 },
      data: {
        label: "Format Response",
        description: "Format the final response with citations",
        functionName: "formatResponse",
        code: "function formatResponse(input) {\n  const llmResponse = input['llm-1'];\n  const mergedResults = input['function-2'];\n  \n  // Format citations if available\n  let formattedCitations = '';\n  if (mergedResults.citations && mergedResults.citations.length > 0) {\n    formattedCitations = '\n\nSources:\n';\n    mergedResults.citations.forEach((citation, i) => {\n      formattedCitations += `[${i+1}] ${citation.documentName}${citation.url ? ` - ${citation.url}` : ''}\n`;\n    });\n  }\n  \n  return {\n    answer: llmResponse + formattedCitations,\n    rawResponse: llmResponse,\n    citations: mergedResults.citations,\n    metadata: {\n      processedQuery: input['function-1'].processedQuery,\n      queryType: input['function-1'].queryType,\n      sources: mergedResults.sources\n    }\n  };\n}",
      },
    },
    {
      id: "output-1",
      type: "output",
      position: { x: 100, y: 1150 },
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
      target: "function-1",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "function-1",
      target: "conditional-1",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "conditional-1",
      target: "knowledge-base-1",
      type: "smoothstep",
      animated: true,
      sourceHandle: "true",
    },
    {
      id: uuidv4(),
      source: "conditional-1",
      target: "web-search-1",
      type: "smoothstep",
      animated: true,
      sourceHandle: "false",
    },
    {
      id: uuidv4(),
      source: "knowledge-base-1",
      target: "function-2",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "web-search-1",
      target: "function-2",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "function-2",
      target: "llm-1",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "llm-1",
      target: "function-3",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "function-3",
      target: "output-1",
      type: "smoothstep",
      animated: true,
    },
  ],
};

/**
 * Document Processing Workflow Template
 * A workflow for processing and indexing documents
 */
export const documentProcessingTemplate: WorkflowTemplate = {
  id: "document-processing-template",
  name: "Document Processing Workflow",
  description: "Process and index documents for the knowledge base",
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
      id: "function-1",
      type: "function",
      position: { x: 100, y: 250 },
      data: {
        label: "Document Preprocessing",
        description: "Extract and preprocess document content",
        functionName: "preprocessDocument",
        code: "function preprocessDocument(input) {\n  const document = input.document;\n  \n  // Extract metadata\n  const metadata = {\n    title: document.title || document.name || 'Untitled Document',\n    type: document.type || 'text',\n    created: document.created || new Date().toISOString(),\n    size: document.content ? document.content.length : 0,\n    ...document.metadata\n  };\n  \n  // Basic text cleaning\n  let processedContent = document.content;\n  if (processedContent) {\n    // Remove excessive whitespace\n    processedContent = processedContent.replace(/s+/g, ' ');\n    // Remove special characters if needed\n    // processedContent = processedContent.replace(/[^ws.,?!;:()[]{}'\"-]/g, '');\n  }\n  \n  return {\n    originalDocument: document,\n    processedContent,\n    metadata,\n    documentId: document.id || `doc-${Date.now()}`\n  };\n}",
      },
    },
    {
      id: "function-2",
      type: "function",
      position: { x: 100, y: 400 },
      data: {
        label: "Document Chunking",
        description: "Split document into manageable chunks",
        functionName: "chunkDocument",
        code: "function chunkDocument(input) {\n  const { processedContent, metadata, documentId } = input;\n  \n  // Configuration\n  const chunkSize = 1000; // characters\n  const chunkOverlap = 200; // characters\n  \n  // Simple chunking by character count\n  const chunks = [];\n  if (processedContent) {\n    let startIndex = 0;\n    while (startIndex < processedContent.length) {\n      const endIndex = Math.min(startIndex + chunkSize, processedContent.length);\n      chunks.push({\n        id: `${documentId}-chunk-${chunks.length + 1}`,\n        content: processedContent.substring(startIndex, endIndex),\n        metadata: {\n          ...metadata,\n          chunkIndex: chunks.length,\n          startIndex,\n          endIndex,\n          isFirst: startIndex === 0,\n          isLast: endIndex >= processedContent.length\n        }\n      });\n      startIndex = endIndex - chunkOverlap;\n    }\n  }\n  \n  return {\n    documentId,\n    metadata,\n    chunks,\n    chunkCount: chunks.length\n  };\n}",
      },
    },
    {
      id: "lancedb-1",
      type: "lancedb",
      position: { x: 100, y: 550 },
      data: {
        label: "Index Document",
        description: "Index document chunks in the vector database",
        operation: "insert",
        table: "documents",
        documents: "{{function-2.chunks}}",
      },
    },
    {
      id: "function-3",
      type: "function",
      position: { x: 100, y: 700 },
      data: {
        label: "Generate Summary",
        description: "Generate a summary of the processing results",
        functionName: "generateSummary",
        code: "function generateSummary(input) {\n  const { chunks, metadata, documentId } = input['function-2'];\n  const indexResult = input['lancedb-1'];\n  \n  return {\n    documentId,\n    title: metadata.title,\n    type: metadata.type,\n    chunkCount: chunks.length,\n    totalCharacters: chunks.reduce((sum, chunk) => sum + chunk.content.length, 0),\n    indexingStatus: indexResult.inserted > 0 ? 'success' : 'failed',\n    indexedChunks: indexResult.inserted || 0,\n    metadata\n  };\n}",
      },
    },
    {
      id: "output-1",
      type: "output",
      position: { x: 100, y: 850 },
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
      target: "function-1",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "function-1",
      target: "function-2",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "function-2",
      target: "lancedb-1",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "lancedb-1",
      target: "function-3",
      type: "smoothstep",
      animated: true,
    },
    {
      id: uuidv4(),
      source: "function-3",
      target: "output-1",
      type: "smoothstep",
      animated: true,
    },
  ],
};

// Export all templates
export const ragWorkflowTemplates = [
  basicRagTemplate,
  advancedRagTemplate,
  documentProcessingTemplate,
];

export default ragWorkflowTemplates;
