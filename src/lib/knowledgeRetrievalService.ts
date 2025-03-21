/**
 * Knowledge Retrieval Service
 *
 * Provides document retrieval, context building, and citation generation
 */

import {
  semanticSearch,
  hybridSearch,
  SearchResultItem,
} from "./vectorSearchService";
import { processQuery, ProcessedQuery } from "./queryProcessing";

export interface RetrievalOptions {
  workspaceId: string;
  limit?: number;
  threshold?: number;
  useHybridSearch?: boolean;
  keywordWeight?: number;
  includeMetadata?: boolean;
  includeSourceText?: boolean;
  maxContextLength?: number;
}

export interface RetrievalResult {
  query: ProcessedQuery;
  results: SearchResultItem[];
  context: string;
  citations: Citation[];
  metadata: {
    totalResults: number;
    executionTimeMs: number;
    retrievalOptions: RetrievalOptions;
  };
}

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  text: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

/**
 * Retrieve knowledge based on a query
 * @param query The user's query
 * @param options Retrieval options
 * @returns Retrieval result with context and citations
 */
export async function retrieveKnowledge(
  query: string,
  options: RetrievalOptions,
): Promise<RetrievalResult> {
  const startTime = Date.now();

  // Process the query
  const processedQuery = await processQuery(query, {
    enableExpansion: true,
    workspaceId: options.workspaceId,
  });

  // Set default options
  const {
    workspaceId,
    limit = 5,
    threshold = 0.7,
    useHybridSearch = true,
    keywordWeight = 0.3,
    includeMetadata = true,
    includeSourceText = true,
    maxContextLength = 2000,
  } = options;

  // Perform the search
  let results: SearchResultItem[];

  if (useHybridSearch) {
    results = await hybridSearch({
      query: processedQuery.processedQuery,
      workspaceId,
      limit,
      threshold,
      keywordWeight,
    });
  } else {
    results = await semanticSearch({
      query: processedQuery.processedQuery,
      workspaceId,
      limit,
      threshold,
    });
  }

  // Generate context from results
  const context = buildContext(results, maxContextLength);

  // Generate citations
  const citations = generateCitations(results);

  // Calculate execution time
  const executionTimeMs = Date.now() - startTime;

  // Create the retrieval result
  const retrievalResult: RetrievalResult = {
    query: processedQuery,
    results,
    context,
    citations,
    metadata: {
      totalResults: results.length,
      executionTimeMs,
      retrievalOptions: options,
    },
  };

  // Track document usage
  trackDocumentUsage(results, processedQuery);

  return retrievalResult;
}

/**
 * Build a context string from search results
 * @param results Search results
 * @param maxLength Maximum context length
 * @returns Concatenated context string
 */
export function buildContext(
  results: SearchResultItem[],
  maxLength: number = 2000,
): string {
  if (results.length === 0) {
    return "";
  }

  // Sort results by similarity score (highest first)
  const sortedResults = [...results].sort(
    (a, b) => b.similarity - a.similarity,
  );

  let context = "";
  let currentLength = 0;

  // Add text from each result until we reach the maximum length
  for (const result of sortedResults) {
    // Skip if this result would exceed the maximum length
    if (currentLength + result.text.length > maxLength) {
      // If this is the first result, include a truncated version
      if (context === "") {
        context = result.text.substring(0, maxLength);
        currentLength = maxLength;
      }
      continue;
    }

    // Add a separator between results
    if (context !== "") {
      context += "\n\n---\n\n";
      currentLength += 6; // Account for separator
    }

    // Add the result text
    context += result.text;
    currentLength += result.text.length;
  }

  return context;
}

/**
 * Generate citations from search results
 * @param results Search results
 * @returns Array of citations
 */
