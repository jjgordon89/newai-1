import { HuggingFaceEmbeddingGenerator, EmbeddingGenerator, EmbeddingVector } from './huggingFaceEmbeddings';
import { LanceDBAdapter } from './lanceDatabaseAdapter';
import { configureRagFromPreferences } from './ragIntegration';

/**
 * Interface for a vector database store
 */
export interface VectorStore {
  addDocument(text: string, embedding: number[], metadata?: Record<string, any>): Promise<string>;
  search(embedding: number[], limit?: number, scoreThreshold?: number): Promise<any[]>;
  deleteDocument(id: string): Promise<boolean>;
  clearAll(): Promise<boolean>;
}

/**
 * Default embedding generator implementation using the Hugging Face embeddings
 */
export class DefaultEmbeddingGenerator implements EmbeddingGenerator {
  private generator: HuggingFaceEmbeddingGenerator;
  
  constructor(modelId?: string) {
    this.generator = new HuggingFaceEmbeddingGenerator(modelId);
  }
  
  async generateEmbedding(text: string) {
    return this.generator.generateEmbedding(text);
  }
  
  async generateEmbeddings(texts: string[]) {
    return this.generator.generateEmbeddings(texts);
  }
}

/**
 * LanceDB vector store implementation
 */
export class LanceDbStore implements VectorStore {
  private db: LanceDBAdapter;
  
  constructor(options: { embeddingDimensions: number, includeMetadata?: boolean }) {
    this.db = new LanceDBAdapter(options);
  }
  
  async addDocument(text: string, embedding: number[], metadata?: Record<string, any>) {
    return this.db.addDocument(text, embedding, metadata);
  }
  
  async search(embedding: number[], limit?: number, scoreThreshold?: number) {
    return this.db.search(embedding, limit, scoreThreshold);
  }
  
  async deleteDocument(id: string) {
    return this.db.deleteDocument(id);
  }
  
  async clearAll() {
    return this.db.clearAll();
  }
}

/**
 * Enhanced RAG Service configuration options
 */
export interface EnhancedRagServiceOptions {
  embeddingModel?: string;
  useHuggingFaceEmbeddings?: boolean;
  embeddingDimensions?: number;
  includeMetadata?: boolean;
  topK?: number;
  similarityThreshold?: number;
}

/**
 * Define the EnhancedRagService interface to match the extended functionality
 */
export interface EnhancedRagService {
  embeddingGenerator: EmbeddingGenerator;
  vectorStore: VectorStore;
  ragService: any;
  processText(text: string, metadata?: Record<string, any>): Promise<string>;
  query(query: string, limit?: number): Promise<any[]>;
  updateSettings(settings: any): void;
  getEnhancedContext(retrievalResult: any): Promise<string>;
}

/**
 * Create an enhanced RAG service with the given options
 * @param options Configuration options
 * @returns Enhanced RAG service instance
 */
