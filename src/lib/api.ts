/**
 * API utilities for the application
 * This file provides functions for accessing external APIs and services
 */

/**
 * Embedding model information
 */
export interface EmbeddingModel {
  id: string;
  name: string;
  dimensions: number;
  language: string;
  description: string;
  category: string;
}

/**
 * Available embedding models
 */
export const EMBEDDING_MODELS: EmbeddingModel[] = [
  {
    id: "BAAI/bge-small-en-v1.5",
    name: "BGE Small",
    dimensions: 384,
    language: "English",
    description:
      "Fast and efficient embedding model, good balance of speed and quality",
    category: "general",
  },
  {
    id: "BAAI/bge-base-en-v1.5",
    name: "BGE Base",
    dimensions: 768,
    language: "English",
    description:
      "Standard embedding model with good performance across various tasks",
    category: "general",
  },
  {
    id: "BAAI/bge-large-en-v1.5",
    name: "BGE Large",
    dimensions: 1024,
    language: "English",
    description:
      "High-quality embedding model for maximum accuracy, larger context window",
    category: "general",
  },
  {
    id: "sentence-transformers/all-MiniLM-L6-v2",
    name: "MiniLM",
    dimensions: 384,
    language: "English",
    description:
      "Very efficient model, good for resource-constrained environments",
    category: "general",
  },
  {
    id: "sentence-transformers/all-mpnet-base-v2",
    name: "MPNet",
    dimensions: 768,
    language: "English",
    description:
      "Strong general purpose embeddings with good semantic understanding",
    category: "general",
  },
  {
    id: "thenlper/gte-large",
    name: "GTE Large",
    dimensions: 1024,
    language: "Multilingual",
    description:
      "General Text Embeddings model with strong performance across languages",
    category: "multilingual",
  },
  {
    id: "intfloat/e5-large-v2",
    name: "E5 Large",
    dimensions: 1024,
    language: "English",
    description: "Optimized for retrieval tasks with excellent performance",
    category: "specialized",
  },
  {
    id: "jinaai/jina-embeddings-v2-base-en",
    name: "Jina Base",
    dimensions: 768,
    language: "English",
    description:
      "Efficient embeddings with strong performance on retrieval tasks",
    category: "specialized",
  },
];

/**
 * Current embedding model state
 */
let currentEmbeddingModel: EmbeddingModel = EMBEDDING_MODELS[0];

/**
 * Get the current embedding model
 * @returns The current embedding model
 */
export function getCurrentEmbeddingModel(): EmbeddingModel {
  return currentEmbeddingModel;
}

/**
 * Set the current embedding model by ID
 * @param modelId The model ID to set as current
 * @returns The new current model
 */
export function setEmbeddingModel(modelId: string): EmbeddingModel {
  const model = EMBEDDING_MODELS.find((m) => m.id === modelId);
  if (!model) {
    throw new Error(`Embedding model ${modelId} not found`);
  }

  currentEmbeddingModel = model;
  return model;
}

/**
 * Create embeddings for the given texts
 * This is a mock implementation that generates random embeddings of the correct dimension
 * In a real implementation, this would call a Hugging Face API endpoint
 *
 * @param texts Array of texts to generate embeddings for
 * @param modelId Optional model ID (defaults to current model)
 * @returns Promise resolving to array of embedding arrays
 */
export async function createEmbeddings(
  texts: string[],
  modelId?: string,
): Promise<number[][]> {
  const model = modelId
    ? EMBEDDING_MODELS.find((m) => m.id === modelId)
    : currentEmbeddingModel;

  if (!model) {
    throw new Error(`Embedding model ${modelId || "unknown"} not found`);
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Generate random embeddings of the correct dimension
  return texts.map(() => {
    // Generate random unit vector of the correct dimension
    const vec = Array.from(
      { length: model.dimensions },
      () => Math.random() * 2 - 1,
    );

    // Normalize to unit length
    const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    return vec.map((v) => v / magnitude);
  });
}

/**
 * Saves API keys to local storage
 * @param apiKey The API key to save
 * @param type The type of API key
 */
export function saveApiKey(apiKey: string, type: string): void {
  localStorage.setItem(`${type}_api_key`, apiKey);
}

/**
 * Gets an API key from local storage
 * @param type The type of API key
 * @returns The API key or empty string if not found
 */
export function getApiKey(type: string): string {
  return localStorage.getItem(`${type}_api_key`) || "";
}

/**
 * Sets API key in storage
 * @param key The key to store
 * @param provider Optional provider name (defaults to 'hugging face')
 */
export function setApiKey(
  key: string,
  provider: string = "hugging face",
): boolean {
  try {
    localStorage.setItem(`${provider}_api_key`, key);
    return true;
  } catch (error) {
    console.error("Error setting API key:", error);
    return false;
  }
}

/**
 * Document type for retrievable documents
 */
export interface DocumentType {
  id: string;
  title: string;
  content: string;
  metadata?: any;
}

/**
 * Chat message interface
 */
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

/**
 * LLM Model interface
 */
export interface HuggingFaceModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  maxTokens: number;
  contextWindow?: number;
  pricingInfo?: string;
  strengths?: string[];
  icon?: any;
  category?: "open-source" | "proprietary" | "local";
  task?: string;
}

