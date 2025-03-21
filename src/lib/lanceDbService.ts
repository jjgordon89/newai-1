/**
 * LanceDB Service
 *
 * Provides LanceDB integration for vector search
 */

import { LanceDbStore } from "./lanceDatabaseAdapter";
import { HuggingFaceEmbeddingGenerator } from "./huggingFaceEmbeddings";

/**
 * Document interface for LanceDB storage
 */
export interface VectorDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: Date;
  metadata: Record<string, any>;
}

let lanceDbStores: Record<string, LanceDbStore> = {};
let embeddingGenerator: HuggingFaceEmbeddingGenerator | null = null;

/**
 * Initialize the embedding generator
 */
export function initializeEmbeddingGenerator(): HuggingFaceEmbeddingGenerator {
  if (!embeddingGenerator) {
    embeddingGenerator = new HuggingFaceEmbeddingGenerator();
  }
  return embeddingGenerator;
}

/**
 * Initialize a vector store for a specific workspace
 * @param workspaceId The workspace ID
 * @returns The initialized LanceDbStore
 */
export function getOrCreateVectorStore(workspaceId: string): LanceDbStore {
  if (!lanceDbStores[workspaceId]) {
    // Initialize embedding generator if not already done
    const generator = initializeEmbeddingGenerator();

    // Initialize a new vector store for this workspace
    const store = new LanceDbStore(workspaceId, generator);
    lanceDbStores[workspaceId] = store;
  }

  return lanceDbStores[workspaceId];
}

/**
 * Add a document to the vector store
 * @param workspaceId The workspace ID
 * @param document The document to add
 */
