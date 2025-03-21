/**
 * Document Processing Pipeline
 *
 * This module provides a comprehensive pipeline for processing documents:
 * 1. Document parsing (PDF, TXT, DOCX, etc.)
 * 2. Text extraction and cleaning
 * 3. Chunking strategies
 * 4. Embedding generation
 * 5. Vector database storage
 */

import { processDocumentFile } from "./api";
import { HuggingFaceEmbeddingGenerator } from "./huggingFaceEmbeddings";
import { addDocumentToVectorStore } from "./lanceDbService";

// Document types supported by the pipeline
export type DocumentType =
  | "pdf"
  | "txt"
  | "docx"
  | "csv"
  | "md"
  | "json"
  | "html";

// Document metadata interface
export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  [key: string]: any; // Additional metadata fields
}

// Processed document interface
export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType | string;
  createdAt: Date;
  metadata: DocumentMetadata;
  chunks?: DocumentChunk[];
  summary?: string;
  entities?: DocumentEntity[];
  keywords?: string[];
  categories?: string[];
  relations?: DocumentRelation[];
}

// Document entity interface
export interface DocumentEntity {
  id: string;
  text: string;
  type: string; // person, organization, location, date, etc.
  startIndex?: number;
  endIndex?: number;
  confidence?: number;
  metadata?: Record<string, any>;
}

// Document relation interface
export interface DocumentRelation {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

// Document chunk interface
export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  metadata: {
    chunkIndex: number;
    [key: string]: any;
  };
}

// Chunking strategy options
export type ChunkingStrategy = "fixed" | "paragraph" | "semantic" | "hybrid";

// Chunking options
export interface ChunkingOptions {
  strategy: ChunkingStrategy;
  chunkSize: number;
  chunkOverlap: number;
  separator?: string;
}

// Default chunking options
const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  strategy: "paragraph",
  chunkSize: 1000,
  chunkOverlap: 200,
};

/**
 * Process a document file through the pipeline
 * @param file The file to process
 * @param workspaceId The workspace ID
 * @param options Chunking options
 * @returns The processed document
 */
