/**
 * Document Embedding Pipeline
 *
 * Provides a pipeline for processing and embedding documents
 */

import {
  HuggingFaceEmbeddingGenerator,
  EmbeddingVector,
} from "./huggingFaceEmbeddings";
import { EmbeddingModel } from "./api";
import globalEmbeddingCache from "./embeddingCache";

export interface EmbeddingPipelineOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  batchSize?: number;
  useCache?: boolean;
  modelId?: string;
}

export interface DocumentChunk {
  id?: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface EmbeddedChunk extends DocumentChunk {
  embedding: EmbeddingVector;
  modelId: string;
}

/**
 * Document Embedding Pipeline
 *
 * Handles the process of chunking and embedding documents
 */
export class EmbeddingPipeline {
  private embeddingGenerator: HuggingFaceEmbeddingGenerator;
  private options: Required<EmbeddingPipelineOptions>;

  constructor(options: EmbeddingPipelineOptions = {}) {
    this.options = {
      chunkSize: options.chunkSize || 1000,
      chunkOverlap: options.chunkOverlap || 200,
      batchSize: options.batchSize || 10,
      useCache: options.useCache !== undefined ? options.useCache : true,
      modelId: options.modelId || "BAAI/bge-small-en-v1.5",
    };

    this.embeddingGenerator = new HuggingFaceEmbeddingGenerator(
      this.options.modelId,
      this.options.useCache,
    );
  }

  /**
   * Set the embedding model
   */
  setModel(modelId: string): void {
    this.options.modelId = modelId;
    this.embeddingGenerator.setModel(modelId);
  }

  /**
   * Get the current embedding model
   */
  getModel(): EmbeddingModel {
    return this.embeddingGenerator.getModelInfo();
  }

  /**
   * Enable or disable caching
   */
  setCaching(enabled: boolean): void {
    this.options.useCache = enabled;
    this.embeddingGenerator.setCaching(enabled);
  }

  /**
   * Split text into chunks
   */
  chunkText(text: string): string[] {
    if (!text) return [];

    const { chunkSize, chunkOverlap } = this.options;
    const chunks: string[] = [];

    // Simple chunking by character count
    // A more sophisticated implementation would respect sentence/paragraph boundaries
    let i = 0;
    while (i < text.length) {
      const chunk = text.slice(i, i + chunkSize);
      chunks.push(chunk);
      i += chunkSize - chunkOverlap;
    }

    return chunks;
  }

  /**
   * Process a document into chunks
   */
  processDocument(document: {
    text: string;
    metadata?: Record<string, any>;
  }): DocumentChunk[] {
    const textChunks = this.chunkText(document.text);

    return textChunks.map((text, index) => ({
      text,
      metadata: {
        ...document.metadata,
        chunkIndex: index,
        totalChunks: textChunks.length,
      },
    }));
  }

  /**
   * Embed a single chunk
   */
  async embedChunk(chunk: DocumentChunk): Promise<EmbeddedChunk> {
    const embedding = await this.embeddingGenerator.generateEmbedding(
      chunk.text,
    );

    return {
      ...chunk,
      embedding,
      modelId: this.options.modelId,
    };
  }

  /**
   * Embed multiple chunks in batches
   */
  async embedChunks(chunks: DocumentChunk[]): Promise<EmbeddedChunk[]> {
    const result: EmbeddedChunk[] = [];
    const { batchSize } = this.options;

    // Process in batches
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchTexts = batch.map((chunk) => chunk.text);

      // Generate embeddings for the batch
      const embeddings =
        await this.embeddingGenerator.generateBatchEmbeddings(batchTexts);

      // Combine chunks with their embeddings
      for (let j = 0; j < batch.length; j++) {
        result.push({
          ...batch[j],
          embedding: embeddings[j],
          modelId: this.options.modelId,
        });
      }

      // Log progress
      console.log(
        `Embedded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`,
      );
    }

    return result;
  }

  /**
   * Process and embed a document in one step
   */
  async processAndEmbedDocument(document: {
    text: string;
    metadata?: Record<string, any>;
  }): Promise<EmbeddedChunk[]> {
    const chunks = this.processDocument(document);
    return this.embedChunks(chunks);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; modelCount: number } {
    return this.embeddingGenerator.getCacheStats();
  }

  /**
   * Clear cache for the current model
   */
  clearCache(): void {
    this.embeddingGenerator.clearModelCache();
  }
}

/**
 * Create an embedding pipeline with the specified options
 */
export function createEmbeddingPipeline(
  options?: EmbeddingPipelineOptions,
): EmbeddingPipeline {
  return new EmbeddingPipeline(options);
}
