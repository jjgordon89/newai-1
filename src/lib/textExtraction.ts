/**
 * Text Extraction Utilities
 *
 * Provides functionality for extracting text from various file formats
 */

// Interface for text extractors
export interface TextExtractor {
  supportedMimeTypes: string[];
  extractText(file: File): Promise<string>;
}

/**
 * Plain Text Extractor
 * Handles plain text files like .txt
 */
class PlainTextExtractor implements TextExtractor {
  supportedMimeTypes = ['text/plain'];

  async extractText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }
}

/**
 * Markdown Extractor
 * Handles markdown files (.md)
 */
class MarkdownExtractor implements TextExtractor {
  supportedMimeTypes = ['text/markdown', 'text/x-markdown'];

  async extractText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read markdown file'));
      reader.readAsText(file);
    });
  }
}

/**
 * HTML Extractor
 * Extracts text from HTML files, stripping tags
 */
class HtmlExtractor implements TextExtractor {
  supportedMimeTypes = ['text/html'];

  async extractText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const html = reader.result as string;
        // Simple HTML parsing - in a real app, use a proper HTML parser
        const text = html.replace(/<[^>]*>/g, ' ') // Remove HTML tags
          .replace(/\s+/g, ' ')                    // Normalize whitespace
          .trim();
        resolve(text);
      };
      reader.onerror = () => reject(new Error('Failed to read HTML file'));
      reader.readAsText(file);
    });
  }
}

/**
 * PDF Extractor
 * Extracts text from PDF files
 */
class PdfExtractor implements TextExtractor {
  supportedMimeTypes = ['application/pdf'];

  async extractText(file: File): Promise<string> {
    // In a real application, you would use a PDF parsing library like pdf.js
    // For this example, we'll simulate PDF text extraction
    return new Promise((resolve, reject) => {
      // Simulate PDF processing delay
      setTimeout(() => {
        console.log(`Simulating text extraction from PDF: ${file.name}`);
        resolve(`This is simulated text extracted from the PDF file ${file.name}. 
        In a real application, this would contain the actual text content of the PDF.
        For demonstration purposes, we're generating this placeholder content.`);
      }, 500);
    });
  }
}

/**
 * Word Document Extractor
 * Extracts text from Microsoft Word files
 */
class WordExtractor implements TextExtractor {
  supportedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword' // .doc
  ];

  async extractText(file: File): Promise<string> {
    // In a real application, you would use a library like mammoth.js
    // For this example, we'll simulate Word document text extraction
    return new Promise((resolve, reject) => {
      // Simulate Word document processing delay
      setTimeout(() => {
        console.log(`Simulating text extraction from Word document: ${file.name}`);
        resolve(`This is simulated text extracted from the Word document ${file.name}.
        In a real application, this would contain the actual text content of the document.
        For demonstration purposes, we're generating this placeholder content.`);
      }, 500);
    });
  }
}

/**
 * Factory for creating text extractors based on file type
 */
class TextExtractorFactory {
  private extractors: TextExtractor[] = [
    new PlainTextExtractor(),
    new MarkdownExtractor(),
    new HtmlExtractor(),
    new PdfExtractor(),
    new WordExtractor()
  ];

  /**
   * Get an appropriate extractor for the given MIME type
   */
  getExtractor(mimeType: string): TextExtractor | null {
    return this.extractors.find(extractor => 
      extractor.supportedMimeTypes.some(supportedType => 
        supportedType === mimeType || mimeType.startsWith(supportedType)
      )
    ) || null;
  }

  /**
   * Register a new extractor
   */
  registerExtractor(extractor: TextExtractor): void {
    this.extractors.push(extractor);
  }

  /**
   * Get all supported MIME types
   */
  getSupportedMimeTypes(): string[] {
    return this.extractors.flatMap(extractor => extractor.supportedMimeTypes);
  }
}

// Export a singleton instance of the factory
export const textExtractorFactory = new TextExtractorFactory();
