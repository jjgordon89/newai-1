/**
 * Document Chunking Service
 *
 * Provides strategies for chunking documents into smaller pieces for processing
 */

import { v4 as uuidv4 } from "uuid";

// Document chunk interface
export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  metadata: {
    chunkIndex: number;
    startOffset?: number;
    endOffset?: number;
    [key: string]: any;
  };
}

// Chunking strategy options
export type ChunkingStrategy = "fixed" | "paragraph" | "sentence" | "hybrid";

// Chunking options
export interface ChunkingOptions {
  strategy: ChunkingStrategy;
  chunkSize: number;
  chunkOverlap: number;
  separator?: string;
}

// Default chunking options
export const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  strategy: "paragraph",
  chunkSize: 1000,
  chunkOverlap: 200,
};

/**
 * Chunk a document based on the specified strategy
 */
export function chunkDocument(
  documentId: string,
  content: string,
  options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS,
  metadata: Record<string, any> = {},
): DocumentChunk[] {
  const { strategy, chunkSize, chunkOverlap } = options;

  switch (strategy) {
    case "fixed":
      return chunkByFixedSize(
        documentId,
        content,
        chunkSize,
        chunkOverlap,
        metadata,
      );

    case "paragraph":
      return chunkByParagraph(
        documentId,
        content,
        chunkSize,
        chunkOverlap,
        metadata,
      );

    case "sentence":
      return chunkBySentence(
        documentId,
        content,
        chunkSize,
        chunkOverlap,
        metadata,
      );

    case "hybrid":
      return chunkByHybrid(
        documentId,
        content,
        chunkSize,
        chunkOverlap,
        metadata,
      );

    default:
      return chunkByParagraph(
        documentId,
        content,
        chunkSize,
        chunkOverlap,
        metadata,
      );
  }
}

/**
 * Chunk a document by fixed size
 */
export function chunkByFixedSize(
  documentId: string,
  content: string,
  chunkSize: number,
  chunkOverlap: number,
  metadata: Record<string, any> = {},
): DocumentChunk[] {
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
      id: uuidv4(),
      documentId,
      content: chunkContent,
      metadata: {
        chunkIndex: chunks.length,
        startOffset: start,
        endOffset: end,
        strategy: "fixed",
        ...metadata,
      },
    });
  }

  return chunks;
}

/**
 * Chunk a document by paragraphs
 */
export function chunkByParagraph(
  documentId: string,
  content: string,
  maxChunkSize: number,
  chunkOverlap: number,
  metadata: Record<string, any> = {},
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  // Split by paragraphs (double newlines)
  const paragraphs = content.split(/\n\s*\n/);
  let currentChunk = "";
  let currentChunkStartOffset = 0;
  let currentOffset = 0;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (trimmedParagraph.length === 0) {
      currentOffset += paragraph.length + 2; // +2 for the newlines
      continue;
    }

    // If adding this paragraph would exceed the max chunk size,
    // save the current chunk and start a new one
    if (
      currentChunk.length + trimmedParagraph.length > maxChunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        id: uuidv4(),
        documentId,
        content: currentChunk,
        metadata: {
          chunkIndex: chunks.length,
          startOffset: currentChunkStartOffset,
          endOffset: currentOffset - 2, // -2 to exclude the newlines
          strategy: "paragraph",
          ...metadata,
        },
      });

      // Start new chunk with overlap
      const words = currentChunk.split(" ");
      const overlapWordCount = Math.floor(chunkOverlap / 5); // Approximate words in overlap
      currentChunk = words.slice(-overlapWordCount).join(" ");
      currentChunkStartOffset = currentOffset - currentChunk.length;
    }

    // Add paragraph to current chunk
    if (currentChunk.length > 0) {
      currentChunk += "\n\n";
    }
    currentChunk += trimmedParagraph;

    // Update offset
    currentOffset += paragraph.length + 2; // +2 for the newlines
  }

  // Add the final chunk if it's not empty
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: uuidv4(),
      documentId,
      content: currentChunk,
      metadata: {
        chunkIndex: chunks.length,
        startOffset: currentChunkStartOffset,
        endOffset: currentOffset,
        strategy: "paragraph",
        ...metadata,
      },
    });
  }

  return chunks;
}

/**
 * Chunk a document by sentences
 */
