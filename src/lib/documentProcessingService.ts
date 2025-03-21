/**
 * Document Processing Service
 *
 * Provides a comprehensive pipeline for processing documents:
 * 1. Document parsing (PDF, TXT, DOCX, etc.)
 * 2. Text extraction and cleaning
 * 3. Chunking strategies
 * 4. Embedding generation
 * 5. Vector database storage
 */

import { v4 as uuidv4 } from "uuid";
import { processDocumentFile } from "./fileProcessors";
import {
  chunkDocument,
  ChunkingOptions,
  DEFAULT_CHUNKING_OPTIONS,
  DocumentChunk,
} from "./documentChunker";
import {
  documentStorage,
  DocumentMetadata,
  documentUploadService,
} from "./documentStorage";
import { addDocumentToVectorStore, VectorDocument } from "./lanceDbService";

// Document types supported by the pipeline
export type DocumentType =
  | "pdf"
  | "txt"
  | "docx"
  | "csv"
  | "md"
  | "json"
  | "html";

// Processed document interface
export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType | string;
  createdAt: Date;
  metadata: DocumentMetadata;
  chunks?: DocumentChunk[];
}

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
    const docId = uuidv4();

    // 3. Create document metadata
    const metadata: DocumentMetadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      version: 1,
      lastModified: file.lastModified,
      ...extractedData.metadata,
    };

    // 4. Create the processed document
    const document: ProcessedDocument = {
      id: docId,
      title: file.name,
      content: extractedData.text,
      type: extractedData.type,
      createdAt: new Date(),
      metadata,
    };

    // 5. Chunk the document
    const chunkingOptions = { ...DEFAULT_CHUNKING_OPTIONS, ...options };
    document.chunks = chunkDocument(docId, document.content, chunkingOptions, {
      fileName: file.name,
      fileType: extractedData.type,
    });

    // 6. Add to vector store
    await addDocumentToVectorStore(workspaceId, {
      id: document.id,
      title: document.title,
      content: document.content,
      type: document.type,
      createdAt: document.createdAt,
      metadata: document.metadata,
    });

    // 7. Save to document storage
    const repository = documentStorage.getRepository(workspaceId);
    await repository.saveDocument({
      id: document.id,
      title: document.title,
      content: document.content,
      type: document.type,
      createdAt: document.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      metadata: document.metadata,
    });

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

/**
 * Clean and normalize document text
 * @param text The text to clean
 * @returns The cleaned text
 */
export function cleanDocumentText(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, " ");

  // Remove control characters
  cleaned = cleaned.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  // Normalize line endings
  cleaned = cleaned.replace(/\r\n/g, "\n");

  // Trim the text
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Extract keywords from document text
 * @param text The document text
 * @param maxKeywords Maximum number of keywords to extract
 * @returns Array of keywords
 */
export function extractKeywords(
  text: string,
  maxKeywords: number = 10,
): string[] {
  // Simple keyword extraction based on word frequency
  // In a real implementation, you would use a more sophisticated algorithm

  // Remove common stop words
  const stopWords = new Set([
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
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "by",
    "about",
    "as",
    "of",
    "from",
    "this",
    "that",
    "these",
    "those",
    "it",
    "its",
    "they",
    "them",
    "their",
    "we",
    "us",
    "our",
    "you",
    "your",
    "he",
    "him",
    "his",
    "she",
    "her",
    "hers",
    "i",
    "me",
    "my",
    "mine",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "shall",
    "should",
    "can",
    "could",
    "may",
    "might",
    "must",
    "ought",
  ]);

  // Tokenize and count words
  const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
  const wordCounts: Record<string, number> = {};

  for (const word of words) {
    if (!stopWords.has(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }

  // Sort by frequency and return top keywords
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}
