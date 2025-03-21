/**
 * Document Processor Service
 *
 * Provides a comprehensive pipeline for processing documents:
 * 1. Text extraction
 * 2. Metadata extraction
 * 3. Text preprocessing
 * 4. Document chunking
 */

import { v4 as uuidv4 } from "uuid";
import { extractTextFromFile } from "./textExtraction";
import { extractMetadata, DocumentMetadata } from "./metadataExtraction";
import { preprocessDocumentText } from "./documentPreprocessing";
import {
  chunkDocument,
  ChunkingOptions,
  DEFAULT_CHUNKING_OPTIONS,
  DocumentChunk,
} from "./documentChunking";

// Processed document interface
export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  rawContent: string;
  type: string;
  createdAt: Date;
  metadata: DocumentMetadata;
  chunks: DocumentChunk[];
}

// Processing options
export interface ProcessingOptions {
  chunking: ChunkingOptions;
  preprocessing: {
    removeHtml?: boolean;
    expandContractions?: boolean;
    removeBoilerplate?: boolean;
    normalizeWhitespace?: boolean;
  };
}

// Default processing options
export const DEFAULT_PROCESSING_OPTIONS: ProcessingOptions = {
  chunking: DEFAULT_CHUNKING_OPTIONS,
  preprocessing: {
    removeHtml: true,
    expandContractions: false,
    removeBoilerplate: true,
    normalizeWhitespace: true,
  },
};

/**
 * Process a document file through the pipeline
 */
export async function processDocument(
  file: File,
  options: Partial<ProcessingOptions> = {},
): Promise<ProcessedDocument> {
  try {
    // Merge options with defaults
    const processingOptions: ProcessingOptions = {
      chunking: { ...DEFAULT_PROCESSING_OPTIONS.chunking, ...options.chunking },
      preprocessing: {
        ...DEFAULT_PROCESSING_OPTIONS.preprocessing,
        ...options.preprocessing,
      },
    };

    // 1. Extract text from document
    const extractedText = await extractTextFromFile(file);

    // 2. Extract metadata
    const metadata = extractMetadata(file, extractedText);

    // 3. Preprocess text
    const processedText = preprocessDocumentText(
      extractedText.text,
      processingOptions.preprocessing,
    );

    // 4. Generate a unique document ID
    const docId = uuidv4();

    // 5. Create the processed document
    const document: ProcessedDocument = {
      id: docId,
      title: metadata.title || file.name,
      content: processedText,
      rawContent: extractedText.text,
      type: metadata.fileType,
      createdAt: new Date(),
      metadata,
      chunks: [],
    };

    // 6. Chunk the document
    document.chunks = chunkDocument(
      docId,
      processedText,
      processingOptions.chunking,
      {
        fileName: file.name,
        fileType: metadata.fileType,
      },
    );

    return document;
  } catch (error) {
    console.error("Error processing document:", error);
    throw new Error(
      `Failed to process document: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Process multiple documents in batch
 */
export async function batchProcessDocuments(
  files: File[],
  options: Partial<ProcessingOptions> = {},
): Promise<ProcessedDocument[]> {
  const results: ProcessedDocument[] = [];
  const errors: { fileName: string; error: string }[] = [];

  for (const file of files) {
    try {
      const document = await processDocument(file, options);
      results.push(document);
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      errors.push({
        fileName: file.name,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (errors.length > 0) {
    console.warn(`Completed with ${errors.length} errors:`, errors);
  }

  return results;
}
