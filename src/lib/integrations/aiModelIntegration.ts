/**
 * AI Model Integration Service
 *
 * Provides a unified interface for interacting with various AI models
 * from different providers (OpenAI, Anthropic, Mistral, etc.)
 */

import { openaiService } from "../openaiService";
import { anthropicService } from "../anthropicService";
import { mistralService } from "../mistralService";

export type ModelProvider =
  | "openai"
  | "anthropic"
  | "mistral"
  | "google"
  | "huggingface"
  | "ollama";

export interface ModelConfig {
  id: string;
  provider: ModelProvider;
  name: string;
  capabilities: Array<
    "text" | "embedding" | "vision" | "audio" | "function-calling"
  >;
  contextWindow: number;
  maxTokens: number;
  costPer1kTokens?: number;
  specialties?: string[];
  enabled: boolean;
}

export interface ModelRequestOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  functions?: any[];
  images?: string[];
  stopSequences?: string[];
}

export interface ModelResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: ModelProvider;
  finishReason?: string;
  functionCalls?: any[];
}

export class AiModelIntegration {
  private models: Map<string, ModelConfig> = new Map();
  private defaultModelId: string | null = null;

  constructor() {
    // Register default models
    this.registerModel({
      id: "gpt-4",
      provider: "openai",
      name: "GPT-4",
      capabilities: ["text", "function-calling"],
      contextWindow: 8192,
      maxTokens: 4096,
      costPer1kTokens: 0.03,
      specialties: ["reasoning", "coding", "general-knowledge"],
      enabled: true,
    });

    this.registerModel({
      id: "claude-3-opus",
      provider: "anthropic",
      name: "Claude 3 Opus",
      capabilities: ["text", "vision"],
      contextWindow: 200000,
      maxTokens: 4096,
      costPer1kTokens: 0.015,
      specialties: ["document-analysis", "reasoning", "creative-writing"],
      enabled: true,
    });

    this.registerModel({
      id: "mistral-large",
      provider: "mistral",
      name: "Mistral Large",
      capabilities: ["text", "function-calling"],
      contextWindow: 32768,
      maxTokens: 8192,
      costPer1kTokens: 0.008,
      specialties: ["knowledge-tasks", "summarization"],
      enabled: true,
    });

    // Set default model
    this.defaultModelId = "gpt-4";
  }

  /**
   * Register a new AI model
   */
  registerModel(config: ModelConfig): void {
    this.models.set(config.id, config);
    console.log(
      `Registered model: ${config.name} (${config.id}) from ${config.provider}`,
    );
  }

  /**
   * Remove a model
   */
  removeModel(id: string): boolean {
    return this.models.delete(id);
  }

  /**
   * Get all registered models
   */
  getModels(): ModelConfig[] {
    return Array.from(this.models.values());
  }

  /**
   * Get models by provider
   */
  getModelsByProvider(provider: ModelProvider): ModelConfig[] {
    return Array.from(this.models.values()).filter(
      (model) => model.provider === provider,
    );
  }

  /**
   * Get models by capability
   */
  getModelsByCapability(capability: string): ModelConfig[] {
    return Array.from(this.models.values()).filter((model) =>
      model.capabilities.includes(capability as any),
    );
  }

  /**
   * Set the default model
   */
  setDefaultModel(id: string): void {
    if (!this.models.has(id)) {
      throw new Error(`Model not found: ${id}`);
    }
    this.defaultModelId = id;
  }

  /**
   * Get the default model
   */
  getDefaultModel(): ModelConfig | null {
    return this.defaultModelId
      ? this.models.get(this.defaultModelId) || null
      : null;
  }