export async function processDocument(
  file: File,
  workspaceId: string,
  options: Partial<ChunkingOptions> = {},
): Promise<ProcessedDocument> {
  try {
    // 1. Extract text from document
    const extractedData = await processDocumentFile(file);

    // 2. Generate a unique document ID
    const docId = crypto.randomUUID();

    // 3. Create document metadata
    const metadata: DocumentMetadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      processingStatus: "complete",
      language: detectLanguage(extractedData.text),
      contentLength: extractedData.text.length,
      ...extractedData.metadata,
    };

    // 4. Create the processed document
    const document: ProcessedDocument = {
      id: docId,
      title: extractTitle(file.name, extractedData),
      content: extractedData.text,
      type: extractedData.type,
      createdAt: new Date(),
      metadata,
      summary: await generateDocumentSummary(extractedData.text),
      entities: await extractEntities(extractedData.text),
    };

    // 5. Chunk the document
    const chunkingOptions = { ...DEFAULT_CHUNKING_OPTIONS, ...options };
    document.chunks = chunkDocument(document, chunkingOptions);

    // 6. Add to vector store
    await addDocumentToVectorStore(workspaceId, document);

    return document;
  } catch (error) {
    console.error("Error processing document:", error);
    throw new Error(
      `Failed to process document: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Chunk a document based on the specified strategy
 * @param document The document to chunk
 * @param options Chunking options
 * @returns Array of document chunks
 */
export function chunkDocument(
  document: ProcessedDocument,
  options: ChunkingOptions,
): DocumentChunk[] {
  const { strategy, chunkSize, chunkOverlap } = options;
  const content = document.content;
  const chunks: DocumentChunk[] = [];

  switch (strategy) {
    case "fixed":
      return chunkByFixedSize(document, chunkSize, chunkOverlap);

    case "paragraph":
      return chunkByParagraph(document, chunkSize, chunkOverlap);

    case "semantic":
      // For now, fall back to paragraph chunking
      // In a real implementation, this would use semantic boundaries
      return chunkByParagraph(document, chunkSize, chunkOverlap);

    case "hybrid":
      // For now, fall back to paragraph chunking
      // In a real implementation, this would combine multiple strategies
      return chunkByParagraph(document, chunkSize, chunkOverlap);

    default:
      return chunkByParagraph(document, chunkSize, chunkOverlap);
  }
}

/**
 * Chunk a document by fixed size
 * @param document The document to chunk
 * @param chunkSize The size of each chunk
 * @param chunkOverlap The overlap between chunks
 * @returns Array of document chunks
 */
function chunkByFixedSize(
  document: ProcessedDocument,
  chunkSize: number,
  chunkOverlap: number,
): DocumentChunk[] {
  const content = document.content;
  const chunks: DocumentChunk[] = [];

  // Calculate effective chunk size
  const effectiveChunkSize = chunkSize - chunkOverlap;

  // Create chunks
  for (let i = 0; i < content.length; i += effectiveChunkSize) {
    const start = i;
    const end = Math.min(i + chunkSize, content.length);
    const chunkContent = content.substring(start, end);

    // Skip empty chunks
    if (chunkContent.trim().length === 0) continue;

    chunks.push({
      id: `${document.id}-chunk-${chunks.length}`,
      documentId: document.id,
      content: chunkContent,
      metadata: {
        chunkIndex: chunks.length,
        fileName: document.metadata.fileName,
        fileType: document.metadata.fileType,
        start,
        end,
      },
    });
  }

  return chunks;
}

/**
 * Chunk a document by paragraphs
 * @param document The document to chunk
 * @param maxChunkSize The maximum size of each chunk
 * @param chunkOverlap The overlap between chunks
 * @returns Array of document chunks
 */
function chunkByParagraph(
  document: ProcessedDocument,
  maxChunkSize: number,
  chunkOverlap: number,
): DocumentChunk[] {
  const content = document.content;
  const chunks: DocumentChunk[] = [];

  // Split by paragraphs (double newlines)
  const paragraphs = content.split(/\n\s*\n/);
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (trimmedParagraph.length === 0) continue;

    // If adding this paragraph would exceed the max chunk size,
    // save the current chunk and start a new one
    if (
      currentChunk.length + trimmedParagraph.length > maxChunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        id: `${document.id}-chunk-${chunks.length}`,
        documentId: document.id,
        content: currentChunk,
        metadata: {
          chunkIndex: chunks.length,
          fileName: document.metadata.fileName,
          fileType: document.metadata.fileType,
        },
      });

      // Start new chunk with overlap
      const words = currentChunk.split(" ");
      const overlapWordCount = Math.floor(chunkOverlap / 5); // Approximate words in overlap
      currentChunk = words.slice(-overlapWordCount).join(" ");
    }

    // Add paragraph to current chunk
    if (currentChunk.length > 0) {
      currentChunk += "\n\n";
    }
    currentChunk += trimmedParagraph;
  }

  // Add the final chunk if it's not empty
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `${document.id}-chunk-${chunks.length}`,
      documentId: document.id,
      content: currentChunk,
      metadata: {
        chunkIndex: chunks.length,
        fileName: document.metadata.fileName,
        fileType: document.metadata.fileType,
      },
    });
  }

  return chunks;
}

/**
 * Process multiple documents in batch
 * @param files Array of files to process
 * @param workspaceId The workspace ID
 * @param options Chunking options
 * @returns Array of processed documents
 */
export async function batchProcessDocuments(
  files: File[],
  workspaceId: string,
  options: Partial<ChunkingOptions> = {},
): Promise<ProcessedDocument[]> {
  const results: ProcessedDocument[] = [];
  const errors: { fileName: string; error: string }[] = [];

  for (const file of files) {
    try {
      const document = await processDocument(file, workspaceId, options);
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

/**
 * Get the MIME type for a document type
 * @param type The document type
 * @returns The MIME type
 */
export function getMimeTypeForDocumentType(type: DocumentType): string {
  switch (type) {
    case "pdf":
      return "application/pdf";
    case "txt":
      return "text/plain";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "csv":
      return "text/csv";
    case "md":
      return "text/markdown";
    case "json":
      return "application/json";
    case "html":
      return "text/html";
    default:
      return "application/octet-stream";
  }
}

/**
 * Detect the language of a text
 * @param text The text to analyze
 * @returns The detected language code
 */
function detectLanguage(text: string): string {
  // This is a simplified implementation
  // In a real application, you would use a language detection library
  // such as franc, langdetect, or a cloud API

  // For now, we'll just return English
  return "en";
}

/**
 * Extract a meaningful title from the document
 * @param fileName The original file name
 * @param extractedData The extracted document data
 * @returns A cleaned and meaningful title
 */
function extractTitle(fileName: string, extractedData: any): string {
  // Try to extract title from metadata if available
  if (extractedData.metadata?.title) {
    return extractedData.metadata.title;
  }

  // For HTML documents, use the title tag if available
  if (extractedData.type === "html" && extractedData.metadata?.title) {
    return extractedData.metadata.title;
  }

  // For markdown, try to use the first heading
  if (
    extractedData.type === "md" &&
    extractedData.metadata?.headings &&
    extractedData.metadata.headings.length > 0
  ) {
    return extractedData.metadata.headings[0].text;
  }

  // Clean up the filename as a fallback
  let title = fileName;

  // Remove file extension
  title = title.replace(/\.[^/.]+$/, "");

  // Replace underscores and hyphens with spaces
  title = title.replace(/[_-]/g, " ");

  // Title case the string
  title = title.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });

  return title;
}

/**
 * Generate a summary for the document
 * @param text The document text
 * @returns A summary of the document
 */
async function generateDocumentSummary(text: string): Promise<string> {
  // In a real implementation, this would use an LLM or summarization algorithm
  // For now, we'll just return the first 200 characters as a simple summary
  const firstParagraph = text.split("\n\n")[0] || text;
  return (
    firstParagraph.substring(0, 200) +
    (firstParagraph.length > 200 ? "..." : "")
  );
}

/**
 * Extract entities from document text
 * @param text The document text
 * @returns Array of extracted entities
 */
async function extractEntities(text: string): Promise<DocumentEntity[]> {
  // In a real implementation, this would use NER (Named Entity Recognition)
  // For now, we'll return an empty array
  // This is a placeholder for future implementation
  return [];
}

/**
 * Get the document type from a MIME type
 * @param mimeType The MIME type
 * @returns The document type
 */
export function getDocumentTypeFromMimeType(
  mimeType: string,
): DocumentType | string {
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("text/plain")) return "txt";
  if (mimeType.includes("word")) return "docx";
  if (mimeType.includes("csv")) return "csv";
  if (mimeType.includes("markdown")) return "md";
  if (mimeType.includes("json")) return "json";
  if (mimeType.includes("html")) return "html";
  return mimeType;
}
