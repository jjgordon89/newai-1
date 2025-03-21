/**
 * Metadata Extraction Service
 *
 * Provides utilities for extracting metadata from documents
 */

import { ExtractedText } from "./textExtraction";

// Document metadata interface
export interface DocumentMetadata {
  // Basic file metadata
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  lastModified: number;

  // Content metadata
  charCount?: number;
  wordCount?: number;
  lineCount?: number;
  pageCount?: number;

  // Extracted metadata
  title?: string;
  author?: string;
  creationDate?: string;
  modificationDate?: string;
  keywords?: string[];
  language?: string;

  // Custom metadata
  [key: string]: any;
}

/**
 * Extract metadata from a file and its extracted text
 */
export function extractMetadata(
  file: File,
  extractedText: ExtractedText,
): DocumentMetadata {
  // Basic file metadata
  const metadata: DocumentMetadata = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.name.split(".").pop()?.toLowerCase() || "unknown",
    mimeType: file.type,
    lastModified: file.lastModified,
  };

  // Add content metadata from extracted text
  if (extractedText.metadata) {
    Object.assign(metadata, extractedText.metadata);
  }

  // Extract additional metadata based on file type
  const fileType = metadata.fileType;

  switch (fileType) {
    case "pdf":
      enhancePdfMetadata(metadata, extractedText);
      break;
    case "docx":
      enhanceDocxMetadata(metadata, extractedText);
      break;
    case "md":
      enhanceMarkdownMetadata(metadata, extractedText);
      break;
    case "txt":
      enhanceTxtMetadata(metadata, extractedText);
      break;
    default:
      // No additional metadata extraction
      break;
  }

  // Extract keywords if not already present
  if (!metadata.keywords) {
    metadata.keywords = extractKeywords(extractedText.text);
  }

  // Detect language if not already present
  if (!metadata.language) {
    metadata.language = detectLanguage(extractedText.text);
  }

  return metadata;
}

/**
 * Enhance metadata for PDF files
 */
function enhancePdfMetadata(
  metadata: DocumentMetadata,
  extractedText: ExtractedText,
): void {
  // In a real implementation, you would extract PDF-specific metadata
  // such as author, creation date, etc. from the PDF file
  // For now, we'll use placeholder values

  metadata.title = metadata.title || metadata.fileName.replace(/\.pdf$/i, "");
  metadata.pageCount = metadata.pageCount || 1;
}

/**
 * Enhance metadata for DOCX files
 */
function enhanceDocxMetadata(
  metadata: DocumentMetadata,
  extractedText: ExtractedText,
): void {
  // In a real implementation, you would extract DOCX-specific metadata
  // such as author, creation date, etc. from the DOCX file
  // For now, we'll use placeholder values

  metadata.title = metadata.title || metadata.fileName.replace(/\.docx$/i, "");
  metadata.pageCount = metadata.pageCount || 1;
}

/**
 * Enhance metadata for Markdown files
 */
function enhanceMarkdownMetadata(
  metadata: DocumentMetadata,
  extractedText: ExtractedText,
): void {
  // Extract title from first heading if available
  if (
    !metadata.title &&
    extractedText.metadata.headings &&
    extractedText.metadata.headings.length > 0
  ) {
    metadata.title = extractedText.metadata.headings[0].text;
  }

  // If no title found, use filename
  metadata.title = metadata.title || metadata.fileName.replace(/\.md$/i, "");
}

/**
 * Enhance metadata for TXT files
 */
function enhanceTxtMetadata(
  metadata: DocumentMetadata,
  extractedText: ExtractedText,
): void {
  // For text files, try to extract a title from the first line
  if (!metadata.title) {
    const lines = extractedText.text.split("\n");
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length > 0 && firstLine.length <= 100) {
        metadata.title = firstLine;
      }
    }
  }

  // If no title found, use filename
  metadata.title = metadata.title || metadata.fileName.replace(/\.txt$/i, "");
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string, maxKeywords: number = 10): string[] {
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

/**
 * Detect language of text
 * This is a simple implementation that only detects a few languages
 */
function detectLanguage(text: string): string {
  // In a real implementation, you would use a language detection library
  // For now, we'll use a simple heuristic based on common words

  const sample = text.toLowerCase().slice(0, 1000);

  // English
  const englishWords = [
    "the",
    "and",
    "is",
    "in",
    "to",
    "it",
    "that",
    "was",
    "for",
    "on",
  ];
  let englishCount = 0;
  for (const word of englishWords) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    const matches = sample.match(regex);
    englishCount += matches ? matches.length : 0;
  }

  // Spanish
  const spanishWords = [
    "el",
    "la",
    "los",
    "las",
    "es",
    "en",
    "y",
    "que",
    "de",
    "por",
  ];
  let spanishCount = 0;
  for (const word of spanishWords) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    const matches = sample.match(regex);
    spanishCount += matches ? matches.length : 0;
  }

  // French
  const frenchWords = [
    "le",
    "la",
    "les",
    "est",
    "et",
    "en",
    "que",
    "de",
    "pour",
    "dans",
  ];
  let frenchCount = 0;
  for (const word of frenchWords) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    const matches = sample.match(regex);
    frenchCount += matches ? matches.length : 0;
  }

  // German
  const germanWords = [
    "der",
    "die",
    "das",
    "ist",
    "und",
    "in",
    "zu",
    "den",
    "für",
    "nicht",
  ];
  let germanCount = 0;
  for (const word of germanWords) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    const matches = sample.match(regex);
    germanCount += matches ? matches.length : 0;
  }

  // Determine the language with the highest count
  const counts = [
    { language: "en", count: englishCount },
    { language: "es", count: spanishCount },
    { language: "fr", count: frenchCount },
    { language: "de", count: germanCount },
  ];

  const maxCount = Math.max(...counts.map((c) => c.count));
  if (maxCount === 0) {
    return "unknown";
  }

  return counts.find((c) => c.count === maxCount)?.language || "unknown";
}
