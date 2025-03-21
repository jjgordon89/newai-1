/**
 * AI Model Integration
 * This file provides a simplified API for integrating with AI models
 */

// Model provider types
export type ModelProvider =
  | "openai"
  | "anthropic"
  | "mistral"
  | "google"
  | "huggingface";

// Common interface for model responses
export interface ModelResponse {
  text: string;
  model: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  provider: ModelProvider;
  finishReason?: string;
}

// Common interface for model request options
export interface ModelRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
  onStream?: (chunk: string) => void;
}

/**
 * AI Model Integration Service
 * Provides a unified interface for interacting with various AI models
 */
export class AIModelIntegration {
  private static instance: AIModelIntegration;
  private defaultProvider: ModelProvider = "openai";
  private defaultModel: string = "gpt-3.5-turbo";

  private constructor() {
    // Initialize with default settings
    this.loadPreferences();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): AIModelIntegration {
    if (!AIModelIntegration.instance) {
      AIModelIntegration.instance = new AIModelIntegration();
    }
    return AIModelIntegration.instance;
  }

  /**
   * Load user preferences for models
   */
  private loadPreferences(): void {
    try {
      const savedProvider = localStorage.getItem("preferred_model_provider");
      const savedModel = localStorage.getItem("preferred_model");

      if (savedProvider) {
        this.defaultProvider = savedProvider as ModelProvider;
      }

      if (savedModel) {
        this.defaultModel = savedModel;
      }
    } catch (error) {
      console.error("Error loading model preferences:", error);
    }
  }

  /**
   * Save user preferences for models
   */
  private savePreferences(): void {
    try {
      localStorage.setItem("preferred_model_provider", this.defaultProvider);
      localStorage.setItem("preferred_model", this.defaultModel);
    } catch (error) {
      console.error("Error saving model preferences:", error);
    }
  }

  /**
   * Set the default model provider and model
   */
  public setDefaultModel(provider: ModelProvider, model: string): void {
    this.defaultProvider = provider;
    this.defaultModel = model;
    this.savePreferences();
  }

  /**
   * Get the default model provider and model
   */
  public getDefaultModel(): { provider: ModelProvider; model: string } {
    return {
      provider: this.defaultProvider,
      model: this.defaultModel,
    };
  }

  /**
   * Check if a provider is configured (has API key)
   */
  public isProviderConfigured(provider: ModelProvider): boolean {
    // Mock implementation - in a real app, this would check for API keys
    return true;
  }

  /**
   * Get all available (configured) providers
   */
  public getAvailableProviders(): ModelProvider[] {
    // Mock implementation - in a real app, this would return only configured providers
    return ["openai", "anthropic", "mistral", "google", "huggingface"];
  }

  /**
   * Get available models for a provider
   */
  public async getAvailableModels(provider: ModelProvider): Promise<string[]> {
    // Mock implementation - in a real app, this would fetch models from the provider
    switch (provider) {
      case "openai":
        return ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"];
      case "anthropic":
        return ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"];
      case "mistral":
        return ["mistral-small", "mistral-medium", "mistral-large"];
      case "google":
        return ["gemini-pro", "gemini-ultra"];
      case "huggingface":
        return ["llama-3", "falcon", "mistral"];
      default:
        return [];
    }
  }

  /**
   * Generate text using the specified model and provider
   */
  public async generateText(
    prompt: string,
    provider?: ModelProvider,
    model?: string,
    options?: ModelRequestOptions,
  ): Promise<ModelResponse> {
    const useProvider = provider || this.defaultProvider;
    const useModel = model || this.defaultModel;

    // Mock implementation - in a real app, this would call the actual provider API
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

    return {
      text: `This is a simulated response for the prompt: "${prompt.substring(0, 30)}..."`,
      model: useModel,
      provider: useProvider,
      usage: {
        prompt_tokens: prompt.length,
        completion_tokens: 50,
        total_tokens: prompt.length + 50,
      },
      finishReason: "stop",
    };
  }

  /**
   * Generate embeddings for a text
   */
  public async generateEmbeddings(
    text: string,
    provider?: ModelProvider,
    model?: string,
  ): Promise<number[]> {
    // Mock implementation - in a real app, this would call the actual embedding API
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

    // Return a mock embedding vector (32-dimensional)
    return Array(32)
      .fill(0)
      .map(() => Math.random());
  }
}

// Export a singleton instance
export const aiModelIntegration = AIModelIntegration.getInstance();

export default aiModelIntegration;