export function generateCitations(results: SearchResultItem[]): Citation[] {
  return results.map((result) => ({
    id: `cite-${result.id}`,
    documentId: result.id,
    documentName: result.documentName,
    text:
      result.text.length > 200
        ? `${result.text.substring(0, 200)}...`
        : result.text,
    relevanceScore: result.similarity,
    metadata: result.metadata,
  }));
}

// In-memory store for document usage tracking (would be replaced with a database in production)
interface DocumentUsage {
  documentId: string;
  documentName: string;
  queryId: string;
  query: string;
  timestamp: number;
  relevanceScore: number;
}

const documentUsage: DocumentUsage[] = [];

/**
 * Track document usage for analytics
 * @param results Search results
 * @param query Processed query
 */
export function trackDocumentUsage(
  results: SearchResultItem[],
  query: ProcessedQuery,
): void {
  // Record usage for each result
  results.forEach((result) => {
    documentUsage.push({
      documentId: result.id,
      documentName: result.documentName,
      queryId: query.id,
      query: query.originalQuery,
      timestamp: Date.now(),
      relevanceScore: result.similarity,
    });
  });

  // Keep the usage log size manageable
  if (documentUsage.length > 10000) {
    documentUsage.splice(0, documentUsage.length - 10000);
  }
}

/**
 * Get document usage analytics
 * @param workspaceId Optional workspace filter
 * @returns Document usage analytics
 */
export function getDocumentUsageAnalytics(documentId?: string): {
  totalUsage: number;
  averageRelevance: number;
  usageOverTime: { date: string; count: number }[];
  topQueries: { query: string; count: number }[];
} {
  // Filter by document if provided
  const filtered = documentId
    ? documentUsage.filter((usage) => usage.documentId === documentId)
    : documentUsage;

  if (filtered.length === 0) {
    return {
      totalUsage: 0,
      averageRelevance: 0,
      usageOverTime: [],
      topQueries: [],
    };
  }

  // Calculate total usage
  const totalUsage = filtered.length;

  // Calculate average relevance
  const totalRelevance = filtered.reduce(
    (sum, usage) => sum + usage.relevanceScore,
    0,
  );
  const averageRelevance = totalRelevance / totalUsage;

  // Calculate usage over time (by day)
  const usageDates: Record<string, number> = {};
  filtered.forEach((usage) => {
    const date = new Date(usage.timestamp).toISOString().split("T")[0];
    usageDates[date] = (usageDates[date] || 0) + 1;
  });

  const usageOverTime = Object.entries(usageDates)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate top queries
  const queryCounts: Record<string, number> = {};
  filtered.forEach((usage) => {
    queryCounts[usage.query] = (queryCounts[usage.query] || 0) + 1;
  });

  const topQueries = Object.entries(queryCounts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalUsage,
    averageRelevance,
    usageOverTime,
    topQueries,
  };
}

/**
 * Get top performing documents
 * @param workspaceId Optional workspace filter
 * @param limit Maximum number of documents to return
 * @returns Top performing documents
 */
export function getTopPerformingDocuments(
  limit: number = 10,
  workspaceId?: string,
): {
  documentId: string;
  documentName: string;
  usageCount: number;
  averageRelevance: number;
}[] {
  // Group usage by document
  const documentStats: Record<
    string,
    {
      documentId: string;
      documentName: string;
      usageCount: number;
      totalRelevance: number;
    }
  > = {};

  documentUsage.forEach((usage) => {
    if (!documentStats[usage.documentId]) {
      documentStats[usage.documentId] = {
        documentId: usage.documentId,
        documentName: usage.documentName,
        usageCount: 0,
        totalRelevance: 0,
      };
    }

    documentStats[usage.documentId].usageCount++;
    documentStats[usage.documentId].totalRelevance += usage.relevanceScore;
  });

  // Calculate average relevance and sort by usage count
  return Object.values(documentStats)
    .map((stats) => ({
      documentId: stats.documentId,
      documentName: stats.documentName,
      usageCount: stats.usageCount,
      averageRelevance: stats.totalRelevance / stats.usageCount,
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}
