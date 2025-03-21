/**
 * Document Preprocessing Service
 *
 * Provides utilities for cleaning and normalizing document text
 */

/**
 * Clean and normalize document text
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
 * Normalize document text for search
 */
export function normalizeForSearch(text: string): string {
  // Convert to lowercase
  let normalized = text.toLowerCase();

  // Remove punctuation
  normalized = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

/**
 * Remove boilerplate text from document
 */
export function removeBoilerplate(text: string): string {
  // Remove common boilerplate patterns
  let cleaned = text;

  // Remove email signatures
  cleaned = cleaned.replace(/--+[\s\S]*?(?=\n\n|$)/, "");

  // Remove legal disclaimers
  cleaned = cleaned.replace(/disclaimer[\s\S]*?(?=\n\n|$)/i, "");

  // Remove confidentiality notices
  cleaned = cleaned.replace(/confidential[\s\S]*?(?=\n\n|$)/i, "");

  // Remove copyright notices
  cleaned = cleaned.replace(/copyright[\s\S]*?(?=\n\n|$)/i, "");

  // Remove headers and footers (simple heuristic)
  const lines = cleaned.split("\n");
  if (lines.length > 10) {
    // Remove potential headers (first 2 lines)
    lines.splice(0, 2);

    // Remove potential footers (last 2 lines)
    lines.splice(-2, 2);

    cleaned = lines.join("\n");
  }

  return cleaned.trim();
}

/**
 * Remove HTML tags from text
 */
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

/**
 * Expand contractions in English text
 */
export function expandContractions(text: string): string {
  const contractions: Record<string, string> = {
    "ain't": "am not",
    "aren't": "are not",
    "can't": "cannot",
    "couldn't": "could not",
    "didn't": "did not",
    "doesn't": "does not",
    "don't": "do not",
    "hadn't": "had not",
    "hasn't": "has not",
    "haven't": "have not",
    "he'd": "he would",
    "he'll": "he will",
    "he's": "he is",
    "I'd": "I would",
    "I'll": "I will",
    "I'm": "I am",
    "I've": "I have",
    "isn't": "is not",
    "it's": "it is",
    "let's": "let us",
    "mightn't": "might not",
    "mustn't": "must not",
    "shan't": "shall not",
    "she'd": "she would",
    "she'll": "she will",
    "she's": "she is",
    "shouldn't": "should not",
    "that's": "that is",
    "there's": "there is",
    "they'd": "they would",
    "they'll": "they will",
    "they're": "they are",
    "they've": "they have",
    "we'd": "we would",
    "we're": "we are",
    "we've": "we have",
    "weren't": "were not",
    "what'll": "what will",
    "what're": "what are",
    "what's": "what is",
    "what've": "what have",
    "where's": "where is",
    "who'd": "who would",
    "who'll": "who will",
    "who're": "who are",
    "who's": "who is",
    "who've": "who have",
    "won't": "will not",
    "wouldn't": "would not",
    "you'd": "you would",
    "you'll": "you will",
    "you're": "you are",
    "you've": "you have",
  };

  let expanded = text;

  // Replace contractions
  for (const [contraction, expansion] of Object.entries(contractions)) {
    const regex = new RegExp(`\\b${contraction}\\b`, "gi");
    expanded = expanded.replace(regex, expansion);
  }

  return expanded;
}

/**
 * Normalize whitespace in text
 */
export function normalizeWhitespace(text: string): string {
  // Replace multiple spaces with a single space
  let normalized = text.replace(/ +/g, " ");

  // Replace multiple newlines with a maximum of two
  normalized = normalized.replace(/\n{3,}/g, "\n\n");

  // Replace tabs with spaces
  normalized = normalized.replace(/\t/g, " ");

  return normalized.trim();
}

/**
 * Apply all preprocessing steps to document text
 */
export function preprocessDocumentText(
  text: string,
  options: {
    removeHtml?: boolean;
    expandContractions?: boolean;
    removeBoilerplate?: boolean;
    normalizeWhitespace?: boolean;
  } = {},
): string {
  let processed = text;

  // Apply preprocessing steps based on options
  if (options.removeHtml !== false) {
    processed = stripHtml(processed);
  }

  if (options.expandContractions) {
    processed = expandContractions(processed);
  }

  if (options.removeBoilerplate) {
    processed = removeBoilerplate(processed);
  }

  if (options.normalizeWhitespace !== false) {
    processed = normalizeWhitespace(processed);
  }

  // Always clean the document text
  processed = cleanDocumentText(processed);

  return processed;
}