export function chunkBySentence(
  documentId: string,
  content: string,
  maxChunkSize: number,
  chunkOverlap: number,
  metadata: Record<string, any> = {},
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  // Simple sentence splitting (not perfect but works for most cases)
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  let currentChunk = "";
  let currentChunkStartOffset = 0;
  let currentOffset = 0;

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (trimmedSentence.length === 0) {
      currentOffset += sentence.length;
      continue;
    }

    // If adding this sentence would exceed the max chunk size,
    // save the current chunk and start a new one
    if (
      currentChunk.length + trimmedSentence.length > maxChunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        id: uuidv4(),
        documentId,
        content: currentChunk,
        metadata: {
          chunkIndex: chunks.length,
          startOffset: currentChunkStartOffset,
          endOffset: currentOffset,
          strategy: "sentence",
          ...metadata,
        },
      });

      // Start new chunk with overlap
      const words = currentChunk.split(" ");
      const overlapWordCount = Math.floor(chunkOverlap / 5); // Approximate words in overlap
      currentChunk = words.slice(-overlapWordCount).join(" ");
      currentChunkStartOffset = currentOffset - currentChunk.length;
    }

    // Add sentence to current chunk
    if (currentChunk.length > 0 && !currentChunk.endsWith(" ")) {
      currentChunk += " ";
    }
    currentChunk += trimmedSentence;

    // Update offset
    currentOffset += sentence.length;
  }

  // Add the final chunk if it's not empty
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: uuidv4(),
      documentId,
      content: currentChunk,
      metadata: {
        chunkIndex: chunks.length,
        startOffset: currentChunkStartOffset,
        endOffset: currentOffset,
        strategy: "sentence",
        ...metadata,
      },
    });
  }

  return chunks;
}

/**
 * Chunk a document using a hybrid approach
 * This combines paragraph and sentence chunking
 */
export function chunkByHybrid(
  documentId: string,
  content: string,
  maxChunkSize: number,
  chunkOverlap: number,
  metadata: Record<string, any> = {},
): DocumentChunk[] {
  // First split by paragraphs
  const paragraphs = content.split(/\n\s*\n/);
  const chunks: DocumentChunk[] = [];

  let currentChunkParagraphs: string[] = [];
  let currentChunkSize = 0;
  let currentOffset = 0;
  let currentChunkStartOffset = 0;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (trimmedParagraph.length === 0) {
      currentOffset += paragraph.length + 2; // +2 for the newlines
      continue;
    }

    // If adding this paragraph would exceed the max chunk size,
    // process the current paragraphs as a chunk
    if (
      currentChunkSize + trimmedParagraph.length > maxChunkSize &&
      currentChunkSize > 0
    ) {
      // Join the current paragraphs
      const currentContent = currentChunkParagraphs.join("\n\n");

      // If the content is still too large, split by sentences
      if (currentContent.length > maxChunkSize) {
        const sentenceChunks = chunkBySentence(
          documentId,
          currentContent,
          maxChunkSize,
          chunkOverlap,
          {
            ...metadata,
            chunkingMethod: "hybrid-sentence",
            startOffset: currentChunkStartOffset,
          },
        );
        chunks.push(...sentenceChunks);
      } else {
        // Otherwise add as a single chunk
        chunks.push({
          id: uuidv4(),
          documentId,
          content: currentContent,
          metadata: {
            chunkIndex: chunks.length,
            startOffset: currentChunkStartOffset,
            endOffset: currentOffset - 2, // -2 to exclude the newlines
            strategy: "hybrid",
            chunkingMethod: "hybrid-paragraph",
            ...metadata,
          },
        });
      }

      // Reset for next chunk
      currentChunkParagraphs = [];
      currentChunkSize = 0;
      currentChunkStartOffset = currentOffset;
    }

    // Add paragraph to current chunk
    currentChunkParagraphs.push(trimmedParagraph);
    currentChunkSize += trimmedParagraph.length + 2; // +2 for the newlines
    currentOffset += paragraph.length + 2; // +2 for the newlines
  }

  // Process any remaining paragraphs
  if (currentChunkParagraphs.length > 0) {
    const currentContent = currentChunkParagraphs.join("\n\n");

    // If the content is too large, split by sentences
    if (currentContent.length > maxChunkSize) {
      const sentenceChunks = chunkBySentence(
        documentId,
        currentContent,
        maxChunkSize,
        chunkOverlap,
        {
          ...metadata,
          chunkingMethod: "hybrid-sentence",
          startOffset: currentChunkStartOffset,
        },
      );
      chunks.push(...sentenceChunks);
    } else {
      // Otherwise add as a single chunk
      chunks.push({
        id: uuidv4(),
        documentId,
        content: currentContent,
        metadata: {
          chunkIndex: chunks.length,
          startOffset: currentChunkStartOffset,
          endOffset: currentOffset,
          strategy: "hybrid",
          chunkingMethod: "hybrid-paragraph",
          ...metadata,
        },
      });
    }
  }

  return chunks;
}
