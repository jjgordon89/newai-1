/**
 * Query Processing Service
 *
 * Handles query understanding, expansion, preprocessing, and logging
 */

import { v4 as uuidv4 } from "uuid";

export interface ProcessedQuery {
  id: string;
  originalQuery: string;
  processedQuery: string;
  expandedQueries: string[];
  timestamp: number;
  metadata: Record<string, any>;
}

export interface QueryProcessingOptions {
  enableExpansion?: boolean;
  expansionCount?: number;
  enableLogging?: boolean;
  workspaceId?: string;
}

// In-memory store for query logs (would be replaced with a database in production)
const queryLogs: ProcessedQuery[] = [];

/**
 * Process a user query for improved retrieval
 * @param query The original user query
 * @param options Processing options
 * @returns Processed query object
 */
export async function processQuery(
  query: string,
  options: QueryProcessingOptions = {},
): Promise<ProcessedQuery> {
  const {
    enableExpansion = true,
    expansionCount = 3,
    enableLogging = true,
    workspaceId = "default",
  } = options;

  // 1. Preprocess the query
  const processedQuery = preprocessQuery(query);

  // 2. Expand the query if enabled
  const expandedQueries = enableExpansion
    ? await expandQuery(processedQuery, expansionCount)
    : [];

  // 3. Create the processed query object
  const queryObject: ProcessedQuery = {
    id: uuidv4(),
    originalQuery: query,
    processedQuery,
    expandedQueries,
    timestamp: Date.now(),
    metadata: {
      workspaceId,
      processingOptions: options,
    },
  };

  // 4. Log the query if enabled
  if (enableLogging) {
    logQuery(queryObject);
  }

  return queryObject;
}

/**
 * Preprocess a query to improve retrieval quality
 * @param query The original query
 * @returns Preprocessed query
 */
export function preprocessQuery(query: string): string {
  // Basic preprocessing steps:
  // 1. Trim whitespace
  let processed = query.trim();

  // 2. Remove excessive punctuation
  processed = processed.replace(/[\?!\.,;:]{2,}/g, (match) => match[0]);

  // 3. Normalize whitespace
  processed = processed.replace(/\s+/g, " ");

  // 4. Remove stop words for certain query types
  if (processed.split(" ").length > 3) {
    processed = removeStopWords(processed);
  }

  return processed;
}

/**
 * Remove common stop words from a query
 * @param query The query to process
 * @returns Query without stop words
 */
function removeStopWords(query: string): string {
  const stopWords = [
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "from",
    "up",
    "down",
    "of",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "can",
    "will",
    "just",
    "should",
    "now",
  ];

  // Split the query into words
  const words = query.toLowerCase().split(/\s+/);

  // Filter out stop words
  const filteredWords = words.filter((word) => !stopWords.includes(word));

  // If too many words were removed, return the original query
  if (filteredWords.length < 2 && words.length > 2) {
    return query;
  }

  return filteredWords.join(" ");
}

/**
 * Expand a query to improve recall
 * @param query The processed query
 * @param count Number of expansions to generate
 * @returns Array of expanded queries
 */