export function createEnhancedRagService(options: EnhancedRagServiceOptions = {}): EnhancedRagService {
  // Get embedding dimensions based on model or default
  const embeddingDimensions = options.embeddingDimensions || 384;
  
  // Create embedding generator
  const embeddingGenerator = options.useHuggingFaceEmbeddings !== false
    ? new DefaultEmbeddingGenerator(options.embeddingModel)
    : new DefaultEmbeddingGenerator(); // Fallback to default model
  
  // Create vector store
  const vectorStore = new LanceDbStore({
    embeddingDimensions,
    includeMetadata: options.includeMetadata
  });
  
  // Configure RAG preferences
  const ragService = configureRagFromPreferences({
    embeddingModel: options.embeddingModel,
    useHuggingFaceEmbeddings: options.useHuggingFaceEmbeddings,
    topK: options.topK,
    similarityThreshold: options.similarityThreshold,
    includeMetadata: options.includeMetadata
  });
  
  const service: EnhancedRagService = {
    embeddingGenerator,
    vectorStore,
    ragService,
    
    /**
     * Process text into embeddings and add to the vector store
     * @param text Text to process
     * @param metadata Optional metadata
     * @returns Document ID
     */
    async processText(text: string, metadata?: Record<string, any>): Promise<string> {
      const embedding = await embeddingGenerator.generateEmbedding(text);
      return vectorStore.addDocument(text, embedding.values, metadata);
    },
    
    /**
     * Retrieve relevant documents for a query
     * @param query Query text
     * @param limit Maximum number of results (default: from options or 3)
     * @returns Relevant documents
     */
    async query(query: string, limit?: number): Promise<any[]> {
      const embedding = await embeddingGenerator.generateEmbedding(query);
      return vectorStore.search(
        embedding.values,
        limit || options.topK || 3,
        options.similarityThreshold
      );
    },
    
    /**
     * Update the RAG service settings
     * @param settings New settings to apply
     */
    updateSettings(settings: any): void {
      console.log("Updating enhanced RAG settings:", settings);
      // In a real implementation, this would update various settings
    },
    
    /**
     * Generate enhanced context from retrieval results
     * @param retrievalResult Results from retrieval
     * @returns Formatted context string
     */
    async getEnhancedContext(retrievalResult: any): Promise<string> {
      console.log("Generating enhanced context from retrieval results");
      
      // For demo purposes, we'll generate a structured context from the search results
      if (!retrievalResult.results || retrievalResult.results.length === 0) {
        return "No relevant context found.";
      }
      
      // Format the context from the results
      const contextParts = retrievalResult.results.map((doc: any, index: number) => {
        const similarity = doc.metadata?.similarity
          ? `${Math.round(doc.metadata.similarity)}% relevance`
          : '';
        
        const title = doc.metadata?.title || `Document ${index + 1}`;
        
        return `--- Document: ${title} ${similarity ? `(${similarity})` : ''} ---\n${doc.content}\n`;
      });
      
      return contextParts.join('\n');
    }
  };
  
  return service;
}

// Create a default instance with default settings
export const enhancedRagService = createEnhancedRagService({
  useHuggingFaceEmbeddings: true,
  embeddingModel: "BAAI/bge-small-en-v1.5",
  embeddingDimensions: 384,
  includeMetadata: true,
  topK: 3,
  similarityThreshold: 70
});

// Add missing methods to match what's used in the application
enhancedRagService.updateSettings = (settings: any) => {
  // Implementation would update the service settings
  console.log("Updating enhanced RAG settings:", settings);
};

enhancedRagService.getEnhancedContext = async (retrievalResult: any) => {
  console.log("Generating enhanced context from retrieval results");
  
  // For demo purposes, we'll generate a structured context from the search results
  if (!retrievalResult.results || retrievalResult.results.length === 0) {
    return "No relevant context found.";
  }
  
  // Format the context from the results
  const contextParts = retrievalResult.results.map((doc: any, index: number) => {
    const similarity = doc.metadata?.similarity
      ? `${Math.round(doc.metadata.similarity)}% relevance`
      : '';
    
    const title = doc.metadata?.title || `Document ${index + 1}`;
    
    return `--- Document: ${title} ${similarity ? `(${similarity})` : ''} ---\n${doc.content}\n`;
  });
  
  return contextParts.join('\n');
};

/**
 * Initialize RAG with LanceDB for a specific workspace
 * @param workspaceId The ID of the workspace to initialize
 * @returns The initialized RAG service
 */
export function initializeRagWithLanceDb(workspaceId: string) {
  console.log(`Initializing RAG with LanceDB for workspace: ${workspaceId}`);
  
  // For the demo purposes, we just return the existing service
  // In a real implementation, this would create a workspace-specific instance
  return enhancedRagService;
}

/**
 * Enhanced retrieval result type
 */
export interface EnhancedRetrievalResult {
  results: any[];
  context: string;
  citations: string;
  expandedQuery?: string;
}

export default createEnhancedRagService;