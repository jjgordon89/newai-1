/**
 * Vector Search Service
 *
 * Provides advanced vector search capabilities including semantic search,
 * filtering, and hybrid search (vector + keyword)
 */

import { vectorSearch } from "./lanceDbService";
import { HuggingFaceEmbeddingGenerator } from "./huggingFaceEmbeddings";

// Types for search parameters
export interface VectorSearchParams {
  query: string;
  workspaceId: string;
  limit?: number;
  threshold?: number;
  filters?: Record<string, any>;
  includeMetadata?: boolean;
}

// Types for hybrid search parameters
export interface HybridSearchParams extends VectorSearchParams {
  keywordWeight?: number; // 0-1 weight for keyword search vs vector search
  exactMatch?: boolean; // Whether to require exact keyword matches
}

// Types for search results
export interface SearchResultItem {
  id: string;
  text: string;
  documentName: string;
  similarity: number;
  metadata: Record<string, any>;
  highlights?: string[];
  keywordScore?: number;
  combinedScore?: number;
}

/**
 * Perform semantic search using vector embeddings
 * @param params Search parameters
 * @returns Search results
 */
export async function semanticSearch(
  params: VectorSearchParams,
): Promise<SearchResultItem[]> {
  try {
    const { query, workspaceId, limit = 5, threshold = 0.7, filters } = params;

    // Get vector search results
    const results = await vectorSearch(workspaceId, query, limit, threshold);

    // Apply filters if provided
    const filteredResults = filters
      ? results.filter((item) => matchesFilters(item.metadata, filters))
      : results;

    return filteredResults;
  } catch (error) {
    console.error("Error in semantic search:", error);
    throw new Error(
      `Semantic search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Perform keyword search on document content
 * @param query Search query
 * @param documents Documents to search
 * @param exactMatch Whether to require exact matches
 * @returns Scored results
 */
function keywordSearch(
  query: string,
  documents: SearchResultItem[],
  exactMatch: boolean = false,
): SearchResultItem[] {
  // Normalize query
  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/);

  // Score each document based on keyword matches
  return documents.map((doc) => {
    const text = doc.text.toLowerCase();
    let score = 0;
    let matches = 0;
    const highlights: string[] = [];

    // For exact match, check if the entire query exists in the text
    if (exactMatch) {
      if (text.includes(normalizedQuery)) {
        score = 1.0;
        matches = 1;

        // Create highlight
        const index = text.indexOf(normalizedQuery);
        const start = Math.max(0, index - 30);
        const end = Math.min(text.length, index + normalizedQuery.length + 30);
        highlights.push(`...${doc.text.substring(start, end)}...`);
      }
    } else {
      // For non-exact match, check each term
      for (const term of queryTerms) {
        if (term.length < 3) continue; // Skip very short terms

        if (text.includes(term)) {
          matches++;

          // Create highlight for this term
          const index = text.indexOf(term);
          const start = Math.max(0, index - 20);
          const end = Math.min(text.length, index + term.length + 20);
          highlights.push(`...${doc.text.substring(start, end)}...`);
        }
      }

      // Calculate score based on percentage of matching terms
      score = matches / queryTerms.length;
    }

    return {
      ...doc,
      keywordScore: score,
      highlights: highlights.slice(0, 3), // Limit to 3 highlights
    };
  });
}

/**
 * Perform hybrid search combining vector and keyword search
 * @param params Search parameters
 * @returns Combined search results
 */
export async function hybridSearch(
  params: HybridSearchParams,
): Promise<SearchResultItem[]> {
  try {
    const {
      query,
      workspaceId,
      limit = 10,
      threshold = 0.6,
      filters,
      keywordWeight = 0.3,
      exactMatch = false,
    } = params;

    // First get semantic search results with a lower threshold and higher limit
    // to ensure we have enough candidates for hybrid ranking
    const vectorResults = await vectorSearch(
      workspaceId,
      query,
      Math.max(limit * 3, 20), // Get more results for re-ranking
      Math.max(threshold - 0.1, 0.5), // Lower threshold to get more candidates
    );

    // Apply filters if provided
    const filteredResults = filters
      ? vectorResults.filter((item) => matchesFilters(item.metadata, filters))
      : vectorResults;

    // Perform keyword search on the filtered results
    const hybridResults = keywordSearch(query, filteredResults, exactMatch);

    // Combine scores: (1-keywordWeight)*similarityScore + keywordWeight*keywordScore
    const combinedResults = hybridResults.map((item) => ({
      ...item,
      combinedScore:
        (1 - keywordWeight) * item.similarity +
        keywordWeight * (item.keywordScore || 0),
    }));

    // Sort by combined score and limit results
    return combinedResults
      .sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0))
      .slice(0, limit);
  } catch (error) {
    console.error("Error in hybrid search:", error);
    throw new Error(
      `Hybrid search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Find similar documents to a given document ID
 * @param workspaceId The workspace ID
 * @param documentId The document ID to find similar documents for
 * @param limit Maximum number of results
 * @param threshold Similarity threshold
 * @returns Similar documents
 */
export async function findSimilarDocuments(
  workspaceId: string,
  documentId: string,
  limit: number = 5,
  threshold: number = 0.7,
): Promise<SearchResultItem[]> {
  try {
    // This would typically involve:
    // 1. Retrieving the document's embedding
    // 2. Using that embedding to find similar documents

    // For now, we'll implement a simplified version that uses the document's content
    // In a real implementation, we would store and retrieve the actual embeddings

    // Get the document content from the vector store
    // This is a placeholder - in a real implementation we would have a method to get a document by ID
    const documentResults = await vectorSearch(
      workspaceId,
      `id:${documentId}`,
      1,
      0.9,
    );

    if (documentResults.length === 0) {
      throw new Error(`Document with ID ${documentId} not found`);
    }

    // Use the document's content as the query
    const documentContent = documentResults[0].text;

    // Find similar documents based on the content
    const similarDocuments = await vectorSearch(
      workspaceId,
      documentContent,
      limit + 1, // +1 because the document itself will be included
      threshold,
    );

    // Filter out the original document
    return similarDocuments.filter((doc) => doc.id !== documentId);
  } catch (error) {
    console.error("Error finding similar documents:", error);
    throw new Error(
      `Failed to find similar documents: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Check if a document's metadata matches the provided filters
 * @param metadata Document metadata
 * @param filters Filter criteria
 * @returns Whether the document matches the filters
 */
function matchesFilters(
  metadata: Record<string, any>,
  filters: Record<string, any>,
): boolean {
  // Check each filter criterion
  for (const [key, value] of Object.entries(filters)) {
    // Handle nested paths with dot notation (e.g., "author.name")
    const parts = key.split(".");
    let current = metadata;

    // Navigate to the nested property
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
      if (current === undefined) return false;
    }

    const finalKey = parts[parts.length - 1];

    // Handle different filter types
    if (typeof value === "object" && value !== null) {
      // Range filter: {min: x, max: y}
      if ("min" in value || "max" in value) {
        const fieldValue = current[finalKey];
        if (typeof fieldValue !== "number") return false;

        if ("min" in value && fieldValue < value.min) return false;
        if ("max" in value && fieldValue > value.max) return false;
      }
      // Array contains filter: {contains: x}
      else if ("contains" in value) {
        const fieldValue = current[finalKey];
        if (!Array.isArray(fieldValue)) return false;

        if (!fieldValue.includes(value.contains)) return false;
      }
      // Regex filter: {regex: pattern}
      else if ("regex" in value) {
        const fieldValue = current[finalKey];
        if (typeof fieldValue !== "string") return false;

        const regex = new RegExp(value.regex);
        if (!regex.test(fieldValue)) return false;
      }
    }
    // Simple equality check
    else if (current[finalKey] !== value) {
      return false;
    }
  }

  return true;
}

/**
 * Get available filter fields based on document schema
 * @param workspaceId The workspace ID
 * @returns Available filter fields
 */
export async function getAvailableFilters(
  workspaceId: string,
): Promise<{ field: string; type: string }[]> {
  // In a real implementation, this would query the database schema
  // For now, we'll return a static list of common fields
  return [
    { field: "documentType", type: "string" },
    { field: "created", type: "date" },
    { field: "title", type: "string" },
    { field: "author", type: "string" },
    { field: "tags", type: "array" },
    { field: "category", type: "string" },
    { field: "wordCount", type: "number" },
  ];
}
