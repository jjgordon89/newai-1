/**
 * Model Integration Framework
 * Provides a unified interface for interacting with various AI models
 */

import { apiKeyManager, ApiProvider } from "./apiKeyManager";
import { Message } from "./api";

// Model provider types
export type ModelProvider =
  | "openai"
  | "anthropic"
  | "hugging face"
  | "google"
  | "mistral"
  | "ollama"
  | "openrouter"
  | "custom";

// Model capabilities
export interface ModelCapabilities {
  streaming: boolean;
  multimodal: boolean;
  functionCalling: boolean;
  contextWindow: number;
  maxOutputTokens: number;
}

// Model information
export interface ModelInfo {
  id: string;
  name: string;
  provider: ModelProvider;
  description?: string;
  capabilities: ModelCapabilities;
  pricing?: {
    input: number; // per 1K tokens
    output: number; // per 1K tokens
  };
  tags?: string[];
}

// Generation parameters
export interface GenerationParams {
  temperature?: number;
  topP?: number;
  topK?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  maxTokens?: number;
  stop?: string[];
  seed?: number;
  responseFormat?: "text" | "json";
  functions?: any[];
}

// Streaming response handler
export type StreamingResponseHandler = (chunk: string, done: boolean) => void;

// Model registry to store available models
class ModelRegistry {
  private models: Map<string, ModelInfo> = new Map();

  // Register a model
  registerModel(model: ModelInfo): void {
    this.models.set(model.id, model);
  }

  // Register multiple models
  registerModels(models: ModelInfo[]): void {
    models.forEach((model) => this.registerModel(model));
  }

  // Get a model by ID
  getModel(id: string): ModelInfo | undefined {
    return this.models.get(id);
  }

  // Get all models
  getAllModels(): ModelInfo[] {
    return Array.from(this.models.values());
  }

  // Get models by provider
  getModelsByProvider(provider: ModelProvider): ModelInfo[] {
    return this.getAllModels().filter((model) => model.provider === provider);
  }

  // Get models by capability
  getModelsByCapability(
    capability: keyof ModelCapabilities,
    value: boolean,
  ): ModelInfo[] {
    return this.getAllModels().filter(
      (model) => model.capabilities[capability] === value,
    );
  }
}

// Create and export the model registry
export const modelRegistry = new ModelRegistry();

/**
 * Model Integration Service
 * Handles communication with different model providers
 */
export class ModelIntegrationService {
  private static instance: ModelIntegrationService;

  // Private constructor for singleton pattern
  private constructor() {}

  // Get singleton instance
  public static getInstance(): ModelIntegrationService {
    if (!ModelIntegrationService.instance) {
      ModelIntegrationService.instance = new ModelIntegrationService();
    }
    return ModelIntegrationService.instance;
  }

  /**
   * Generate a completion from a model
   * @param modelId The model ID
   * @param messages The conversation messages
   * @param params Generation parameters
   * @returns Promise with the generated text
   */
  async generateCompletion(
    modelId: string,
    messages: Message[],
    params: GenerationParams = {},
  ): Promise<string> {
    const model = modelRegistry.getModel(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found in registry`);
    }

    // Get the appropriate API key
    const apiKey = apiKeyManager.getApiKey(model.provider as ApiProvider);
    if (!apiKey) {
      throw new Error(`API key for ${model.provider} is not set`);
    }

    // Route to the appropriate provider implementation
    switch (model.provider) {
      case "openai":
        return this.generateOpenAICompletion(modelId, messages, apiKey, params);
      case "anthropic":
        return this.generateAnthropicCompletion(
          modelId,
          messages,
          apiKey,
          params,
        );
      case "hugging face":
        return this.generateHuggingFaceCompletion(
          modelId,
          messages,
          apiKey,
          params,
        );
      case "google":
        return this.generateGoogleCompletion(modelId, messages, apiKey, params);
      case "mistral":
        return this.generateMistralCompletion(
          modelId,
          messages,
          apiKey,
          params,
        );
      case "ollama":
        return this.generateOllamaCompletion(modelId, messages, params);
      case "openrouter":
        return this.generateOpenRouterCompletion(
          modelId,
          messages,
          apiKey,
          params,
        );
      default:
        throw new Error(`Provider ${model.provider} is not supported`);
    }
  }

  /**
   * Generate a streaming completion from a model
   * @param modelId The model ID
   * @param messages The conversation messages
   * @param onChunk Callback for each chunk of the response
   * @param params Generation parameters
   */
  async generateStreamingCompletion(
    modelId: string,
    messages: Message[],
    onChunk: StreamingResponseHandler,
    params: GenerationParams = {},
  ): Promise<void> {
    const model = modelRegistry.getModel(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found in registry`);
    }

