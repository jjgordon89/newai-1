/**
 * Unified Query Interface
 *
 * Provides a unified interface for querying multiple data sources including:
 * - Internal knowledge base
 * - External databases
 * - Web search
 * - Third-party APIs
 */

import { knowledgeRetrievalService } from "../knowledgeRetrievalService";
import webSearchIntegration from "./webSearchIntegration";
import externalDatabaseIntegration from "./externalDatabaseIntegration";
import thirdPartyApiIntegration from "./thirdPartyApiIntegration";

export type DataSourceType =
  | "knowledge-base"
  | "web-search"
  | "external-db"
  | "third-party-api";

export interface DataSourceConfig {
  id: string;
  type: DataSourceType;
  name: string;
  priority: number; // 1-10, higher means higher priority
  enabled: boolean;
  options?: Record<string, any>;
}

export interface UnifiedQueryOptions {
  query: string;
  dataSources?: string[]; // IDs of data sources to query, if empty query all enabled sources
  limit?: number; // Total results to return
  timeout?: number; // Timeout in milliseconds
  mergeStrategy?: "priority" | "interleave" | "append";
}

export interface UnifiedQueryResult {
  source: string;
  sourceType: DataSourceType;
  results: any[];
  timestamp: string;
  metadata?: Record<string, any>;
}

export class UnifiedQueryInterface {
  private dataSources: Map<string, DataSourceConfig> = new Map();

  constructor() {
    // Register default knowledge base source
    this.registerDataSource({
      id: "default-kb",
      type: "knowledge-base",
      name: "Internal Knowledge Base",
      priority: 10,
      enabled: true,
    });
  }

  /**
   * Register a data source
   */
  registerDataSource(config: DataSourceConfig): void {
    this.dataSources.set(config.id, config);
    console.log(`Registered data source: ${config.name} (${config.id})`);
  }

  /**
   * Remove a data source
   */
  removeDataSource(id: string): boolean {
    return this.dataSources.delete(id);
  }

  /**
   * Get all registered data sources
   */
  getDataSources(): DataSourceConfig[] {
    return Array.from(this.dataSources.values());
  }

  /**
   * Enable or disable a data source
   */
  setDataSourceEnabled(id: string, enabled: boolean): boolean {
    if (this.dataSources.has(id)) {
      const config = this.dataSources.get(id)!;
      config.enabled = enabled;
      this.dataSources.set(id, config);
      return true;
    }
    return false;
  }

