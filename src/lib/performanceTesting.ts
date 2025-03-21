/**
 * Performance Testing Service
 *
 * Provides utilities for testing and benchmarking system performance
 */

import { documentProcessingService } from "./documentProcessingService";
import { vectorSearchService } from "./vectorSearchService";
import { ragService } from "./ragService";
import { knowledgeRetrievalService } from "./knowledgeRetrievalService";

export interface PerformanceTestResult {
  testName: string;
  startTime: number;
  endTime: number;
  duration: number; // in milliseconds
  success: boolean;
  error?: string;
  metrics: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface LoadTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpPeriod?: number; // in milliseconds
  thinkTime?: number; // in milliseconds between requests
}

export interface BenchmarkResult {
  testName: string;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  p50: number; // 50th percentile (median)
  p90: number; // 90th percentile
  p95: number; // 95th percentile
  p99: number; // 99th percentile
  successRate: number;
  throughput: number; // requests per second
  concurrentUsers: number;
  totalRequests: number;
  startTime: string;
  endTime: string;
  duration: number; // total test duration in milliseconds
}

export class PerformanceTestingService {
  private results: PerformanceTestResult[] = [];
  private benchmarks: BenchmarkResult[] = [];

  /**
   * Run a document processing performance test
   */
  async testDocumentProcessing(
    filePaths: string[],
    config?: {
      chunkSize?: number;
      chunkOverlap?: number;
      extractMetadata?: boolean;
    },
  ): Promise<PerformanceTestResult> {
    const startTime = Date.now();
    let success = true;
    let error;
    const metrics: Record<string, number> = {
      totalDocuments: filePaths.length,
      totalBytes: 0,
      documentsPerSecond: 0,
      bytesPerSecond: 0,
      averageProcessingTimePerDocument: 0,
    };

    try {
      // Process each document and measure performance
      const documentSizes: number[] = [];
      const processingTimes: number[] = [];

      for (const filePath of filePaths) {
        const docStartTime = Date.now();

        // Process the document
        const result = await documentProcessingService.processDocument(
          filePath,
          {
            chunkSize: config?.chunkSize,
            chunkOverlap: config?.chunkOverlap,
            extractMetadata: config?.extractMetadata,
          },
        );

        const docEndTime = Date.now();
        const processingTime = docEndTime - docStartTime;

        // Collect metrics
        processingTimes.push(processingTime);
        documentSizes.push(result.size || 0);
        metrics.totalBytes += result.size || 0;
      }

      // Calculate aggregate metrics
      const totalDuration = Date.now() - startTime;
      metrics.documentsPerSecond = (filePaths.length / totalDuration) * 1000;
      metrics.bytesPerSecond = (metrics.totalBytes / totalDuration) * 1000;
      metrics.averageProcessingTimePerDocument =
        processingTimes.reduce((sum, time) => sum + time, 0) /
        processingTimes.length;
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
    }

    const endTime = Date.now();
    const result: PerformanceTestResult = {
      testName: "DocumentProcessing",
      startTime,
      endTime,
      duration: endTime - startTime,
      success,
      error,
      metrics,
    };

    this.results.push(result);
    return result;
  }

  /**
   * Test vector search performance
   */
  async testVectorSearch(
    queries: string[],
    config?: {
      topK?: number;
      collection?: string;
      similarityThreshold?: number;
    },
  ): Promise<PerformanceTestResult> {
    const startTime = Date.now();
    let success = true;
    let error;
    const metrics: Record<string, number> = {
      totalQueries: queries.length,
      averageQueryTime: 0,
      queriesPerSecond: 0,
      averageResultCount: 0,
    };

    try {
      const queryTimes: number[] = [];
      let totalResults = 0;

      for (const query of queries) {
        const queryStartTime = Date.now();

        // Perform vector search
        const results = await vectorSearchService.search(query, {
          topK: config?.topK || 5,
          collection: config?.collection,
          similarityThreshold: config?.similarityThreshold || 0.7,
        });

        const queryEndTime = Date.now();
        const queryTime = queryEndTime - queryStartTime;

        // Collect metrics
        queryTimes.push(queryTime);
        totalResults += results.length;
      }

      // Calculate aggregate metrics
      const totalDuration = Date.now() - startTime;
      metrics.averageQueryTime =
        queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length;
      metrics.queriesPerSecond = (queries.length / totalDuration) * 1000;
      metrics.averageResultCount = totalResults / queries.length;
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
    }

    const endTime = Date.now();
    const result: PerformanceTestResult = {
      testName: "VectorSearch",
      startTime,
      endTime,
      duration: endTime - startTime,
      success,
      error,
      metrics,
    };

    this.results.push(result);
    return result;
  }

  /**
   * Test RAG query performance
   */
  async testRagPerformance(
    queries: string[],
    config?: {
      useQueryExpansion?: boolean;
      useReranking?: boolean;
      enhancedContext?: boolean;
      topK?: number;
    },
  ): Promise<PerformanceTestResult> {
    const startTime = Date.now();
    let success = true;
    let error;
    const metrics: Record<string, number> = {
      totalQueries: queries.length,
      averageQueryTime: 0,
      queriesPerSecond: 0,
      averageContextSize: 0,
      averageTokenCount: 0,
    };

    try {
      const queryTimes: number[] = [];
      let totalContextSize = 0;
      let totalTokens = 0;

      for (const query of queries) {
        const queryStartTime = Date.now();

        // Perform RAG query
        const result = await ragService.query(query, {
          useQueryExpansion: config?.useQueryExpansion,
          useReranking: config?.useReranking,
          enhancedContext: config?.enhancedContext,
          topK: config?.topK || 3,
        });

        const queryEndTime = Date.now();
        const queryTime = queryEndTime - queryStartTime;

        // Collect metrics
        queryTimes.push(queryTime);
        totalContextSize += result.context?.length || 0;
        totalTokens += result.tokenUsage?.total || 0;
      }

      // Calculate aggregate metrics
      const totalDuration = Date.now() - startTime;
      metrics.averageQueryTime =
        queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length;
      metrics.queriesPerSecond = (queries.length / totalDuration) * 1000;
      metrics.averageContextSize = totalContextSize / queries.length;
      metrics.averageTokenCount = totalTokens / queries.length;
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
    }

    const endTime = Date.now();
    const result: PerformanceTestResult = {
      testName: "RagQuery",
      startTime,
      endTime,
      duration: endTime - startTime,
      success,
      error,
      metrics,
    };

    this.results.push(result);
    return result;
  }

