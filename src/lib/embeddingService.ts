/**
 * Embedding Service
 *
 * Provides a unified interface for working with different embedding models
 */

import {
  HuggingFaceEmbeddingGenerator,
  EmbeddingVector,
} from "./huggingFaceEmbeddings";
import { EmbeddingPipeline } from "./embeddingPipeline";
import { EmbeddingModel, EMBEDDING_MODELS } from "./api";
import globalEmbeddingCache from "./embeddingCache";

// Registry of embedding generators by model ID
const embeddingGenerators = new Map<string, HuggingFaceEmbeddingGenerator>();

/**
 * Get or create an embedding generator for a specific model
 */
export function getEmbeddingGenerator(
  modelId: string,
  useCache: boolean = true,
): HuggingFaceEmbeddingGenerator {
  // Check if we already have a generator for this model
  if (embeddingGenerators.has(modelId)) {
    const generator = embeddingGenerators.get(modelId)!;
    // Update cache setting if needed
    generator.setCaching(useCache);
    return generator;
  }

  // Create a new generator
  const generator = new HuggingFaceEmbeddingGenerator(modelId, useCache);
  embeddingGenerators.set(modelId, generator);
  return generator;
}

/**
 * Get all available embedding models
 */
export function getAvailableEmbeddingModels(): EmbeddingModel[] {
  return [...EMBEDDING_MODELS];
}

/**
 * Get embedding models by category
 */
export function getEmbeddingModelsByCategory(
  category: string,
): EmbeddingModel[] {
  return EMBEDDING_MODELS.filter((model) => model.category === category);
}

/**
 * Generate an embedding for a single text
 */
export async function generateEmbedding(
  text: string,
  modelId: string = "BAAI/bge-small-en-v1.5",
  useCache: boolean = true,
): Promise<EmbeddingVector> {
  const generator = getEmbeddingGenerator(modelId, useCache);
  return generator.generateEmbedding(text);
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(
  texts: string[],
  modelId: string = "BAAI/bge-small-en-v1.5",
  useCache: boolean = true,
): Promise<EmbeddingVector[]> {
  const generator = getEmbeddingGenerator(modelId, useCache);
  return generator.generateBatchEmbeddings(texts);
}

/**
 * Create an embedding pipeline for document processing
 */
export function createEmbeddingPipeline(
  modelId: string = "BAAI/bge-small-en-v1.5",
  options: {
    chunkSize?: number;
    chunkOverlap?: number;
    batchSize?: number;
    useCache?: boolean;
  } = {},
): EmbeddingPipeline {
  return new EmbeddingPipeline({
    modelId,
    ...options,
  });
}

/**
 * Get cache statistics
 */
export function getEmbeddingCacheStats(): {
  totalSize: number;
  modelDistribution: Record<string, number>;
} {
  return globalEmbeddingCache.getStats();
}

/**
 * Clear the entire embedding cache
 */
export function clearEmbeddingCache(): void {
  globalEmbeddingCache.clear();
}

/**
 * Clear cache for a specific model
 */
export function clearModelCache(modelId: string): void {
  // Note: This is a simplified implementation that clears the entire cache
  // A more sophisticated implementation would only clear entries for the specified model
  globalEmbeddingCache.clear();
}

/**
 * Embedding service object for export
 */
export const EmbeddingService = {
  getGenerator: getEmbeddingGenerator,
  getAvailableModels: getAvailableEmbeddingModels,
  getModelsByCategory: getEmbeddingModelsByCategory,
  generateEmbedding,
  generateEmbeddings,
  createPipeline: createEmbeddingPipeline,
  getCacheStats: getEmbeddingCacheStats,
  clearCache: clearEmbeddingCache,
  clearModelCache,
};

export default EmbeddingService;
