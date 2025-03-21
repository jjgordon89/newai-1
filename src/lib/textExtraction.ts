/**
 * Text Extraction Service
 *
 * Provides utilities for extracting text from different file types
 */

// Supported file types for text extraction
export type SupportedFileType =
  | "pdf"
  | "txt"
  | "docx"
  | "md"
  | "csv"
  | "json"
  | "html";

// Extracted text result
export interface ExtractedText {
  text: string;
  metadata: Record<string, any>;
}

/**
 * Extract text from a plain text file
 */
export async function extractTextFromTxt(file: File): Promise<ExtractedText> {
  const text = await readFileAsText(file);

  return {
    text,
    metadata: {
      lineCount: text.split("\n").length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      charCount: text.length,
    },
  };
}

/**
 * Extract text from a markdown file
 */
export async function extractTextFromMarkdown(
  file: File,
): Promise<ExtractedText> {
  const text = await readFileAsText(file);

  // Extract metadata from frontmatter if present
  const frontmatterMetadata = extractFrontmatter(text);
  const cleanedText = removeFrontmatter(text);

  return {
    text: cleanedText,
    metadata: {
      ...frontmatterMetadata,
      lineCount: cleanedText.split("\n").length,
      wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
      charCount: cleanedText.length,
      headings: extractHeadings(cleanedText),
    },
  };
}

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPdf(file: File): Promise<ExtractedText> {
  try {
    // In a real implementation, you would use a library like pdf.js
    // For now, we'll return a placeholder
    return {
      text: `PDF text extraction would be implemented with pdf.js in a real application. File: ${file.name}`,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        extractionMethod: "placeholder",
      },
    };
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extract text from a DOCX file
 */
export async function extractTextFromDocx(file: File): Promise<ExtractedText> {
  try {
    // In a real implementation, you would use a library like mammoth.js
    // For now, we'll return a placeholder
    return {
      text: `DOCX text extraction would be implemented with mammoth.js in a real application. File: ${file.name}`,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        extractionMethod: "placeholder",
      },
    };
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error(
      `Failed to extract text from DOCX: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extract text from a CSV file
 */
export async function extractTextFromCsv(file: File): Promise<ExtractedText> {
  const text = await readFileAsText(file);

  // Parse CSV to extract structure
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const headers = lines[0].split(",").map((header) => header.trim());

  return {
    text,
    metadata: {
      rowCount: lines.length - 1, // Exclude header row
      columnCount: headers.length,
      headers,
    },
  };
}

/**
 * Extract text from a JSON file
 */
export async function extractTextFromJson(file: File): Promise<ExtractedText> {
  const text = await readFileAsText(file);

  let jsonMetadata: Record<string, any> = {};
  try {
    const jsonData = JSON.parse(text);
    jsonMetadata = {
      isArray: Array.isArray(jsonData),
      itemCount: Array.isArray(jsonData) ? jsonData.length : 1,
      topLevelKeys: Array.isArray(jsonData)
        ? Object.keys(jsonData[0] || {})
        : Object.keys(jsonData),
    };
  } catch (error) {
    jsonMetadata = { parseError: true };
  }

  return {
    text,
    metadata: jsonMetadata,
  };
}

/**
 * Extract text from an HTML file
 */
export async function extractTextFromHtml(file: File): Promise<ExtractedText> {
  const text = await readFileAsText(file);

  // Extract plain text from HTML
  const plainText = extractPlainTextFromHtml(text);

  return {
    text: plainText,
    metadata: {
      originalHtml: text,
      title: extractTitle(text),
      hasImages: text.includes("<img"),
      hasLinks: text.includes("<a "),
      wordCount: plainText.split(/\s+/).filter(Boolean).length,
    },
  };
}

/**
 * Extract text from a file based on its type
 */
export async function extractTextFromFile(file: File): Promise<ExtractedText> {
  const fileType = getFileType(file);

  switch (fileType) {
    case "txt":
      return extractTextFromTxt(file);
    case "md":
      return extractTextFromMarkdown(file);
    case "pdf":
      return extractTextFromPdf(file);
    case "docx":
      return extractTextFromDocx(file);
    case "csv":
      return extractTextFromCsv(file);
    case "json":
      return extractTextFromJson(file);
    case "html":
      return extractTextFromHtml(file);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Helper function to read a file as text
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Helper function to get the file type from a file
 */
function getFileType(file: File): SupportedFileType | string {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  switch (extension) {
    case "pdf":
      return "pdf";
    case "txt":
      return "txt";
    case "docx":
      return "docx";
    case "csv":
      return "csv";
    case "md":
      return "md";
    case "json":
      return "json";
    case "html":
    case "htm":
      return "html";
    default:
      return extension;
  }
}

/**
 * Helper function to extract frontmatter from markdown
 */
function extractFrontmatter(text: string): Record<string, any> {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = text.match(frontmatterRegex);

  if (!match) return {};

  const frontmatter = match[1];
  const metadata: Record<string, any> = {};

  frontmatter.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length) {
      const value = valueParts.join(":").trim();
      metadata[key.trim()] = value;
    }
  });

  return metadata;
}

/**
 * Helper function to remove frontmatter from markdown
 */
function removeFrontmatter(text: string): string {
  return text.replace(/^---\n[\s\S]*?\n---\n/, "");
}

/**
 * Helper function to extract headings from markdown
 */
function extractHeadings(text: string): { level: number; text: string }[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: { level: number; text: string }[] = [];

  let match;
  while ((match = headingRegex.exec(text)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
    });
  }

  return headings;
}

/**
 * Helper function to extract plain text from HTML
 */
function extractPlainTextFromHtml(html: string): string {
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove script and style elements
  const scripts = doc.getElementsByTagName("script");
  const styles = doc.getElementsByTagName("style");

  for (let i = scripts.length - 1; i >= 0; i--) {
    scripts[i].remove();
  }

  for (let i = styles.length - 1; i >= 0; i--) {
    styles[i].remove();
  }

  // Get the text content
  return doc.body.textContent || "";
}

/**
 * Helper function to extract title from HTML
 */
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  return titleMatch ? titleMatch[1] : "";
}
