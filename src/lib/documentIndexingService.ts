/**
 * Document Indexing Service
 *
 * Handles the process of indexing documents into the vector database
 */

import { v4 as uuidv4 } from "uuid";
import { HuggingFaceEmbeddingGenerator } from "./huggingFaceEmbeddings";
import { getOrCreateVectorStore } from "./lanceDbService";

export interface DocumentChunk {
  id?: string;
  text: string;
  metadata: Record<string, any>;
}

export interface IndexingOptions {
  batchSize: number;
  embeddingModelId: string;
  workspaceId: string;
}

export interface IndexingResult {
  documentId: string;
  chunkCount: number;
  success: boolean;
  error?: string;
}

/**
 * Document Indexing Service
 * Handles the process of indexing document chunks into the vector database
 */
export class DocumentIndexingService {
  private embeddingGenerator: HuggingFaceEmbeddingGenerator;
  private options: IndexingOptions;

  constructor(
    embeddingGenerator: HuggingFaceEmbeddingGenerator,
    options: Partial<IndexingOptions> = {},
  ) {
    this.embeddingGenerator = embeddingGenerator;
    this.options = {
      batchSize: options.batchSize || 10,
      embeddingModelId: options.embeddingModelId || "BAAI/bge-small-en-v1.5",
      workspaceId: options.workspaceId || "default",
    };
  }

  /**
   * Set the workspace ID for indexing
   */
  setWorkspaceId(workspaceId: string): void {
    this.options.workspaceId = workspaceId;
  }

  /**
   * Update the embedding model
   */
  setEmbeddingModel(modelId: string): void {
    this.options.embeddingModelId = modelId;
    this.embeddingGenerator.setModel(modelId);
  }

  /**
   * Index a single document chunk
   */
  async indexChunk(chunk: DocumentChunk): Promise<string> {
    try {
      // Generate embedding for the chunk
      const embedding = await this.embeddingGenerator.generateEmbedding(
        chunk.text,
      );

      // Get the vector store for the current workspace
      const vectorStore = getOrCreateVectorStore(this.options.workspaceId);

      // Add the document to the vector store
      const id = await vectorStore.addDocument(
        chunk.text,
        embedding.values,
        chunk.metadata,
      );

      return id;
    } catch (error) {
      console.error("Error indexing document chunk:", error);
      throw error;
    }
  }

  /**
   * Process and index document chunks with batching
   */
  async processDocumentChunks(
    chunks: DocumentChunk[],
  ): Promise<IndexingResult> {
    if (chunks.length === 0) {
      return {
        documentId: "",
        chunkCount: 0,
        success: false,
        error: "No chunks provided",
      };
    }

    const documentId = uuidv4();
    let processedChunks = 0;

    try {
      // Add document ID to metadata for all chunks
      const chunksWithDocId = chunks.map((chunk) => ({
        ...chunk,
        metadata: { ...chunk.metadata, documentId },
      }));

      // Process in batches
      for (let i = 0; i < chunksWithDocId.length; i += this.options.batchSize) {
        const batch = chunksWithDocId.slice(i, i + this.options.batchSize);

        // Process each chunk in the batch
        const promises = batch.map((chunk) => this.indexChunk(chunk));
        await Promise.all(promises);

        processedChunks += batch.length;
        console.log(
          `Indexed batch ${Math.floor(i / this.options.batchSize) + 1}/${Math.ceil(chunksWithDocId.length / this.options.batchSize)}`,
        );
      }

      return {
        documentId,
        chunkCount: processedChunks,
        success: true,
      };
    } catch (error) {
      console.error("Error processing document chunks:", error);
      return {
        documentId,
        chunkCount: processedChunks,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Delete all chunks for a document
   */
  async deleteDocumentChunks(documentId: string): Promise<boolean> {
    try {
      // Get the vector store for the current workspace
      const vectorStore = getOrCreateVectorStore(this.options.workspaceId);

      // In a real implementation, we would search for chunks with this document ID
      // and delete them. For now, we'll just log the intention.
      console.log(
        `Would delete chunks for document ${documentId} from workspace ${this.options.workspaceId}`,
      );

      return true;
    } catch (error) {
      console.error(`Error deleting chunks for document ${documentId}:`, error);
      return false;
    }
  }
}

/**
 * Create a document indexing service
 */
export function createDocumentIndexingService(
  embeddingGenerator: HuggingFaceEmbeddingGenerator,
  options?: Partial<IndexingOptions>,
): DocumentIndexingService {
  return new DocumentIndexingService(embeddingGenerator, options);
}
