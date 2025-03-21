/**
 * Hugging Face Embedding Models Integration
 *
 * This file provides integration with Hugging Face embedding models for the RAG system.
 */

// Define the EmbeddingVector type directly here to avoid circular dependencies
export interface EmbeddingVector {
  values: number[];
  dimensions: number;
}

// Define the EmbeddingGenerator interface directly here to match our implementation
export interface EmbeddingGenerator {
  generateEmbedding(text: string): Promise<EmbeddingVector>;
  generateEmbeddings(texts: string[]): Promise<number[][]>;
}

import {
  createEmbeddings,
  getCurrentEmbeddingModel,
  setEmbeddingModel,
  EmbeddingModel,
  EMBEDDING_MODELS,
} from "./api";
import globalEmbeddingCache from "./embeddingCache";

/**
 * Hugging Face Embedding Generator implementation
 * Uses the Hugging Face API to generate real embeddings
 */
export class HuggingFaceEmbeddingGenerator implements EmbeddingGenerator {
  private modelId: string;
  private useCache: boolean;

  constructor(modelId?: string, useCache: boolean = true) {
    // Use provided model or get the current one from settings
    this.modelId = modelId || getCurrentEmbeddingModel().id;
    this.useCache = useCache;
  }

  /**
   * Get the current embedding model ID
   */
  getModelId(): string {
    return this.modelId;
  }

  /**
   * Set the embedding model
   * @param modelId The model ID to use
   */
  setModel(modelId: string): void {
    const model = EMBEDDING_MODELS.find((m) => m.id === modelId);
    if (!model) {
      throw new Error(`Embedding model ${modelId} not found`);
    }
    this.modelId = modelId;
    setEmbeddingModel(modelId);
  }

  /**
   * Enable or disable caching
   */
  setCaching(enabled: boolean): void {
    this.useCache = enabled;
  }

  /**
   * Get information about the current embedding model
   */
  getModelInfo(): EmbeddingModel {
    return (
      EMBEDDING_MODELS.find((m) => m.id === this.modelId) ||
      getCurrentEmbeddingModel()
    );
  }

  /**
   * Generate embeddings for a text using the Hugging Face API
   * @param text The text to embed
   * @returns A promise resolving to an embedding vector
   */
  async generateEmbedding(text: string): Promise<EmbeddingVector> {
    try {
      // Check cache first if enabled
      if (this.useCache) {
        const cachedVector = globalEmbeddingCache.get(text, this.modelId);
        if (cachedVector) {
          return cachedVector;
        }
      }

      const embedding = await createEmbeddings([text], this.modelId);

      if (!embedding || !embedding[0] || !Array.isArray(embedding[0])) {
        throw new Error("Failed to generate embedding");
      }

      const modelInfo = this.getModelInfo();

      const vector = {
        dimensions: modelInfo.dimensions,
        values: embedding[0],
      };

      // Store in cache if enabled
      if (this.useCache) {
        globalEmbeddingCache.set(text, vector, this.modelId);
      }

      return vector;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts
   * Required by the EmbeddingGenerator interface
   * @param texts Array of texts to embed
   * @returns A promise resolving to an array of embedding arrays
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // If caching is enabled, check cache for each text
      if (this.useCache) {
        const results: number[][] = [];
        const textsToEmbed: string[] = [];
        const indices: number[] = [];

        // Check cache for each text
        for (let i = 0; i < texts.length; i++) {
          const cachedVector = globalEmbeddingCache.get(texts[i], this.modelId);
          if (cachedVector) {
            results[i] = cachedVector.values;
          } else {
            textsToEmbed.push(texts[i]);
            indices.push(i);
          }
        }

        // If all texts were in cache, return results
        if (textsToEmbed.length === 0) {
          return results;
        }

        // Generate embeddings for texts not in cache
        const newEmbeddings = await createEmbeddings(
          textsToEmbed,
          this.modelId,
        );
        const modelInfo = this.getModelInfo();

        // Store new embeddings in cache and results
        for (let i = 0; i < newEmbeddings.length; i++) {
          const vector = {
            dimensions: modelInfo.dimensions,
            values: newEmbeddings[i],
          };
          globalEmbeddingCache.set(textsToEmbed[i], vector, this.modelId);
          results[indices[i]] = newEmbeddings[i];
        }

        return results;
      }

      // If caching is disabled, generate all embeddings
      return await createEmbeddings(texts, this.modelId);
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts Array of texts to embed
   * @returns A promise resolving to an array of embedding vectors
   */
  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingVector[]> {
    try {
      // If caching is enabled, check cache for each text
      if (this.useCache) {
        const results: EmbeddingVector[] = new Array(texts.length);
        const textsToEmbed: string[] = [];
        const indices: number[] = [];

        // Check cache for each text
        for (let i = 0; i < texts.length; i++) {
          const cachedVector = globalEmbeddingCache.get(texts[i], this.modelId);
          if (cachedVector) {
            results[i] = cachedVector;
          } else {
            textsToEmbed.push(texts[i]);
            indices.push(i);
          }
        }

        // If all texts were in cache, return results
        if (textsToEmbed.length === 0) {
          return results;
        }

        // Generate embeddings for texts not in cache
        const newEmbeddings = await createEmbeddings(
          textsToEmbed,
          this.modelId,
        );
        const modelInfo = this.getModelInfo();

        // Store new embeddings in cache and results
        for (let i = 0; i < newEmbeddings.length; i++) {
          const vector = {
            dimensions: modelInfo.dimensions,
            values: newEmbeddings[i],
          };
          globalEmbeddingCache.set(textsToEmbed[i], vector, this.modelId);
          results[indices[i]] = vector;
        }

        return results;
      }

      // If caching is disabled, generate all embeddings
      const embeddings = await createEmbeddings(texts, this.modelId);
      const modelInfo = this.getModelInfo();

      return embeddings.map((embedding) => ({
        dimensions: modelInfo.dimensions,
        values: embedding,
      }));
    } catch (error) {
      console.error("Error generating batch embeddings:", error);
      throw error;
    }
  }

  /**
   * Get all available embedding models
   */
  getAvailableModels(): EmbeddingModel[] {
    return [...EMBEDDING_MODELS];
  }

  /**
   * Get cache statistics for this model
   */
  getCacheStats(): { size: number; modelCount: number } {
    const stats = globalEmbeddingCache.getStats();
    return {
      size: stats.size,
      modelCount: stats.modelDistribution[this.modelId] || 0,
    };
  }

  /**
   * Clear cache for this model
   */
  clearModelCache(): void {
    // Note: This is a simplified implementation that clears the entire cache
    // A more sophisticated implementation would only clear entries for this model
    globalEmbeddingCache.clear();
  }
}

/**
 * Factory function to create a configured HuggingFaceEmbeddingGenerator
 * @param modelId Optional model ID to use
 * @param useCache Whether to use caching (default: true)
 * @returns Configured HuggingFaceEmbeddingGenerator instance
 */
export function createHuggingFaceEmbeddingGenerator(
  modelId?: string,
  useCache: boolean = true,
): HuggingFaceEmbeddingGenerator {
  return new HuggingFaceEmbeddingGenerator(modelId, useCache);
}