    if (!model.capabilities.streaming) {
      // Fall back to non-streaming for models that don't support it
      const response = await this.generateCompletion(modelId, messages, params);
      onChunk(response, true);
      return;
    }

    // Get the appropriate API key
    const apiKey = apiKeyManager.getApiKey(model.provider as ApiProvider);
    if (!apiKey) {
      throw new Error(`API key for ${model.provider} is not set`);
    }

    // Route to the appropriate streaming implementation
    switch (model.provider) {
      case "openai":
        return this.streamOpenAICompletion(
          modelId,
          messages,
          apiKey,
          onChunk,
          params,
        );
      case "anthropic":
        return this.streamAnthropicCompletion(
          modelId,
          messages,
          apiKey,
          onChunk,
          params,
        );
      case "mistral":
        return this.streamMistralCompletion(
          modelId,
          messages,
          apiKey,
          onChunk,
          params,
        );
      case "ollama":
        return this.streamOllamaCompletion(modelId, messages, onChunk, params);
      case "openrouter":
        return this.streamOpenRouterCompletion(
          modelId,
          messages,
          apiKey,
          onChunk,
          params,
        );
      default:
        // Fall back to non-streaming for providers without streaming implementation
        const response = await this.generateCompletion(
          modelId,
          messages,
          params,
        );
        onChunk(response, true);
        return;
    }
  }

  /**
   * Calculate the estimated cost of a request
   * @param modelId The model ID
   * @param inputTokens Number of input tokens
   * @param outputTokens Number of output tokens
   * @returns The estimated cost in USD
   */
  calculateCost(
    modelId: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const model = modelRegistry.getModel(modelId);
    if (!model || !model.pricing) {
      return 0; // Can't calculate cost without pricing info
    }

    const inputCost = (inputTokens / 1000) * model.pricing.input;
    const outputCost = (outputTokens / 1000) * model.pricing.output;

    return inputCost + outputCost;
  }

  /**
   * Estimate the number of tokens in a text
   * @param text The text to estimate
   * @returns Estimated token count
   */
  estimateTokenCount(text: string): number {
    // Simple estimation: ~4 chars per token for English text
    return Math.ceil(text.length / 4);
  }

  // Provider-specific implementations
  private async generateOpenAICompletion(
    modelId: string,
    messages: Message[],
    apiKey: string,
    params: GenerationParams,
  ): Promise<string> {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: params.temperature ?? 0.7,
            top_p: params.topP,
            max_tokens: params.maxTokens,
            presence_penalty: params.presencePenalty,
            frequency_penalty: params.frequencyPenalty,
            stop: params.stop,
            response_format: params.responseFormat
              ? { type: params.responseFormat }
              : undefined,
            functions: params.functions,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `OpenAI API error: ${error.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating OpenAI completion:", error);
      throw error;
    }
  }

  private async streamOpenAICompletion(
    modelId: string,
    messages: Message[],
    apiKey: string,
    onChunk: StreamingResponseHandler,
    params: GenerationParams,
  ): Promise<void> {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: params.temperature ?? 0.7,
            top_p: params.topP,
            max_tokens: params.maxTokens,
            presence_penalty: params.presencePenalty,
            frequency_penalty: params.frequencyPenalty,
            stop: params.stop,
            stream: true,
          }),
        },
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `OpenAI API error: ${error.error?.message || response.statusText}`,
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body cannot be read");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onChunk(fullText, true);
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content || "";
              if (content) {
                fullText += content;
                onChunk(content, false);
              }
            } catch (e) {
              console.error("Error parsing SSE message:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming OpenAI completion:", error);
      throw error;
    }
  }

  private async generateAnthropicCompletion(
    modelId: string,
    messages: Message[],
    apiKey: string,
    params: GenerationParams,
  ): Promise<string> {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages.map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          })),
          temperature: params.temperature ?? 0.7,
          top_p: params.topP,
          top_k: params.topK,
          max_tokens: params.maxTokens || 1000,
          stop_sequences: params.stop,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Anthropic API error: ${error.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error("Error generating Anthropic completion:", error);
      throw error;
    }
  }

  private async streamAnthropicCompletion(
    modelId: string,
    messages: Message[],
    apiKey: string,
    onChunk: StreamingResponseHandler,
    params: GenerationParams,
  ): Promise<void> {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages.map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          })),
          temperature: params.temperature ?? 0.7,
          top_p: params.topP,
          top_k: params.topK,
          max_tokens: params.maxTokens || 1000,
          stop_sequences: params.stop,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `Anthropic API error: ${error.error?.message || response.statusText}`,
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body cannot be read");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onChunk(fullText, true);
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);
              if (json.type === "content_block_delta" && json.delta?.text) {
                fullText += json.delta.text;
                onChunk(json.delta.text, false);
              }
            } catch (e) {
              console.error("Error parsing SSE message:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming Anthropic completion:", error);
      throw error;
    }
  }

  private async generateHuggingFaceCompletion(
    modelId: string,
    messages: Message[],
    apiKey: string,
    params: GenerationParams,
  ): Promise<string> {
    try {
      // Format messages into a prompt
      let prompt = "";
      for (const msg of messages) {
        if (msg.role === "system") {
          prompt += `<system>\n${msg.content}\n</system>\n\n`;
        } else if (msg.role === "user") {
          prompt += `<human>\n${msg.content}\n</human>\n\n`;
        } else if (msg.role === "assistant") {
          prompt += `<assistant>\n${msg.content}\n</assistant>\n\n`;
        }
      }
      prompt += "<assistant>\n";

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${modelId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              temperature: params.temperature ?? 0.7,
              top_p: params.topP ?? 0.95,
              top_k: params.topK ?? 50,
              max_new_tokens: params.maxTokens ?? 1024,
              return_full_text: false,
              do_sample: true,
            },
          }),
        },
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(
          `Hugging Face API error: ${error.error || response.statusText}`,
        );
      }

      const data = await response.json();
      if (Array.isArray(data) && data[0] && data[0].generated_text) {
        return data[0].generated_text;
      }

      throw new Error("Unexpected response format from Hugging Face API");
    } catch (error) {
      console.error("Error generating Hugging Face completion:", error);
      throw error;
    }
  }

  private async generateGoogleCompletion(
    modelId: string,
    messages: Message[],
    apiKey: string,
    params: GenerationParams,
  ): Promise<string> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: messages.map((msg) => ({
              role: msg.role === "assistant" ? "model" : msg.role,
              parts: [{ text: msg.content }],
            })),
            generationConfig: {
              temperature: params.temperature ?? 0.7,
              topP: params.topP,
              topK: params.topK,
              maxOutputTokens: params.maxTokens,
              stopSequences: params.stop,
            },
          }),
        },
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(
          `Google AI API error: ${error.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error("Unexpected response format from Google AI API");
    } catch (error) {
      console.error("Error generating Google AI completion:", error);
      throw error;
    }
  }

  private async generateMistralCompletion(
    modelId: string,
    messages: Message[],
    apiKey: string,
    params: GenerationParams,
  ): Promise<string> {
    try {
      const response = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: params.temperature ?? 0.7,
            top_p: params.topP,
            max_tokens: params.maxTokens,
          }),
        },
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(
          `Mistral API error: ${error.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating Mistral completion:", error);
      throw error;
    }
  }

  private async streamMistralCompletion(
    modelId: string,
    messages: Message[],
    apiKey: string,
    onChunk: StreamingResponseHandler,
    params: GenerationParams,
  ): Promise<void> {
    try {
      const response = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: params.temperature ?? 0.7,
            top_p: params.topP,
            max_tokens: params.maxTokens,
            stream: true,
          }),
        },
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `Mistral API error: ${error.error?.message || response.statusText}`,
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body cannot be read");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onChunk(fullText, true);
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content || "";
              if (content) {
                fullText += content;
                onChunk(content, false);
              }
            } catch (e) {
              console.error("Error parsing SSE message:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming Mistral completion:", error);
      throw error;
    }
  }

  private async generateOllamaCompletion(
    modelId: string,
    messages: Message[],
    params: GenerationParams,
  ): Promise<string> {
    try {
      // Get Ollama endpoint from localStorage or use default
      const ollamaEndpoint =
        localStorage.getItem("ollama_endpoint") || "http://localhost:11434";
      const modelName = modelId.replace("ollama/", "");

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
            temperature: params.temperature ?? 0.7,
            top_p: params.topP,
            top_k: params.topK,
            num_predict: params.maxTokens,
          },
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(
          `Ollama API error: ${error.error || response.statusText}`,
        );
      }

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      console.error("Error generating Ollama completion:", error);
      throw error;
    }
  }

  private async streamOllamaCompletion(
    modelId: string,
    messages: Message[],
    onChunk: StreamingResponseHandler,
    params: GenerationParams,
  ): Promise<void> {
    try {
      // Get Ollama endpoint from localStorage or use default
      const ollamaEndpoint =
        localStorage.getItem("ollama_endpoint") || "http://localhost:11434";
      const modelName = modelId.replace("ollama/", "");

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
            temperature: params.temperature ?? 0.7,
            top_p: params.topP,
            top_k: params.topK,
            num_predict: params.maxTokens,
          },
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `Ollama API error: ${error.error || response.statusText}`,
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body cannot be read");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onChunk(fullText, true);
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });

        // Process JSON objects (one per line)
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message && json.message.content) {
              const content = json.message.content;
              fullText += content;
              onChunk(content, false);
            }
          } catch (e) {
            console.error("Error parsing Ollama response:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error streaming Ollama completion:", error);
      throw error;
    }
  }

  private async generateOpenRouterCompletion(
    modelId: string,
    messages: Message[],
    apiKey: string,
    params: GenerationParams,
  ): Promise<string> {
    try {
      // Extract the actual model ID without the openrouter/ prefix
      const actualModelId = modelId.replace("openrouter/", "");

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "AI Assistant",
          },
          body: JSON.stringify({
            model: actualModelId,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: params.temperature ?? 0.7,
            top_p: params.topP,
            top_k: params.topK,
            max_tokens: params.maxTokens,
            stop: params.stop,
          }),
        },
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(
          `OpenRouter API error: ${error.error || response.statusText}`,
        );
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating OpenRouter completion:", error);
      throw error;
    }
  }

  private async streamOpenRouterCompletion(
    modelId: string,
    messages: Message[],
    apiKey: string,
    onChunk: StreamingResponseHandler,
    params: GenerationParams,
  ): Promise<void> {
    try {
      // Extract the actual model ID without the openrouter/ prefix
      const actualModelId = modelId.replace("openrouter/", "");

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "AI Assistant",
          },
          body: JSON.stringify({
            model: actualModelId,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: params.temperature ?? 0.7,
            top_p: params.topP,
            top_k: params.topK,
            max_tokens: params.maxTokens,
            stop: params.stop,
            stream: true,
          }),
        },
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `OpenRouter API error: ${error.error || response.statusText}`,
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body cannot be read");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onChunk(fullText, true);
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content || "";
              if (content) {
                fullText += content;
                onChunk(content, false);
              }
            } catch (e) {
              console.error("Error parsing SSE message:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming OpenRouter completion:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const modelService = ModelIntegrationService.getInstance();

// Register default models
modelRegistry.registerModels([
  // OpenAI models
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "openai",
    description: "OpenAI's most capable model for complex tasks",
    capabilities: {
      streaming: true,
      multimodal: false,
      functionCalling: true,
      contextWindow: 8192,
      maxOutputTokens: 4096,
    },
    pricing: {
      input: 0.03,
      output: 0.06,
    },
    tags: ["powerful", "reasoning"],
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    description: "Improved version of GPT-4 with larger context window",
    capabilities: {
      streaming: true,
      multimodal: false,
      functionCalling: true,
      contextWindow: 128000,
      maxOutputTokens: 4096,
    },
    pricing: {
      input: 0.01,
      output: 0.03,
    },
    tags: ["powerful", "long context"],
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    description: "Fast and cost-effective model for most tasks",
    capabilities: {
      streaming: true,
      multimodal: false,
      functionCalling: true,
      contextWindow: 16385,
      maxOutputTokens: 4096,
    },
    pricing: {
      input: 0.0005,
      output: 0.0015,
    },
    tags: ["fast", "efficient"],
  },

  // Anthropic models
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "anthropic",
    description: "Anthropic's most powerful model for complex reasoning",
    capabilities: {
      streaming: true,
      multimodal: true,
      functionCalling: false,
      contextWindow: 200000,
      maxOutputTokens: 4096,
    },
    pricing: {
      input: 0.015,
      output: 0.075,
    },
    tags: ["powerful", "reasoning", "long context"],
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "anthropic",
    description: "Balanced performance and efficiency for most tasks",
    capabilities: {
      streaming: true,
      multimodal: true,
      functionCalling: false,
      contextWindow: 200000,
      maxOutputTokens: 4096,
    },
    pricing: {
      input: 0.003,
      output: 0.015,
    },
    tags: ["balanced", "long context"],
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    description: "Fast and efficient model for simpler tasks",
    capabilities: {
      streaming: true,
      multimodal: true,
      functionCalling: false,
      contextWindow: 200000,
      maxOutputTokens: 4096,
    },
    pricing: {
      input: 0.00025,
      output: 0.00125,
    },
    tags: ["fast", "efficient", "long context"],
  },

  // Mistral models
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    provider: "mistral",
    description: "Mistral AI's most powerful model",
    capabilities: {
      streaming: true,
      multimodal: false,
      functionCalling: false,
      contextWindow: 32768,
      maxOutputTokens: 8192,
    },
    pricing: {
      input: 0.008,
      output: 0.024,
    },
    tags: ["powerful", "long context"],
  },
  {
    id: "mistral-medium-latest",
    name: "Mistral Medium",
    provider: "mistral",
    description: "Balanced performance and efficiency",
    capabilities: {
      streaming: true,
      multimodal: false,
      functionCalling: false,
      contextWindow: 32768,
      maxOutputTokens: 8192,
    },
    pricing: {
      input: 0.0027,
      output: 0.0081,
    },
    tags: ["balanced", "long context"],
  },
  {
    id: "mistral-small-latest",
    name: "Mistral Small",
    provider: "mistral",
    description: "Fast and efficient model",
    capabilities: {
      streaming: true,
      multimodal: false,
      functionCalling: false,
      contextWindow: 32768,
      maxOutputTokens: 8192,
    },
    pricing: {
      input: 0.0007,
      output: 0.0021,
    },
    tags: ["fast", "efficient", "long context"],
  },

  // Google models
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "google",
    description: "Google's advanced model for complex tasks",
    capabilities: {
      streaming: false,
      multimodal: true,
      functionCalling: false,
      contextWindow: 32768,
      maxOutputTokens: 8192,
    },
    pricing: {
      input: 0.00125,
      output: 0.00375,
    },
    tags: ["powerful", "multimodal"],
  },

  // Hugging Face models
  {
    id: "mistralai/Mistral-7B-Instruct-v0.2",
    name: "Mistral 7B",
    provider: "hugging face",
    description: "Open-source 7B parameter model",
    capabilities: {
      streaming: false,
      multimodal: false,
      functionCalling: false,
      contextWindow: 8192,
      maxOutputTokens: 2048,
    },
    tags: ["open-source", "efficient"],
  },
  {
    id: "meta-llama/Llama-2-70b-chat-hf",
    name: "Llama 2 (70B)",
    provider: "hugging face",
    description: "Meta's powerful open-source model",
    capabilities: {
      streaming: false,
      multimodal: false,
      functionCalling: false,
      contextWindow: 4096,
      maxOutputTokens: 2048,
    },
    tags: ["open-source", "powerful"],
  },
]);