  /**
   * Execute a unified query across multiple data sources
   */
  async query(options: UnifiedQueryOptions): Promise<UnifiedQueryResult[]> {
    // Determine which data sources to query
    let sourcesToQuery: DataSourceConfig[];

    if (options.dataSources && options.dataSources.length > 0) {
      // Query specific data sources
      sourcesToQuery = options.dataSources
        .map((id) => this.dataSources.get(id))
        .filter(
          (source): source is DataSourceConfig => !!source && source.enabled,
        )
        .sort((a, b) => b.priority - a.priority);
    } else {
      // Query all enabled data sources
      sourcesToQuery = Array.from(this.dataSources.values())
        .filter((source) => source.enabled)
        .sort((a, b) => b.priority - a.priority);
    }

    if (sourcesToQuery.length === 0) {
      throw new Error("No enabled data sources found for query");
    }

    // Execute queries in parallel with timeout
    const timeout = options.timeout || 10000; // Default 10s timeout
    const queryPromises = sourcesToQuery.map((source) =>
      this.queryDataSource(source, options.query, options.limit)
        .then((results) => ({
          source: source.name,
          sourceType: source.type,
          results,
          timestamp: new Date().toISOString(),
        }))
        .catch((error) => {
          console.error(`Error querying ${source.name}:`, error);
          return {
            source: source.name,
            sourceType: source.type,
            results: [],
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
          };
        }),
    );

    // Add timeout to each promise
    const timeoutPromises = queryPromises.map((promise) => {
      return Promise.race([
        promise,
        new Promise<UnifiedQueryResult>((_, reject) =>
          setTimeout(() => reject(new Error("Query timed out")), timeout),
        ),
      ]);
    });

    try {
      const results = await Promise.all(timeoutPromises);

      // Apply merge strategy if needed
      if (options.mergeStrategy === "interleave") {
        // Interleave results from different sources
        return this.interleaveResults(results);
      }

      return results;
    } catch (error) {
      console.error("Error executing unified query:", error);
      throw new Error(
        `Unified query failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Query a specific data source
   */
  private async queryDataSource(
    source: DataSourceConfig,
    query: string,
    limit?: number,
  ): Promise<any[]> {
    const sourceLimit = limit || 10;

    switch (source.type) {
      case "knowledge-base":
        const kbResults = await knowledgeRetrievalService.retrieveKnowledge(
          query,
          {
            limit: sourceLimit,
            ...(source.options || {}),
          },
        );
        return kbResults.results || [];

      case "web-search":
        const webResults = await webSearchIntegration.search({
          query,
          limit: sourceLimit,
          ...(source.options || {}),
        });
        return webResults;

      case "external-db":
        if (!source.options?.connectionId) {
          throw new Error("Missing connectionId for external database source");
        }
        return await externalDatabaseIntegration.query(
          source.options.connectionId,
          {
            query,
            limit: sourceLimit,
            ...(source.options || {}),
          },
        );

      case "third-party-api":
        if (!source.options?.apiId || !source.options?.endpoint) {
          throw new Error(
            "Missing apiId or endpoint for third-party API source",
          );
        }
        const apiResponse = await thirdPartyApiIntegration.request(
          source.options.apiId,
          {
            endpoint: source.options.endpoint,
            params: {
              query,
              limit: sourceLimit,
              ...(source.options.params || {}),
            },
            ...(source.options || {}),
          },
        );

        // Extract results from API response based on resultsPath if provided
        if (source.options?.resultsPath) {
          return this.extractResultsByPath(
            apiResponse,
            source.options.resultsPath,
          );
        }
        return Array.isArray(apiResponse) ? apiResponse : [apiResponse];

      default:
        throw new Error(`Unsupported data source type: ${source.type}`);
    }
  }

  /**
   * Extract results from an object using a dot-notation path
   */
  private extractResultsByPath(obj: any, path: string): any[] {
    const parts = path.split(".");
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return [];
      }
      current = current[part];
    }

    return Array.isArray(current) ? current : [];
  }

  /**
   * Interleave results from different sources
   */
  private interleaveResults(
    results: UnifiedQueryResult[],
  ): UnifiedQueryResult[] {
    // Create a copy of results with non-empty result sets
    const validResults = results.filter(
      (r) => r.results && r.results.length > 0,
    );

    if (validResults.length <= 1) {
      return results; // No need to interleave if only one source has results
    }

    // Sort by priority (based on the original data source priority)
    validResults.sort((a, b) => {
      const sourceA = this.dataSources.get(a.source) || { priority: 0 };
      const sourceB = this.dataSources.get(b.source) || { priority: 0 };
      return sourceB.priority - sourceA.priority;
    });

    // Create interleaved result set
    const interleaved: UnifiedQueryResult = {
      source: "interleaved",
      sourceType: "knowledge-base", // Default type
      results: [],
      timestamp: new Date().toISOString(),
      metadata: {
        sources: validResults.map((r) => r.source),
      },
    };

    // Find the maximum number of results in any source
    const maxResults = Math.max(...validResults.map((r) => r.results.length));

    // Interleave results
    for (let i = 0; i < maxResults; i++) {
      for (const result of validResults) {
        if (i < result.results.length) {
          // Add source information to each result
          const enhancedResult = {
            ...result.results[i],
            _source: result.source,
            _sourceType: result.sourceType,
          };
          interleaved.results.push(enhancedResult);
        }
      }
    }

    // Return the interleaved results as a single source
    return [interleaved];
  }
}

// Create a singleton instance
const unifiedQueryInterface = new UnifiedQueryInterface();
export default unifiedQueryInterface;
