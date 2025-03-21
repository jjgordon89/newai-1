/**
 * File Processors
 *
 * Provides text extraction and processing for different file types
 */

// Document types supported by the processors
export type SupportedFileType =
  | "pdf"
  | "txt"
  | "docx"
  | "csv"
  | "md"
  | "json"
  | "html";

// Extracted document data
export interface ExtractedDocumentData {
  text: string;
  type: SupportedFileType | string;
  metadata: Record<string, any>;
}

/**
 * Base file processor interface
 */
export interface FileProcessor {
  canProcess(file: File): boolean;
  extractText(file: File): Promise<ExtractedDocumentData>;
}

/**
 * Text file processor
 * Handles plain text files (.txt)
 */
export class TextFileProcessor implements FileProcessor {
  canProcess(file: File): boolean {
    return file.type === "text/plain" || file.name.endsWith(".txt");
  }

  async extractText(file: File): Promise<ExtractedDocumentData> {
    const text = await this.readFileAsText(file);

    return {
      text,
      type: "txt",
      metadata: {
        lineCount: text.split("\n").length,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        charCount: text.length,
      },
    };
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

/**
 * Markdown file processor
 * Handles markdown files (.md)
 */
export class MarkdownFileProcessor implements FileProcessor {
  canProcess(file: File): boolean {
    return file.type === "text/markdown" || file.name.endsWith(".md");
  }

  async extractText(file: File): Promise<ExtractedDocumentData> {
    const text = await this.readFileAsText(file);

    // Extract metadata from frontmatter if present
    const frontmatterMetadata = this.extractFrontmatter(text);
    const cleanedText = this.removeFrontmatter(text);

    return {
      text: cleanedText,
      type: "md",
      metadata: {
        ...frontmatterMetadata,
        lineCount: cleanedText.split("\n").length,
        wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
        charCount: cleanedText.length,
        headings: this.extractHeadings(cleanedText),
      },
    };
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private extractFrontmatter(text: string): Record<string, any> {
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

  private removeFrontmatter(text: string): string {
    return text.replace(/^---\n[\s\S]*?\n---\n/, "");
  }

  private extractHeadings(text: string): { level: number; text: string }[] {
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
}

/**
 * CSV file processor
 * Handles CSV files (.csv)
 */
export class CsvFileProcessor implements FileProcessor {
  canProcess(file: File): boolean {
    return file.type === "text/csv" || file.name.endsWith(".csv");
  }

  async extractText(file: File): Promise<ExtractedDocumentData> {
    const text = await this.readFileAsText(file);

    // Parse CSV to extract structure
    const lines = text.split("\n").filter((line) => line.trim().length > 0);
    const headers = lines[0].split(",").map((header) => header.trim());

    return {
      text,
      type: "csv",
      metadata: {
        rowCount: lines.length - 1, // Exclude header row
        columnCount: headers.length,
        headers,
      },
    };
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

/**
 * JSON file processor
 * Handles JSON files (.json)
 */
export class JsonFileProcessor implements FileProcessor {
  canProcess(file: File): boolean {
    return file.type === "application/json" || file.name.endsWith(".json");
  }

  async extractText(file: File): Promise<ExtractedDocumentData> {
    const text = await this.readFileAsText(file);

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
      type: "json",
      metadata: jsonMetadata,
    };
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

/**
 * HTML file processor
 * Handles HTML files (.html)
 */
export class HtmlFileProcessor implements FileProcessor {
  canProcess(file: File): boolean {
    return (
      file.type === "text/html" ||
      file.name.endsWith(".html") ||
      file.name.endsWith(".htm")
    );
  }

  async extractText(file: File): Promise<ExtractedDocumentData> {
    const text = await this.readFileAsText(file);

    // Extract plain text from HTML
    const plainText = this.extractPlainTextFromHtml(text);

    return {
      text: plainText,
      type: "html",
      metadata: {
        originalHtml: text,
        title: this.extractTitle(text),
        hasImages: text.includes("<img"),
        hasLinks: text.includes("<a "),
        wordCount: plainText.split(/\s+/).filter(Boolean).length,
      },
    };
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private extractPlainTextFromHtml(html: string): string {
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

  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    return titleMatch ? titleMatch[1] : "";
  }
}

/**
 * PDF file processor
 * Handles PDF files (.pdf) using pdf.js
 */
export class PdfFileProcessor implements FileProcessor {
  canProcess(file: File): boolean {
    return file.type === "application/pdf" || file.name.endsWith(".pdf");
  }

  async extractText(file: File): Promise<ExtractedDocumentData> {
    try {
      // Load the PDF.js library dynamically
      const pdfjsLib = await import("pdfjs-dist");

      // Set the worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

      // Read the file as ArrayBuffer
      const arrayBuffer = await this.readFileAsArrayBuffer(file);

      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      // Extract text from all pages
      let fullText = "";
      const pageTexts: string[] = [];
      const pageMetadata: any[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        // Get page dimensions and other metadata
        const viewport = page.getViewport({ scale: 1.0 });
        pageMetadata.push({
          width: viewport.width,
          height: viewport.height,
          pageNumber: i,
          rotation: viewport.rotation,
        });

        pageTexts.push(pageText);
        fullText += pageText + "\n\n";
      }

      // Extract document metadata
      let title = "";
      let author = "";
      let keywords = "";
      let subject = "";

      try {
        const metadata = await pdf.getMetadata();
        if (metadata && metadata.info) {
          title = metadata.info.Title || "";
          author = metadata.info.Author || "";
          keywords = metadata.info.Keywords || "";
          subject = metadata.info.Subject || "";
        }
      } catch (metadataError) {
        console.warn("Could not extract PDF metadata:", metadataError);
      }

      return {
        text: fullText,
        type: "pdf",
        metadata: {
          pageCount: pdf.numPages,
          pageTexts,
          pageMetadata,
          isEncrypted: pdf.isEncrypted,
          fingerprint: pdf.fingerprint,
          title,
          author,
          keywords,
          subject,
          wordCount: fullText.split(/\s+/).filter(Boolean).length,
          charCount: fullText.length,
        },
      };
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      return {
        text: "Error extracting text from PDF. The file might be corrupted or password-protected.",
        type: "pdf",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          extractionFailed: true,
        },
      };
    }
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}

/**
 * DOCX file processor
 * In a real implementation, you would use a library like mammoth.js
 * This implementation uses a simplified approach with JSZip to extract text
 */
export class DocxFileProcessor implements FileProcessor {
  canProcess(file: File): boolean {
    return (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    );
  }

  async extractText(file: File): Promise<ExtractedDocumentData> {
    try {
      // For a complete implementation, you would use mammoth.js
      // Since we can't add new dependencies easily in this demo, we'll use a simplified approach
      // that extracts text from the document.xml file in the DOCX (which is a ZIP file)

      // Read the file as ArrayBuffer
      const arrayBuffer = await this.readFileAsArrayBuffer(file);

      // Use JSZip to extract the document.xml file
      const JSZip = await import("jszip");
      const zip = new JSZip.default();
      const zipContents = await zip.loadAsync(arrayBuffer);

      // Try to get the main document content
      const documentXml = zipContents.file("word/document.xml");
      if (!documentXml) {
        throw new Error("Could not find document.xml in the DOCX file");
      }

      // Extract the XML content
      const xmlContent = await documentXml.async("text");

      // Very simple XML parsing to extract text (this is not a complete solution)
      // In a real implementation, use proper XML parsing and handle all DOCX complexities
      const textContent = this.extractTextFromXml(xmlContent);

      // Try to extract core properties for metadata
      let title = "";
      let author = "";
      let created = "";
      let modified = "";

      const corePropsXml = zipContents.file("docProps/core.xml");
      if (corePropsXml) {
        const coreXmlContent = await corePropsXml.async("text");
        title = this.extractXmlValue(coreXmlContent, "dc:title") || "";
        author = this.extractXmlValue(coreXmlContent, "dc:creator") || "";
        created = this.extractXmlValue(coreXmlContent, "dcterms:created") || "";
        modified =
          this.extractXmlValue(coreXmlContent, "dcterms:modified") || "";
      }

      return {
        text: textContent,
        type: "docx",
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          title,
          author,
          created,
          modified,
          wordCount: textContent.split(/\s+/).filter(Boolean).length,
          charCount: textContent.length,
        },
      };
    } catch (error) {
      console.error("Error extracting text from DOCX:", error);
      return {
        text: "Error extracting text from DOCX. The file might be corrupted or in an unsupported format.",
        type: "docx",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          extractionFailed: true,
          fileName: file.name,
          fileSize: file.size,
        },
      };
    }
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private extractTextFromXml(xmlContent: string): string {
    // Very simplified XML text extraction
    // In a real implementation, use proper XML parsing
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    return textMatches
      .map((match) => {
        const content = match.replace(/<\/?w:t[^>]*>/g, "");
        return content;
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private extractXmlValue(xmlContent: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}[^>]*>([^<]*)<\/${tagName}>`);
    const match = xmlContent.match(regex);
    return match ? match[1] : null;
  }
}

/**
 * File processor registry
 * Manages and provides access to all file processors
 */
export class FileProcessorRegistry {
  private processors: FileProcessor[] = [];

  constructor() {
    // Register default processors
    this.registerProcessor(new TextFileProcessor());
    this.registerProcessor(new MarkdownFileProcessor());
    this.registerProcessor(new CsvFileProcessor());
    this.registerProcessor(new JsonFileProcessor());
    this.registerProcessor(new HtmlFileProcessor());
    this.registerProcessor(new PdfFileProcessor());
    this.registerProcessor(new DocxFileProcessor());
  }

  /**
   * Register a new file processor
   */
  registerProcessor(processor: FileProcessor): void {
    this.processors.push(processor);
  }

  /**
   * Get a processor for a specific file
   */
  getProcessorForFile(file: File): FileProcessor | null {
    for (const processor of this.processors) {
      if (processor.canProcess(file)) {
        return processor;
      }
    }

    return null;
  }

  /**
   * Process a file and extract text
   */
  async processFile(file: File): Promise<ExtractedDocumentData> {
    const processor = this.getProcessorForFile(file);

    if (!processor) {
      throw new Error(`No processor available for file type: ${file.type}`);
    }

    return processor.extractText(file);
  }
}

// Export a singleton instance
export const fileProcessorRegistry = new FileProcessorRegistry();

/**
 * Process a document file and extract text and metadata
 */
export async function processDocumentFile(
  file: File,
): Promise<ExtractedDocumentData> {
  return fileProcessorRegistry.processFile(file);
}
