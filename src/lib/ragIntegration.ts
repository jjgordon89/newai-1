import { HuggingFaceEmbeddingGenerator } from './huggingFaceEmbeddings';
import { LanceDBAdapter } from './lanceDatabaseAdapter';
import { configureWebSearch } from './webSearchService';

// Configuration options for the RAG system
export interface RagConfiguration {
  embeddingModel?: string;
  useHuggingFaceEmbeddings?: boolean;
  chunkingStrategy?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  retrieverStrategy?: string;
  reranker?: string;
  queryRouting?: string;
  useQueryExpansion?: boolean;
  includeMetadata?: boolean;
  topK?: number;
  similarityThreshold?: number;
  enhancedContext?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: RagConfiguration = {
  embeddingModel: 'BAAI/bge-small-en-v1.5',
  useHuggingFaceEmbeddings: true,
  chunkingStrategy: 'hybrid',
  chunkSize: 1024,
  chunkOverlap: 200,
  retrieverStrategy: 'hybrid',
  reranker: 'reciprocal-rank-fusion',
  queryRouting: 'hybrid',
  useQueryExpansion: true,
  includeMetadata: true,
  topK: 3,
  similarityThreshold: 70,
  enhancedContext: false
};

// Global state
let ragEmbeddingGenerator: HuggingFaceEmbeddingGenerator | null = null;
let lanceDB: LanceDBAdapter | null = null;
let currentConfig: RagConfiguration = { ...DEFAULT_CONFIG };

/**
 * Initialize RAG services
 * @param config RAG configuration options
 */
export function initializeRagServices(config: RagConfiguration = DEFAULT_CONFIG): void {
  currentConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Initialize embedding generator
  if (currentConfig.useHuggingFaceEmbeddings) {
    console.log(`Initializing Hugging Face embeddings with model: ${currentConfig.embeddingModel}`);
    ragEmbeddingGenerator = new HuggingFaceEmbeddingGenerator(currentConfig.embeddingModel);
  } else {
    console.log('Using default embeddings');
    // Fallback to default embedding system - would be implementation specific
    ragEmbeddingGenerator = null;
  }
  
  // Initialize database adapter
  lanceDB = new LanceDBAdapter({
    embeddingDimensions: getEmbeddingDimensions(currentConfig.embeddingModel || ''),
    includeMetadata: currentConfig.includeMetadata || false
  });
  
  console.log('RAG services initialized with configuration:', currentConfig);
}

/**
 * Get the dimension size for a given embedding model
 */
function getEmbeddingDimensions(modelId: string): number {
  // This mapping could come from the EmbeddingModelSelector component's data
  const dimensionsMap: Record<string, number> = {
    'BAAI/bge-small-en-v1.5': 384,
    'BAAI/bge-base-en-v1.5': 768,
    'BAAI/bge-large-en-v1.5': 1024,
    'sentence-transformers/all-MiniLM-L6-v2': 384,
    'sentence-transformers/all-mpnet-base-v2': 768,
    'thenlper/gte-large': 1024,
    'intfloat/e5-large-v2': 1024,
    'jinaai/jina-embeddings-v2-base-en': 768
  };
  
  return dimensionsMap[modelId] || 384; // Default to 384 if model not found
}

/**
 * Configure the RAG system from user preferences
 * @param config Configuration options
 * @returns The RAG service
 */
export function configureRagFromPreferences(config: RagConfiguration): any {
  // Update the configuration
  currentConfig = { ...currentConfig, ...config };
  
  // Initialize RAG services with the new configuration
  initializeRagServices(currentConfig);
  
  // Return an object representing the RAG service
  return {
    config: currentConfig,
    embeddingGenerator: ragEmbeddingGenerator,
    vectorDB: lanceDB,
    
    // Generate embeddings for text
    async embedText(text: string): Promise<number[] | null> {
      if (!ragEmbeddingGenerator) return null;
      
      try {
        const embedding = await ragEmbeddingGenerator.generateEmbedding(text);
        return embedding.values;
      } catch (error) {
        console.error('Error generating embedding:', error);
        return null;
      }
    },
    
    // Get relevant documents for a query
    async getRelevantDocuments(query: string, options?: { limit?: number }): Promise<any[]> {
      if (!lanceDB || !ragEmbeddingGenerator) return [];
      
      try {
        const limit = options?.limit || currentConfig.topK || 3;
        const embedding = await ragEmbeddingGenerator.generateEmbedding(query);
        
        // Search for relevant documents
        const results = await lanceDB.search(embedding.values, limit);
        return results;
      } catch (error) {
        console.error('Error retrieving relevant documents:', error);
        return [];
      }
    },
    
    // Check if the RAG system is properly configured
    isConfigured(): boolean {
      return !!ragEmbeddingGenerator && !!lanceDB;
    }
  };
}

/**
 * Reset RAG configuration to defaults
 */
export function resetRagConfiguration(): void {
  initializeRagServices(DEFAULT_CONFIG);
}

/**
 * Get current RAG configuration
 */
export function getCurrentRagConfiguration(): RagConfiguration {
  return { ...currentConfig };
}

// Initialize with defaults
initializeRagServices();

export default {
  configureRagFromPreferences,
  resetRagConfiguration,
  getCurrentRagConfiguration
};