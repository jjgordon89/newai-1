/**
 * RAG System - Main entry point for the RAG functionality
 * This file provides a simplified API for the application to interact with the RAG system
 */

import { RagServiceSettings, ragService } from './ragService';
import { enhancedRagService } from './enhancedRagService';

// Simple initialization function to replace the missing import
function initializeRagSystem(settings?: any) {
  console.log("Initializing RAG system with settings:", settings);
  // In a real implementation, this would configure the RAG system
}

// Simple implementation for the missing queryWithAdvancedRag function
async function queryWithAdvancedRag(query: string, options?: any) {
  console.log("Querying with advanced RAG:", query, options);
  
  const results = await ragService.retrieveDocuments({
    query,
    topK: options?.topK,
    similarityThreshold: options?.similarityThreshold
  });
  
  const context = await enhancedRagService.getEnhancedContext(results);
  const citations = "Sources: " + results.results.map((r: any, i: number) =>
    `[${i+1}] ${r.metadata?.title || 'Document'}`).join(', ');
  
  return {
    context,
    citations,
    results: results.results,
    expandedQuery: results.expandedQuery
  };
}

// Initialize with default settings
initializeRagSystem();

/**
 * Main API for the RAG system
 */
export const RagSystem = {
  /**
   * Update the RAG system settings
   */
  updateSettings(settings: Partial<RagServiceSettings>): void {
    // Update both services
    ragService.updateSettings(settings);
    enhancedRagService.updateSettings(settings);
  },

  /**
   * Process a query using the RAG system
   */
  async query(query: string, options: {
    useAdvancedFeatures?: boolean;
    topK?: number;
    similarityThreshold?: number;
  } = {}): Promise<{
    context: string;
    citations: string;
    results: any[];
    expandedQuery?: string;
  }> {
    const { useAdvancedFeatures = true, topK, similarityThreshold } = options;

    if (useAdvancedFeatures) {
      // Use advanced RAG features
      return queryWithAdvancedRag(query, {
        topK,
        similarityThreshold
      });
    } else {
      // Use basic RAG
      const retrievalResponse = await ragService.retrieveDocuments({
        query,
        topK,
        similarityThreshold
      });

      const context = await ragService.getEnhancedContext(retrievalResponse);
      const citations = ragService.generateCitations(retrievalResponse);

      return {
        context,
        citations,
        results: retrievalResponse.results,
        expandedQuery: retrievalResponse.expandedQuery
      };
    }
  },

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    initializeRagSystem();
  },

  /**
   * Apply optimized settings
   */
  applyOptimizedSettings(): void {
    initializeRagSystem({
      chunkingStrategy: 'hybrid',
      chunkSize: 1024,
      chunkOverlap: 200,
      indexingMethod: 'hnsw',
      retrieverStrategy: 'hybrid',
      useQueryExpansion: true,
      useReranking: true,
      queryRouting: 'hybrid',
      rerankerModel: 'reciprocal-rank-fusion',
      hybridSearchWeights: { vector: 0.7, keyword: 0.3 },
      includeMetadata: true,
      enableQueryDecomposition: true,
      relevanceScoring: 'cosine',
      summarization: true
    });
  }
};

// Export key types and interfaces for convenience
export type { RagServiceSettings } from './ragService';
export type { EnhancedRetrievalResult } from './enhancedRagService';