export async function expandQuery(
  query: string,
  count: number = 3,
): Promise<string[]> {
  // In a real implementation, this would use techniques like:
  // 1. Synonym expansion
  // 2. Word embedding-based expansion
  // 3. Query reformulation using LLMs

  // For this implementation, we'll use a simple approach with synonyms
  const expansions: string[] = [];

  // Split the query into words
  const words = query.split(" ");

  // Simple synonym map
  const synonymMap: Record<string, string[]> = {
    create: ["make", "build", "generate", "develop"],
    delete: ["remove", "erase", "eliminate"],
    update: ["modify", "change", "edit", "alter"],
    search: ["find", "locate", "query", "look for"],
    document: ["file", "record", "paper", "content"],
    user: ["person", "individual", "customer", "client"],
    system: ["platform", "application", "software", "program"],
    error: ["bug", "issue", "problem", "fault", "defect"],
    feature: ["functionality", "capability", "option"],
    data: ["information", "content", "records"],
    api: ["interface", "endpoint", "service"],
    database: ["db", "data store", "repository"],
    code: ["script", "program", "source"],
    test: ["check", "verify", "validate", "examine"],
    deploy: ["launch", "release", "publish", "roll out"],
  };

  // Generate expansions by replacing one word at a time with synonyms
  for (let i = 0; i < words.length && expansions.length < count; i++) {
    const word = words[i].toLowerCase();
    const synonyms = synonymMap[word];

    if (synonyms) {
      for (const synonym of synonyms) {
        if (expansions.length >= count) break;

        const expandedQuery = [...words];
        expandedQuery[i] = synonym;
        expansions.push(expandedQuery.join(" "));
      }
    }
  }

  // If we couldn't generate enough expansions with synonyms,
  // add some generic expansions
  if (expansions.length < count) {
    expansions.push(`information about ${query}`);
    expansions.push(`how to ${query}`);
    expansions.push(`${query} examples`);
  }

  // Trim to requested count
  return expansions.slice(0, count);
}

/**
 * Log a processed query for analytics
 * @param query The processed query object
 */
export function logQuery(query: ProcessedQuery): void {
  // In a real implementation, this would store the query in a database
  // For this implementation, we'll use an in-memory array
  queryLogs.push(query);

  // Keep the log size manageable
  if (queryLogs.length > 1000) {
    queryLogs.shift();
  }

  console.log(`Logged query: ${query.originalQuery}`);
}

/**
 * Get query logs for analytics
 * @param limit Maximum number of logs to return
 * @param workspaceId Optional workspace filter
 * @returns Array of query logs
 */
export function getQueryLogs(
  limit: number = 100,
  workspaceId?: string,
): ProcessedQuery[] {
  // Filter by workspace if provided
  const filtered = workspaceId
    ? queryLogs.filter((q) => q.metadata.workspaceId === workspaceId)
    : queryLogs;

  // Sort by timestamp (newest first) and limit
  return filtered.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

/**
 * Get query analytics
 * @param workspaceId Optional workspace filter
 * @returns Query analytics data
 */
export function getQueryAnalytics(workspaceId?: string): {
  totalQueries: number;
  uniqueQueries: number;
  averageQueryLength: number;
  topQueries: { query: string; count: number }[];
  queriesOverTime: { date: string; count: number }[];
} {
  // Filter by workspace if provided
  const filtered = workspaceId
    ? queryLogs.filter((q) => q.metadata.workspaceId === workspaceId)
    : queryLogs;

  if (filtered.length === 0) {
    return {
      totalQueries: 0,
      uniqueQueries: 0,
      averageQueryLength: 0,
      topQueries: [],
      queriesOverTime: [],
    };
  }

  // Calculate total queries
  const totalQueries = filtered.length;

  // Calculate unique queries
  const uniqueQueries = new Set(filtered.map((q) => q.originalQuery)).size;

  // Calculate average query length
  const totalLength = filtered.reduce(
    (sum, q) => sum + q.originalQuery.length,
    0,
  );
  const averageQueryLength = totalLength / totalQueries;

  // Calculate top queries
  const queryCounts: Record<string, number> = {};
  filtered.forEach((q) => {
    queryCounts[q.originalQuery] = (queryCounts[q.originalQuery] || 0) + 1;
  });

  const topQueries = Object.entries(queryCounts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate queries over time (by day)
  const queryDates: Record<string, number> = {};
  filtered.forEach((q) => {
    const date = new Date(q.timestamp).toISOString().split("T")[0];
    queryDates[date] = (queryDates[date] || 0) + 1;
  });

  const queriesOverTime = Object.entries(queryDates)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalQueries,
    uniqueQueries,
    averageQueryLength,
    topQueries,
    queriesOverTime,
  };
}