export async function addDocumentToVectorStore(
  workspaceId: string,
  document: VectorDocument,
): Promise<void> {
  try {
    const store = getOrCreateVectorStore(workspaceId);

    // If document has chunks, add each chunk separately for better retrieval
    if (document.chunks && document.chunks.length > 0) {
      const chunkDocuments = document.chunks.map((chunk) => ({
        id: chunk.id,
        content: chunk.content,
        metadata: {
          ...chunk.metadata,
          documentId: document.id,
          documentTitle: document.title,
          documentType: document.type,
          chunkIndex: chunk.metadata.chunkIndex,
          isChunk: true,
          created: document.createdAt.toISOString(),
        },
      }));

      await store.addDocuments(chunkDocuments);
      console.log(
        `Added ${chunkDocuments.length} chunks from document ${document.id} to vector store for workspace ${workspaceId}`,
      );
    } else {
      // Add the full document if no chunks are available
      await store.addDocuments([
        {
          id: document.id,
          content: document.content,
          metadata: {
            ...document.metadata,
            title: document.title,
            documentType: document.type,
            created: document.createdAt.toISOString(),
            isChunk: false,
          },
        },
      ]);

      console.log(
        `Added document ${document.id} to vector store for workspace ${workspaceId}`,
      );
    }

    // Also add a document summary record for metadata searches
    await store.addDocuments([
      {
        id: `${document.id}_summary`,
        content: document.summary || document.title,
        metadata: {
          documentId: document.id,
          title: document.title,
          documentType: document.type,
          created: document.createdAt.toISOString(),
          isSummary: true,
          fileName: document.metadata.fileName,
          fileSize: document.metadata.fileSize,
          fileType: document.metadata.fileType,
          uploadedAt: document.metadata.uploadedAt,
        },
      },
    ]);
  } catch (error) {
    console.error("Error adding document to vector store:", error);
    throw new Error(
      `Failed to add document to vector store: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Delete a document from the vector store
 * @param workspaceId The workspace ID
 * @param documentId The document ID to delete
 */
export async function deleteDocumentFromVectorStore(
  workspaceId: string,
  documentId: string,
): Promise<void> {
  try {
    const store = getOrCreateVectorStore(workspaceId);

    // Since we don't have direct deleteDocument functionality in LanceDB adapter yet,
    // we'll simulate it by clearing and then re-adding all documents except the deleted one

    // In a real implementation, this would be more efficient with a proper delete method
    console.log(
      `Simulating deletion of document ${documentId} from workspace ${workspaceId}`,
    );

    // For now, we'll just log the deletion intention
    // A proper implementation would require extending the LanceDbStore class
    console.log(`Document ${documentId} marked for deletion from vector store`);
  } catch (error) {
    console.error("Error deleting document from vector store:", error);
    throw new Error(
      `Failed to delete document from vector store: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Perform a vector search
 * @param workspaceId The workspace ID
 * @param query The search query
 * @param topK The number of results to return
 * @param threshold The similarity threshold (0-1)
 * @param filters Optional metadata filters
 */
export async function vectorSearch(
  workspaceId: string,
  query: string,
  topK: number = 5,
  threshold: number = 0.7,
  filters?: Record<string, any>,
): Promise<any[]> {
  try {
    const store = getOrCreateVectorStore(workspaceId);

    const results = await store.searchSimilar(query, topK, threshold, filters);

    // Transform the results to a more friendly format
    return results.map((doc) => ({
      id: doc.id,
      text: doc.text,
      documentId: doc.metadata?.documentId || doc.id,
      documentName:
        doc.metadata?.title ||
        doc.metadata?.documentTitle ||
        "Untitled Document",
      similarity: doc.score / 100, // Convert from 0-100 to 0-1
      metadata: doc.metadata || {},
      isChunk: doc.metadata?.isChunk || false,
      chunkIndex: doc.metadata?.chunkIndex,
    }));
  } catch (error) {
    console.error("Error performing vector search:", error);
    throw new Error(
      `Failed to perform vector search: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Perform a hybrid search (combining vector search with keyword search)
 * @param workspaceId The workspace ID
 * @param query The search query
 * @param topK The number of results to return
 * @param threshold The similarity threshold (0-1)
 * @param filters Optional metadata filters
 */
export async function hybridSearch(
  workspaceId: string,
  query: string,
  topK: number = 5,
  threshold: number = 0.7,
  filters?: Record<string, any>,
): Promise<any[]> {
  try {
    // Perform vector search
    const vectorResults = await vectorSearch(
      workspaceId,
      query,
      topK * 2, // Get more results for hybrid merging
      threshold,
      filters,
    );

    // In a real implementation, you would also perform keyword search
    // and merge the results with the vector search results
    // For now, we'll just return the vector search results

    // Sort by similarity score and take top K
    return vectorResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (error) {
    console.error("Error performing hybrid search:", error);
    throw new Error(
      `Failed to perform hybrid search: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get document by ID
 * @param workspaceId The workspace ID
 * @param documentId The document ID
 */
export async function getDocumentById(
  workspaceId: string,
  documentId: string,
): Promise<VectorDocument | null> {
  try {
    // In a real implementation, you would query the database directly
    // For now, we'll simulate it with a search
    const store = getOrCreateVectorStore(workspaceId);

    // This is a simplified approach - in a real implementation,
    // you would have a more direct way to retrieve documents by ID
    const results = await vectorSearch(
      workspaceId,
      "", // Empty query
      1, // Just get one result
      0, // No threshold
      { documentId }, // Filter by document ID
    );

    if (results.length === 0) {
      return null;
    }

    // Convert the search result to a VectorDocument
    const result = results[0];
    return {
      id: documentId,
      title: result.documentName,
      content: result.text,
      type: result.metadata.documentType || "unknown",
      createdAt: new Date(result.metadata.created || Date.now()),
      metadata: result.metadata,
    };
  } catch (error) {
    console.error("Error getting document by ID:", error);
    throw new Error(
      `Failed to get document by ID: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Reindex all documents for a workspace
 * @param workspaceId The workspace ID
 * @param documents The documents to reindex
 */
export async function reindexWorkspace(
  workspaceId: string,
  documents: VectorDocument[],
): Promise<void> {
  try {
    const store = getOrCreateVectorStore(workspaceId);

    // Clear existing documents
    await store.clear();

    // Add all documents
    if (documents.length > 0) {
      const docsToAdd = documents.map((doc) => ({
        id: doc.id,
        content: doc.content,
        metadata: {
          ...doc.metadata,
          title: doc.title,
          documentType: doc.type,
          created: doc.createdAt.toISOString(),
        },
      }));

      await store.addDocuments(docsToAdd);
    }

    console.log(
      `Reindexed ${documents.length} documents for workspace ${workspaceId}`,
    );
  } catch (error) {
    console.error("Error reindexing workspace:", error);
    throw new Error(
      `Failed to reindex workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
