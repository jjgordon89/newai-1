/**
 * Document Storage Service
 *
 * Provides local storage adapter for document management
 */

import { v4 as uuidv4 } from "uuid";

// Document types supported by the storage system
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
  version: number;
  lastModified?: number;
  [key: string]: any; // Additional metadata fields
}

// Stored document interface
export interface StoredDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType | string;
  createdAt: string;
  updatedAt: string;
  version: number;
  metadata: DocumentMetadata;
}

// Document repository interface
export interface DocumentRepository {
  saveDocument(document: StoredDocument): Promise<StoredDocument>;
  getDocument(id: string): Promise<StoredDocument | null>;
  listDocuments(workspaceId: string): Promise<StoredDocument[]>;
  updateDocument(
    id: string,
    updates: Partial<StoredDocument>,
  ): Promise<StoredDocument>;
  deleteDocument(id: string): Promise<boolean>;
  searchDocuments(
    query: string,
    workspaceId: string,
  ): Promise<StoredDocument[]>;
}

/**
 * Local Storage Document Repository
 *
 * Implements document storage using browser's localStorage
 */
export class LocalStorageDocumentRepository implements DocumentRepository {
  private storagePrefix: string;

  constructor(workspaceId: string) {
    this.storagePrefix = `docs_${workspaceId}_`;
  }

  /**
   * Save a document to local storage
   */
  async saveDocument(document: StoredDocument): Promise<StoredDocument> {
    const docToSave = {
      ...document,
      id: document.id || uuidv4(),
      createdAt: document.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: document.version || 1,
    };

    localStorage.setItem(
      `${this.storagePrefix}${docToSave.id}`,
      JSON.stringify(docToSave),
    );

    // Also update the document index
    await this.updateDocumentIndex(docToSave.id, false);

    return docToSave;
  }

  /**
   * Get a document by ID
   */
  async getDocument(id: string): Promise<StoredDocument | null> {
    const docJson = localStorage.getItem(`${this.storagePrefix}${id}`);
    if (!docJson) return null;

    try {
      return JSON.parse(docJson) as StoredDocument;
    } catch (error) {
      console.error("Error parsing document from storage:", error);
      return null;
    }
  }

  /**
   * List all documents in the workspace
   */
  async listDocuments(workspaceId: string): Promise<StoredDocument[]> {
    const indexKey = `${this.storagePrefix}index`;
    const indexJson = localStorage.getItem(indexKey);
    const index = indexJson ? JSON.parse(indexJson) : [];

    const documents: StoredDocument[] = [];

    for (const id of index) {
      const doc = await this.getDocument(id);
      if (doc) documents.push(doc);
    }

    return documents;
  }

  /**
   * Update a document
   */
  async updateDocument(
    id: string,
    updates: Partial<StoredDocument>,
  ): Promise<StoredDocument> {
    const existingDoc = await this.getDocument(id);
    if (!existingDoc) {
      throw new Error(`Document with ID ${id} not found`);
    }

    const updatedDoc: StoredDocument = {
      ...existingDoc,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: existingDoc.version + 1,
    };

    localStorage.setItem(
      `${this.storagePrefix}${id}`,
      JSON.stringify(updatedDoc),
    );

    return updatedDoc;
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<boolean> {
    localStorage.removeItem(`${this.storagePrefix}${id}`);
    await this.updateDocumentIndex(id, true);
    return true;
  }

  /**
   * Search documents by title or content
   */
  async searchDocuments(
    query: string,
    workspaceId: string,
  ): Promise<StoredDocument[]> {
    const allDocs = await this.listDocuments(workspaceId);
    const lowerQuery = query.toLowerCase();

    return allDocs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.content.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Update the document index
   */
  private async updateDocumentIndex(
    docId: string,
    isDelete: boolean,
  ): Promise<void> {
    const indexKey = `${this.storagePrefix}index`;
    const indexJson = localStorage.getItem(indexKey);
    let index: string[] = indexJson ? JSON.parse(indexJson) : [];

    if (isDelete) {
      index = index.filter((id) => id !== docId);
    } else if (!index.includes(docId)) {
      index.push(docId);
    }

    localStorage.setItem(indexKey, JSON.stringify(index));
  }
}

/**
 * Document Storage Factory
 *
 * Creates and manages document repositories for different workspaces
 */
class DocumentStorageFactory {
  private repositories: Record<string, DocumentRepository> = {};

  /**
   * Get or create a document repository for a workspace
   */
  getRepository(workspaceId: string): DocumentRepository {
    if (!this.repositories[workspaceId]) {
      this.repositories[workspaceId] = new LocalStorageDocumentRepository(
        workspaceId,
      );
    }

    return this.repositories[workspaceId];
  }
}

// Export a singleton instance
export const documentStorage = new DocumentStorageFactory();

/**
 * Upload progress tracker
 */
export interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: "pending" | "processing" | "complete" | "error";
  error?: string;
}

/**
 * Document upload service
 */
export class DocumentUploadService {
  private progressCallbacks: Record<
    string,
    (progress: UploadProgress) => void
  > = {};

  /**
   * Register a progress callback for a file upload
   */
  registerProgressCallback(
    fileId: string,
    callback: (progress: UploadProgress) => void,
  ): void {
    this.progressCallbacks[fileId] = callback;
  }

  /**
   * Unregister a progress callback
   */
  unregisterProgressCallback(fileId: string): void {
    delete this.progressCallbacks[fileId];
  }

  /**
   * Update progress for a file upload
   */
  updateProgress(fileId: string, progress: UploadProgress): void {
    const callback = this.progressCallbacks[fileId];
    if (callback) {
      callback(progress);
    }
  }

  /**
   * Upload a document to storage
   */
  async uploadDocument(
    file: File,
    workspaceId: string,
    metadata: Partial<DocumentMetadata> = {},
  ): Promise<StoredDocument> {
    const fileId = uuidv4();

    try {
      // Update progress to processing
      this.updateProgress(fileId, {
        fileName: file.name,
        progress: 0,
        status: "processing",
      });

      // Read the file content
      const content = await this.readFileContent(file);

      // Update progress
      this.updateProgress(fileId, {
        fileName: file.name,
        progress: 50,
        status: "processing",
      });

      // Create document metadata
      const docMetadata: DocumentMetadata = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        version: 1,
        lastModified: file.lastModified,
        ...metadata,
      };

      // Create the document object
      const document: StoredDocument = {
        id: fileId,
        title: file.name,
        content,
        type: this.getDocumentTypeFromFile(file),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        metadata: docMetadata,
      };

      // Save to repository
      const repository = documentStorage.getRepository(workspaceId);
      const savedDoc = await repository.saveDocument(document);

      // Update progress to complete
      this.updateProgress(fileId, {
        fileName: file.name,
        progress: 100,
        status: "complete",
      });

      return savedDoc;
    } catch (error) {
      // Update progress to error
      this.updateProgress(fileId, {
        fileName: file.name,
        progress: 0,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  }

  /**
   * Read file content as text
   */
  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve((event.target?.result as string) || "");
      };

      reader.onerror = (error) => {
        reject(new Error(`Failed to read file: ${error}`));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Get document type from file
   */
  private getDocumentTypeFromFile(file: File): DocumentType | string {
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
        return "html";
      default:
        return extension || "unknown";
    }
  }
}

// Export a singleton instance
export const documentUploadService = new DocumentUploadService();