/**
 * OpenRouter model interface
 */
export interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
  top_provider: {
    id: string;
    name: string;
  };
}

/**
 * Available models
 */
export const AVAILABLE_MODELS: HuggingFaceModel[] = [
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "OpenAI's most advanced model",
    provider: "openai",
    maxTokens: 8192,
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Fast and efficient OpenAI model",
    provider: "openai",
    maxTokens: 4096,
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    description: "Anthropic's most powerful model",
    provider: "anthropic",
    maxTokens: 100000,
  },
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    description: "Mistral AI's largest model",
    provider: "mistral",
    maxTokens: 32768,
  },
];

/**
 * Converts OpenRouter models to the application's model format
 * @param models List of OpenRouter models
 * @returns List of models in the application's format
 */
export function convertOpenRouterModels(
  models: OpenRouterModel[],
): HuggingFaceModel[] {
  return models.map((model) => {
    // Extract provider from model name or use top provider
    const provider = model.top_provider?.name || "OpenRouter";

    // Create description including pricing info
    const pricePerThousandPrompt = (model.pricing.prompt * 1000).toFixed(4);
    const pricePerThousandCompletion = (
      model.pricing.completion * 1000
    ).toFixed(4);
    const pricingInfo = `$${pricePerThousandPrompt}/1K prompt, $${pricePerThousandCompletion}/1K completion`;

    return {
      id: `openrouter/${model.id}`, // Prefix with openrouter/ to distinguish
      name: model.name,
      description: `${provider} model via OpenRouter`,
      provider: "openrouter",
      maxTokens: model.context_length,
      contextWindow: model.context_length,
      pricingInfo: pricingInfo,
      strengths: [provider, `${model.context_length.toLocaleString()} context`],
      category: "proprietary",
    };
  });
}

/**
 * Adds OpenRouter models to the available models list
 * @param models List of OpenRouter models to add
 */
export function addOpenRouterModels(models: OpenRouterModel[]): void {
  const convertedModels = convertOpenRouterModels(models);

  // Remove any existing OpenRouter models
  const filteredModels = AVAILABLE_MODELS.filter(
    (model) => !model.id.startsWith("openrouter/"),
  );

  // Add the new models
  AVAILABLE_MODELS.length = 0;
  AVAILABLE_MODELS.push(...filteredModels, ...convertedModels);
}

/**
 * Query a language model using the appropriate service based on the model ID
 */