  /**
   * Run a load test for knowledge retrieval
   */
  async runLoadTest(
    query: string,
    config: LoadTestConfig,
  ): Promise<BenchmarkResult> {
    const startTime = Date.now();
    const allResults: PerformanceTestResult[] = [];

    // Create virtual users
    const users = Array.from({ length: config.concurrentUsers }, (_, i) => i);

    // Run requests for each user
    const userPromises = users.map(async (userId) => {
      // Optional ramp-up delay
      if (config.rampUpPeriod) {
        const userDelay =
          (config.rampUpPeriod / config.concurrentUsers) * userId;
        await new Promise((resolve) => setTimeout(resolve, userDelay));
      }

      const userResults: PerformanceTestResult[] = [];

      for (let i = 0; i < config.requestsPerUser; i++) {
        // Optional think time between requests
        if (i > 0 && config.thinkTime) {
          await new Promise((resolve) => setTimeout(resolve, config.thinkTime));
        }

        const requestStartTime = Date.now();
        let success = true;
        let error;

        try {
          // Perform knowledge retrieval
          await knowledgeRetrievalService.retrieveKnowledge(query);
        } catch (err) {
          success = false;
          error = err instanceof Error ? err.message : String(err);
        }

        const requestEndTime = Date.now();

        userResults.push({
          testName: `LoadTest-User${userId}-Request${i}`,
          startTime: requestStartTime,
          endTime: requestEndTime,
          duration: requestEndTime - requestStartTime,
          success,
          error,
          metrics: {},
          metadata: { userId, requestId: i },
        });
      }

      return userResults;
    });

    // Wait for all users to complete their requests
    const results = await Promise.all(userPromises);
    results.forEach((userResults) => allResults.push(...userResults));

    // Calculate benchmark metrics
    const endTime = Date.now();
    const durations = allResults.map((r) => r.duration);
    const successCount = allResults.filter((r) => r.success).length;

    // Sort durations for percentile calculations
    durations.sort((a, b) => a - b);

    const benchmark: BenchmarkResult = {
      testName: "KnowledgeRetrievalLoadTest",
      averageDuration:
        durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p50: this.calculatePercentile(durations, 50),
      p90: this.calculatePercentile(durations, 90),
      p95: this.calculatePercentile(durations, 95),
      p99: this.calculatePercentile(durations, 99),
      successRate: (successCount / allResults.length) * 100,
      throughput: (allResults.length / (endTime - startTime)) * 1000,
      concurrentUsers: config.concurrentUsers,
      totalRequests: allResults.length,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: endTime - startTime,
    };

    this.benchmarks.push(benchmark);
    return benchmark;
  }

  /**
   * Calculate a percentile value from an array of numbers
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.max(0, Math.min(values.length - 1, index))];
  }

  /**
   * Get all test results
   */
  getResults(): PerformanceTestResult[] {
    return this.results;
  }

  /**
   * Get all benchmark results
   */
  getBenchmarks(): BenchmarkResult[] {
    return this.benchmarks;
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.results = [];
    this.benchmarks = [];
  }

  /**
   * Compare current performance against industry benchmarks
   */
  compareWithIndustryBenchmarks(
    testResult: PerformanceTestResult,
  ): Record<string, any> {
    // Industry benchmarks (these would be based on research/standards)
    const industryBenchmarks = {
      DocumentProcessing: {
        documentsPerSecond: 5, // documents per second
        bytesPerSecond: 1024 * 1024 * 2, // 2 MB per second
      },
      VectorSearch: {
        averageQueryTime: 100, // 100ms
        queriesPerSecond: 10, // 10 QPS
      },
      RagQuery: {
        averageQueryTime: 1000, // 1 second
        queriesPerSecond: 1, // 1 QPS
      },
    };

    const benchmarkCategory =
      testResult.testName as keyof typeof industryBenchmarks;
    const benchmark = industryBenchmarks[benchmarkCategory];

    if (!benchmark) {
      return { message: "No industry benchmarks available for this test type" };
    }

    const comparison: Record<string, any> = {
      testName: testResult.testName,
      metrics: {},
    };

    // Compare each metric with industry benchmark
    for (const [metric, value] of Object.entries(testResult.metrics)) {
      if (metric in benchmark) {
        const benchmarkValue = benchmark[metric as keyof typeof benchmark];
        const percentageDiff =
          ((value - benchmarkValue) / benchmarkValue) * 100;

        comparison.metrics[metric] = {
          actual: value,
          benchmark: benchmarkValue,
          percentageDiff,
          status: percentageDiff >= 0 ? "above" : "below",
        };
      }
    }

    return comparison;
  }
}

// Create a singleton instance
const performanceTestingService = new PerformanceTestingService();
export default performanceTestingService;
