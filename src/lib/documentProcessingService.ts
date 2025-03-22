/**
 * Document Processing Service
 * 
 * Handles the end-to-end process of uploading, processing, chunking,
 * and indexing documents for search and retrieval
 */

import { v4 as uuidv4 } from 'uuid';
import { HuggingFaceEmbeddingGenerator } from './huggingFaceEmbeddings';
import { DocumentIndexingService } from './documentIndexingService';
import { chunkDocument, ChunkingOptions, DEFAULT_CHUNKING_OPTIONS } from './documentChunker';
import { textExtractorFactory } from './textExtraction';

// Document storage interface
export interface StorageManager {
  saveDocument(documentId: string, content: string, metadata: any): Promise<string>;
  retrieveDocument(documentId: string): Promise<{ content: string; metadata: any } | null>;
  deleteDocument(documentId: string): Promise<boolean>;
  listDocuments(workspaceId: string): Promise<any[]>;
}

// Types for document processing
export interface DocumentToProcess {
  id?: string;
  file: File;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    workspaceId: string;
    userId: string;
    uploadDate: Date;
    [key: string]: any;
  };
}

export interface ProcessingOptions {
  chunking: ChunkingOptions;
  embeddingModel: string;
  saveOriginal: boolean;
  extractMetadata: boolean;
  workspaceId: string;
}

export interface ProcessingResult {
  documentId: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    chunkCount: number;
    processingTimeMs: number;
    [key: string]: any;
  };
  success: boolean;
  error?: string;
}

export interface ProgressCallback {
  (progress: number, status: string, details?: any): void;
}

/**
 * Document Processing Service implementation
 */
export class DocumentProcessingService {
  private indexingService: DocumentIndexingService;
  private embeddingGenerator: HuggingFaceEmbeddingGenerator;
  private storageManager: StorageManager;
  private defaultOptions: ProcessingOptions;

  constructor(
    indexingService: DocumentIndexingService,
    embeddingGenerator: HuggingFaceEmbeddingGenerator,
    storageManager: StorageManager,
    defaultOptions?: Partial<ProcessingOptions>
  ) {
    this.indexingService = indexingService;
    this.embeddingGenerator = embeddingGenerator;
    this.storageManager = storageManager;
    
    // Set default options
    this.defaultOptions = {
      chunking: DEFAULT_CHUNKING_OPTIONS,
      embeddingModel: 'BAAI/bge-small-en-v1.5',
      saveOriginal: true,
      extractMetadata: true,
      workspaceId: 'default',
      ...defaultOptions
    };
  }

  /**
   * Process a document through the full pipeline
   */
  async processDocument(
    document: DocumentToProcess,
    options?: Partial<ProcessingOptions>,
    progressCallback?: ProgressCallback
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Merge options with defaults
      const processingOptions = {
        ...this.defaultOptions,
        ...options
      };
      
      // Generate a document ID if not provided
      const documentId = document.id || uuidv4();
      
      // Update workspace ID in the indexing service
      this.indexingService.setWorkspaceId(processingOptions.workspaceId);
      
      // Report progress: 5%
      progressCallback?.(5, 'Starting document processing');
      
      // Step 1: Extract text from the document
      progressCallback?.(10, 'Extracting text from document');
      const fileType = document.file.type || inferFileTypeFromName(document.file.name);
      const textExtractor = textExtractorFactory.getExtractor(fileType);
      
      if (!textExtractor) {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
      
      const extractedText = await textExtractor.extractText(document.file);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the document');
      }
      
      // Report progress: 30%
      progressCallback?.(30, 'Text extraction complete', { 
        textLength: extractedText.length 
      });
      
      // Step 2: Extract metadata if requested
      let extractedMetadata = {};
      if (processingOptions.extractMetadata) {
        progressCallback?.(35, 'Extracting metadata');
        // In a production app, we'd have more sophisticated metadata extraction
        extractedMetadata = {
          wordCount: extractedText.split(/\s+/).length,
          characterCount: extractedText.length,
          extractionDate: new Date().toISOString()
        };
      }
      
      // Report progress: 40%
      progressCallback?.(40, 'Metadata extraction complete');
      
      // Step 3: Save original document if requested
      if (processingOptions.saveOriginal) {
        progressCallback?.(45, 'Saving original document');
        await this.storageManager.saveDocument(
          documentId,
          extractedText,
          {
            ...document.metadata,
            ...extractedMetadata,
            processingOptions
          }
        );
      }
      
      // Report progress: 50%
      progressCallback?.(50, 'Chunking document');
      
      // Step 4: Chunk the document
      const chunks = chunkDocument(
        documentId,
        extractedText,
        processingOptions.chunking,
        {
          fileName: document.metadata.fileName,
          fileType: document.metadata.fileType,
          workspaceId: processingOptions.workspaceId,
          ...extractedMetadata
        }
      );
      
      // Report progress: 70%
      progressCallback?.(70, 'Indexing document chunks', { 
        chunkCount: chunks.length 
      });
      
      // Step 5: Index the chunks
      // Convert chunks to the format expected by the indexing service
      const indexingChunks = chunks.map(chunk => ({
        text: chunk.content,
        metadata: {
          ...chunk.metadata,
          documentId
        }
      }));
      
      const indexingResult = await this.indexingService.processDocumentChunks(indexingChunks);
      
      // Report progress: 100%
      progressCallback?.(100, 'Document processing complete');
      
      // Prepare result
      return {
        documentId,
        metadata: {
          ...document.metadata,
          ...extractedMetadata,
          chunkCount: chunks.length,
          processingTimeMs: Date.now() - startTime
        },
        success: true
      };
    } catch (error) {
      // Report error
      progressCallback?.(0, 'Error processing document', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return {
        documentId: document.id || 'unknown',
        metadata: {
          ...document.metadata,
          chunkCount: 0,
          processingTimeMs: Date.now() - startTime
        },
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Delete a document and all its chunks
   */
  async deleteDocument(documentId: string, workspaceId?: string): Promise<boolean> {
    try {
      // Set workspace ID if provided
      if (workspaceId) {
        this.indexingService.setWorkspaceId(workspaceId);
      }
      
      // Delete document chunks from the vector store
      await this.indexingService.deleteDocumentChunks(documentId);
      
      // Delete the original document if it exists
      await this.storageManager.deleteDocument(documentId);
      
      return true;
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      return false;
    }
  }

  /**
   * Get a list of all documents in a workspace
   */
  async listDocuments(workspaceId: string): Promise<any[]> {
    return this.storageManager.listDocuments(workspaceId);
  }
}

/**
 * Helper function to infer file type from filename
 */
function inferFileTypeFromName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
    case 'doc':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    case 'csv':
      return 'text/csv';
    case 'md':
      return 'text/markdown';
    case 'html':
    case 'htm':
      return 'text/html';
    default:
      return 'application/octet-stream';
  }
}
