/**
 * Document Storage
 * 
 * Provides functionality for storing and retrieving documents 
 * both in memory and in persistent storage
 */

import { v4 as uuidv4 } from 'uuid';

// Document data structure
export interface StoredDocument {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  updatedAt: number;
  createdAt: number;
  ownerId: string;
}

// Document metadata
export interface DocumentMetadata {
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  mimeType?: string;
  wordCount?: number;
  characterCount?: number;
  chunkCount?: number;
  workspaceId: string;
  tags?: string[];
  description?: string;
  [key: string]: any;
}

// Common interface for upload service
export interface DocumentUploadService {
  uploadDocument(file: File, workspaceId: string, metadata?: Partial<DocumentMetadata>): Promise<StoredDocument>;
  registerProgressCallback(id: string, callback: (progress: any) => void): void;
  unregisterProgressCallback(id: string): void;
}

/**
 * Local Storage Document Repository
 * 
 * Implements storage using browser localStorage for persistence
 */
export class LocalStorageDocumentRepository {
  private workspaceId: string;
  private storageKeyPrefix: string;

  constructor(workspaceId: string) {
    this.workspaceId = workspaceId;
    this.storageKeyPrefix = `docs_${workspaceId}_`;
  }

  /**
   * Get all documents in the workspace
   */
  async listDocuments(workspaceId?: string): Promise<StoredDocument[]> {
    const effectiveWorkspaceId = workspaceId || this.workspaceId;
    const prefix = `docs_${effectiveWorkspaceId}_`;
    const documents: StoredDocument[] = [];

    // Get all keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const docJson = localStorage.getItem(key);
          if (docJson) {
            const doc = JSON.parse(docJson) as StoredDocument;
            documents.push(doc);
          }
        } catch (error) {
          console.error(`Error parsing document from localStorage: ${key}`, error);
        }
      }
    }

    // Sort by updatedAt (most recent first)
    return documents.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Get a document by ID
   */
  async getDocument(documentId: string): Promise<StoredDocument | null> {
    const key = `${this.storageKeyPrefix}${documentId}`;
    const docJson = localStorage.getItem(key);
    
    if (!docJson) return null;
    
    try {
      return JSON.parse(docJson) as StoredDocument;
    } catch (error) {
      console.error(`Error parsing document from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Save a document
   */
  async saveDocument(documentId: string, content: string, metadata: any): Promise<string> {
    // If updating an existing document, get it first
    let existingDoc: Partial<StoredDocument> = {};
    try {
      const existing = await this.getDocument(documentId);
      if (existing) {
        existingDoc = existing;
      }
    } catch (error) {
      // If it doesn't exist or can't be loaded, we'll create a new one
    }

    // Create or update the document
    const document: StoredDocument = {
      id: documentId,
      title: metadata.fileName || 'Untitled Document',
      content,
      metadata: {
        ...metadata,
        workspaceId: this.workspaceId
      },
      updatedAt: Date.now(),
      createdAt: existingDoc.createdAt || Date.now(),
      ownerId: metadata.userId || 'anonymous'
    };

    // Save to localStorage
    const key = `${this.storageKeyPrefix}${documentId}`;
    localStorage.setItem(key, JSON.stringify(document));

    return documentId;
  }

  /**
   * Update an existing document
   */
  async updateDocument(documentId: string, updates: Partial<StoredDocument>): Promise<StoredDocument> {
    const document = await this.getDocument(documentId);
    
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Update the document
    const updatedDocument: StoredDocument = {
      ...document,
      ...updates,
      metadata: {
        ...document.metadata,
        ...(updates.metadata || {})
      },
      updatedAt: Date.now()
    };

    // Save to localStorage
    const key = `${this.storageKeyPrefix}${documentId}`;
    localStorage.setItem(key, JSON.stringify(updatedDocument));

    return updatedDocument;
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    const key = `${this.storageKeyPrefix}${documentId}`;
    localStorage.removeItem(key);
    return true;
  }

  /**
   * Search documents by content (simple text search)
   */
  async searchDocuments(query: string, workspaceId?: string): Promise<StoredDocument[]> {
    const documents = await this.listDocuments(workspaceId);
    const lowerQuery = query.toLowerCase();
    
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery) || 
      doc.content.toLowerCase().includes(lowerQuery)
    );
  }
}

/**
 * Document Storage Manager
 * 
 * Central access point for document repositories across workspaces
 */
export class DocumentStorageManager {
  private repositories: Map<string, LocalStorageDocumentRepository> = new Map();

  /**
   * Get or create a repository for a workspace
   */
  getRepository(workspaceId: string): LocalStorageDocumentRepository {
    if (!this.repositories.has(workspaceId)) {
      this.repositories.set(workspaceId, new LocalStorageDocumentRepository(workspaceId));
    }
    
    return this.repositories.get(workspaceId)!;
  }

  /**
   * Save a document in the specified workspace
   */
  async saveDocument(documentId: string, content: string, metadata: any): Promise<string> {
    const workspaceId = metadata.workspaceId || 'default';
    const repository = this.getRepository(workspaceId);
    return repository.saveDocument(documentId, content, metadata);
  }

  /**
   * Retrieve a document from any workspace
   */
  async retrieveDocument(documentId: string): Promise<{ content: string; metadata: any } | null> {
    // We'd need to search all repositories or maintain a document ID index
    // For simplicity, we'll just check the repositories we have
    for (const repository of this.repositories.values()) {
      const doc = await repository.getDocument(documentId);
      if (doc) {
        return {
          content: doc.content,
          metadata: doc.metadata
        };
      }
    }
    
    return null;
  }

  /**
   * Delete a document from any workspace
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    let deleted = false;
    
    for (const repository of this.repositories.values()) {
      const doc = await repository.getDocument(documentId);
      if (doc) {
        await repository.deleteDocument(documentId);
        deleted = true;
      }
    }
    
    return deleted;
  }

  /**
   * List documents in a workspace
   */
  async listDocuments(workspaceId: string): Promise<StoredDocument[]> {
    const repository = this.getRepository(workspaceId);
    return repository.listDocuments();
  }
}

/**
 * Document Upload Service Implementation
 */
export class DocumentUploadServiceImpl implements DocumentUploadService {
  private progressCallbacks: Map<string, (progress: any) => void> = new Map();
  private storageManager: DocumentStorageManager;

  constructor(storageManager: DocumentStorageManager) {
    this.storageManager = storageManager;
  }

  /**
   * Register a progress callback for a specific upload
   */
  registerProgressCallback(id: string, callback: (progress: any) => void): void {
    this.progressCallbacks.set(id, callback);
  }

  /**
   * Unregister a progress callback
   */
  unregisterProgressCallback(id: string): void {
    this.progressCallbacks.delete(id);
  }

  /**
   * Upload a document file
   */
  async uploadDocument(file: File, workspaceId: string, metadata: Partial<DocumentMetadata> = {}): Promise<StoredDocument> {
    // Generate document ID
    const documentId = uuidv4();
    
    // Create basic metadata
    const docMetadata: DocumentMetadata = {
      fileName: file.name,
      fileType: file.name.split('.').pop() || '',
      fileSize: file.size,
      mimeType: file.type,
      workspaceId,
      ...metadata
    };

    // Simulate progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        for (const callback of this.progressCallbacks.values()) {
          callback({
            fileName: file.name,
            progress,
            status: progress < 100 ? 'pending' : 'complete'
          });
        }
      } else {
        clearInterval(interval);
      }
    }, 300);

    try {
      // Read file content
      const fileContent = await this.readFileAsText(file);
      
      // Save document
      await this.storageManager.saveDocument(documentId, fileContent, docMetadata);
      
      // Return document object
      return {
        id: documentId,
        title: file.name,
        content: fileContent,
        metadata: docMetadata,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ownerId: metadata.userId || 'anonymous'
      };
    } catch (error) {
      // Report error
      for (const callback of this.progressCallbacks.values()) {
        callback({
          fileName: file.name,
          progress: 100,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      throw error;
    } finally {
      clearInterval(interval);
    }
  }

  /**
   * Read a file as text
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

// Singleton instances
export const documentStorage = new DocumentStorageManager();
export const documentUploadService = new DocumentUploadServiceImpl(documentStorage);
