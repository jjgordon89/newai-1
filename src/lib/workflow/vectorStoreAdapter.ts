/**
 * Vector store adapter for LangChain integration
 * Provides a bridge between our LanceDB implementation and LangChain
 */

import { LanceDbStore } from "../lanceDatabaseAdapter";
import { HuggingFaceEmbeddingGenerator } from "../huggingFaceEmbeddings";

/**
 * Creates a LangChain-compatible vector store from our LanceDB implementation
 */
export function createLangChainVectorStore(
  workspaceId: string,
  embeddingModel: string = "bge-small-en",
) {
  // Create embedding generator
  const embeddingGenerator = new HuggingFaceEmbeddingGenerator({
    model: embeddingModel,
    dimensions: 384, // This would be determined by the model
  });

  // Create LanceDB store
  const lanceDbStore = new LanceDbStore(workspaceId, embeddingGenerator);

  // Return a LangChain-compatible adapter
  return {
    // Method to retrieve documents
    asRetriever: ({ k = 5, includeMetadata = true }) => {
      return {
        // LangChain retriever interface
        getRelevantDocuments: async (query: string) => {
          try {
            const results = await lanceDbStore.searchSimilar(query, k, 0.7);

            // Convert to LangChain document format
            return results.map((result) => ({
              pageContent: result.text,
              metadata: includeMetadata ? result.metadata || {} : {},
              score: result.score / 100, // Normalize score to 0-1 range
            }));
          } catch (error) {
            console.error("Error retrieving documents:", error);
            return [];
          }
        },

        // Add a document to the vector store
        addDocuments: async (
          documents: Array<{ pageContent: string; metadata?: any }>,
        ) => {
          try {
            const docsToAdd = documents.map((doc) => ({
              id: `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              content: doc.pageContent,
              metadata: doc.metadata || {},
            }));

            return await lanceDbStore.addDocuments(docsToAdd);
          } catch (error) {
            console.error("Error adding documents:", error);
            return [];
          }
        },
      };
    },

    // Method to search directly
    similaritySearch: async (query: string, k = 5) => {
      try {
        const results = await lanceDbStore.searchSimilar(query, k, 0.7);

        // Convert to LangChain document format
        return results.map((result) => ({
          pageContent: result.text,
          metadata: result.metadata || {},
          score: result.score / 100, // Normalize score to 0-1 range
        }));
      } catch (error) {
        console.error("Error in similarity search:", error);
        return [];
      }
    },
  };
}