  /**
   * Generate text using a specified model
   */
  async generateText(
    modelId: string | null,
    options: ModelRequestOptions,
  ): Promise<ModelResponse> {
    const model = modelId ? this.models.get(modelId) : this.getDefaultModel();

    if (!model) {
      throw new Error(`Model not found${modelId ? `: ${modelId}` : ""}`);
    }

    if (!model.enabled) {
      throw new Error(`Model ${model.id} is disabled`);
    }

    try {
      switch (model.provider) {
        case "openai":
          return await this.generateWithOpenAI(model, options);
        case "anthropic":
          return await this.generateWithAnthropic(model, options);
        case "mistral":
          return await this.generateWithMistral(model, options);
        default:
          throw new Error(`Unsupported model provider: ${model.provider}`);
      }
    } catch (error) {
      console.error(`Error generating text with ${model.name}:`, error);
      throw new Error(
        `Text generation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Generate text using OpenAI
   */
  private async generateWithOpenAI(
    model: ModelConfig,
    options: ModelRequestOptions,
  ): Promise<ModelResponse> {
    const response = await openaiService.generateText({
      model: model.id,
      prompt: options.prompt,
      systemPrompt: options.systemPrompt,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? model.maxTokens,
      functions: options.functions,
      stream: options.stream ?? false,
    });

    return {
      text: response.text,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model: model.id,
      provider: "openai",
      finishReason: response.finish_reason,
      functionCalls: response.function_calls,
    };
  }

  /**
   * Generate text using Anthropic
   */
  private async generateWithAnthropic(
    model: ModelConfig,
    options: ModelRequestOptions,
  ): Promise<ModelResponse> {
    const response = await anthropicService.generateText({
      model: model.id,
      prompt: options.prompt,
      system: options.systemPrompt,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? model.maxTokens,
      stream: options.stream ?? false,
    });

    return {
      text: response.text,
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens:
          (response.usage?.input_tokens || 0) +
          (response.usage?.output_tokens || 0),
      },
      model: model.id,
      provider: "anthropic",
      finishReason: response.stop_reason,
    };
  }

  /**
   * Generate text using Mistral
   */
  private async generateWithMistral(
    model: ModelConfig,
    options: ModelRequestOptions,
  ): Promise<ModelResponse> {
    const response = await mistralService.generateText({
      model: model.id,
      prompt: options.prompt,
      systemPrompt: options.systemPrompt,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? model.maxTokens,
      stream: options.stream ?? false,
    });

    return {
      text: response.text,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model: model.id,
      provider: "mistral",
      finishReason: response.finish_reason,
    };
  }

  /**
   * Recommend the best model for a specific task
   */
  recommendModelForTask(
    task: string,
    documentType?: string,
  ): ModelConfig | null {
    // Simple task-based model recommendation
    const enabledModels = Array.from(this.models.values()).filter(
      (model) => model.enabled,
    );

    if (enabledModels.length === 0) {
      return null;
    }

    // Map tasks to specialties
    const taskToSpecialty: Record<string, string> = {
      summarization: "summarization",
      "question-answering": "knowledge-tasks",
      "document-analysis": "document-analysis",
      "code-generation": "coding",
      "creative-writing": "creative-writing",
      reasoning: "reasoning",
    };

    // Map document types to preferred providers
    const documentTypeToProvider: Record<string, ModelProvider> = {
      pdf: "anthropic",
      docx: "anthropic",
      spreadsheet: "openai",
      code: "openai",
      image: "anthropic",
    };

    // First try to match by task specialty
    const specialty = taskToSpecialty[task];
    if (specialty) {
      const matchingModels = enabledModels.filter((model) =>
        model.specialties?.includes(specialty),
      );

      if (matchingModels.length > 0) {
        // If document type is specified, try to match provider
        if (documentType && documentTypeToProvider[documentType]) {
          const preferredProvider = documentTypeToProvider[documentType];
          const preferredModels = matchingModels.filter(
            (model) => model.provider === preferredProvider,
          );

          if (preferredModels.length > 0) {
            // Return the model with the largest context window
            return preferredModels.sort(
              (a, b) => b.contextWindow - a.contextWindow,
            )[0];
          }
        }

        // Return the model with the largest context window
        return matchingModels.sort(
          (a, b) => b.contextWindow - a.contextWindow,
        )[0];
      }
    }

    // If no specialty match, try to match by document type
    if (documentType && documentTypeToProvider[documentType]) {
      const preferredProvider = documentTypeToProvider[documentType];
      const preferredModels = enabledModels.filter(
        (model) => model.provider === preferredProvider,
      );

      if (preferredModels.length > 0) {
        return preferredModels.sort(
          (a, b) => b.contextWindow - a.contextWindow,
        )[0];
      }
    }

    // Fall back to default model or the model with the largest context window
    return (
      this.getDefaultModel() ||
      enabledModels.sort((a, b) => b.contextWindow - a.contextWindow)[0]
    );
  }
}

// Create a singleton instance
const aiModelIntegration = new AiModelIntegration();
export default aiModelIntegration;