export async function queryModel(
  modelId: string,
  messages: Message[],
  options?: { temperature?: number },
): Promise<string> {
  try {
    // Get the user message content
    const userMessage = messages.find((m) => m.role === "user")?.content || "";

    // Check which provider to use based on the model ID
    if (modelId.startsWith("openrouter/")) {
      // Use OpenRouter for models with openrouter/ prefix
      const openRouterKey = getApiKey("openrouter");
      if (!openRouterKey) {
        return "OpenRouter API key is not configured. Please add your API key in settings.";
      }

      // Extract the actual model ID without the prefix
      const actualModelId = modelId.replace("openrouter/", "");

      // Make the API call to OpenRouter
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterKey}`,
            "HTTP-Referer": window.location.origin,
          },
          body: JSON.stringify({
            model: actualModelId,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: options?.temperature || 0.7,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API error: ${response.status} ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } else if (modelId.includes("gpt-")) {
      // Use OpenAI for GPT models
      const openaiKey = getApiKey("openai");
      if (!openaiKey) {
        return "OpenAI API key is not configured. Please add your API key in settings.";
      }

      // Make the API call to OpenAI
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: options?.temperature || 0.7,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error: ${response.status} ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } else if (modelId.includes("claude")) {
      // Use Anthropic for Claude models
      const anthropicKey = getApiKey("anthropic");
      if (!anthropicKey) {
        return "Anthropic API key is not configured. Please add your API key in settings.";
      }

      // Make the API call to Anthropic
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages.map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          })),
          temperature: options?.temperature || 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Anthropic API error: ${response.status} ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      return data.content[0].text;
    } else if (modelId.includes("mistral")) {
      // Use Mistral AI for Mistral models
      const mistralKey = getApiKey("mistral");
      if (!mistralKey) {
        return "Mistral API key is not configured. Please add your API key in settings.";
      }

      // Make the API call to Mistral AI
      const response = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mistralKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: options?.temperature || 0.7,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Mistral API error: ${response.status} ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } else if (modelId.includes("gemini")) {
      // Use Google AI for Gemini models
      const googleKey = getApiKey("google");
      if (!googleKey) {
        return "Google AI API key is not configured. Please add your API key in settings.";
      }

      // Make the API call to Google AI
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": googleKey,
          },
          body: JSON.stringify({
            contents: messages.map((msg) => ({
              role: msg.role === "assistant" ? "model" : msg.role,
              parts: [{ text: msg.content }],
            })),
            generationConfig: {
              temperature: options?.temperature || 0.7,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Google AI API error: ${response.status} ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } else if (modelId.includes("ollama")) {
      // Use Ollama for local models
      const ollamaEndpoint =
        localStorage.getItem("ollama_endpoint") || "http://localhost:11434";
      const modelName = modelId.replace("ollama/", "");

      // Make the API call to Ollama
      const response = await fetch(`${ollamaEndpoint}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          options: {
            temperature: options?.temperature || 0.7,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Ollama API error: ${response.status} ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      return data.message.content;
    }

    // Fallback for models not yet implemented
    return `The model ${modelId} is not yet fully implemented. This would generate a response to: "${userMessage.substring(0, 30)}${userMessage.length > 30 ? "..." : ""}".

Please configure the appropriate API key in settings.`;
  } catch (error) {
    console.error("Error querying model:", error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * Mock function to search for similar documents
 */
export async function searchSimilarDocuments(
  query: string,
  options?: { topK?: number; threshold?: number },
): Promise<DocumentType[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return dummy documents
  return [
    {
      id: "1",
      title: "Related Document 1",
      content: `This document is related to "${query.substring(0, 20)}..."`,
    },
    {
      id: "2",
      title: "Related Document 2",
      content: `Another document related to "${query.substring(0, 20)}..."`,
    },
  ];
}

/**
 * Mock function to process a document file
 */
export async function processDocumentFile(
  file: File,
): Promise<{ text: string; type: string }> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    text: `Mock extracted text from ${file.name}. This would be the actual content in a real application.`,
    type: file.type,
  };
}

/**
 * Document API endpoints
 */
export const DocumentAPI = {
  /**
   * Upload a document
   */
  uploadDocument: async (workspaceId: string, file: File): Promise<any> => {
    // In a real implementation, this would be an actual API call
    // For now, we'll use the document storage service directly
    const { documentUploadService } = await import("./documentStorage");
    return documentUploadService.uploadDocument(file, workspaceId);
  },

  /**
   * Get a document by ID
   */
  getDocument: async (
    workspaceId: string,
    documentId: string,
  ): Promise<any> => {
    // In a real implementation, this would be an actual API call
    // For now, we'll use the document storage service directly
    const { documentStorage } = await import("./documentStorage");
    const repository = documentStorage.getRepository(workspaceId);
    return repository.getDocument(documentId);
  },

  /**
   * List all documents in a workspace
   */
  listDocuments: async (workspaceId: string): Promise<any[]> => {
    // In a real implementation, this would be an actual API call
    // For now, we'll use the document storage service directly
    const { documentStorage } = await import("./documentStorage");
    const repository = documentStorage.getRepository(workspaceId);
    return repository.listDocuments(workspaceId);
  },

  /**
   * Update a document
   */
  updateDocument: async (
    workspaceId: string,
    documentId: string,
    updates: any,
  ): Promise<any> => {
    // In a real implementation, this would be an actual API call
    // For now, we'll use the document storage service directly
    const { documentStorage } = await import("./documentStorage");
    const repository = documentStorage.getRepository(workspaceId);
    return repository.updateDocument(documentId, updates);
  },

  /**
   * Delete a document
   */
  deleteDocument: async (
    workspaceId: string,
    documentId: string,
  ): Promise<boolean> => {
    // In a real implementation, this would be an actual API call
    // For now, we'll use the document storage service directly
    const { documentStorage } = await import("./documentStorage");
    const repository = documentStorage.getRepository(workspaceId);
    return repository.deleteDocument(documentId);
  },

  /**
   * Search documents by query
   */
  searchDocuments: async (
    workspaceId: string,
    query: string,
  ): Promise<any[]> => {
    // In a real implementation, this would be an actual API call
    // For now, we'll use the document storage service directly
    const { documentStorage } = await import("./documentStorage");
    const repository = documentStorage.getRepository(workspaceId);
    return repository.searchDocuments(query, workspaceId);
  },

  /**
   * Search documents by metadata
   */
  searchByMetadata: async (
    workspaceId: string,
    metadataQuery: Record<string, any>,
  ): Promise<any[]> => {
    // Get all documents first
    const allDocuments = await DocumentAPI.listDocuments(workspaceId);

    // Filter by metadata
    return allDocuments.filter((doc) => {
      // Check if all metadata criteria match
      return Object.entries(metadataQuery).every(([key, value]) => {
        // Handle nested metadata paths (e.g., "metadata.fileType")
        if (key.includes(".")) {
          const parts = key.split(".");
          let current: any = doc;
          for (const part of parts) {
            if (current === undefined || current === null) return false;
            current = current[part];
          }
          return current === value;
        }

        // Direct metadata match
        return doc.metadata && doc.metadata[key] === value;
      });
    });
  },
};
