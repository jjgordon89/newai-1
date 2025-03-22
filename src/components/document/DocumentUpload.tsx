import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, File, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HuggingFaceEmbeddingGenerator } from '@/lib/huggingFaceEmbeddings';
import { createDocumentIndexingService } from '@/lib/documentIndexingService';
import { DocumentProcessingService } from '@/lib/documentProcessingService';
import { documentStorage, documentUploadService } from '@/lib/documentStorage';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Accepted file types
const ACCEPTED_FILE_TYPES = {
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/html': ['.html', '.htm'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/csv': ['.csv'],
};

// Types for file upload state
interface FileUploadState {
  file: File;
  id: string;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  documentId?: string;
}

interface DocumentUploadProps {
  workspaceId: string;
  onUploadComplete?: (documentId: string) => void;
  embeddingModel?: string;
}

/**
 * Document Upload Component
 * 
 * Provides a UI for uploading documents with drag-and-drop functionality, 
 * progress tracking, and error handling
 */
export default function DocumentUpload({ 
  workspaceId, 
  onUploadComplete,
  embeddingModel = 'BAAI/bge-small-en-v1.5'
}: DocumentUploadProps) {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const processingServiceRef = useRef<DocumentProcessingService | null>(null);
  
  // Initialize document processing service
  const getProcessingService = useCallback(() => {
    if (!processingServiceRef.current) {
      // Create embedding generator and indexing service
      const embeddingGenerator = new HuggingFaceEmbeddingGenerator(embeddingModel);
      const indexingService = createDocumentIndexingService(embeddingGenerator, {
        workspaceId,
        embeddingModelId: embeddingModel
      });
      
      // Create processing service
      processingServiceRef.current = new DocumentProcessingService(
        indexingService,
        embeddingGenerator,
        documentStorage
      );
    }
    
    return processingServiceRef.current;
  }, [workspaceId, embeddingModel]);
  
  // Process the uploaded files
  const processFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    
    // Create new upload states for files
    const newUploads = files.map(file => ({
      file,
      id: `upload-${Date.now()}-${file.name}`,
      progress: 0,
      status: 'idle' as const
    }));
    
    setUploads(prev => [...prev, ...newUploads]);
    
    // Process each file
    for (const upload of newUploads) {
      try {
        // Update status
        setUploads(prev => 
          prev.map(u => 
            u.id === upload.id 
              ? { ...u, status: 'uploading', progress: 10 }
              : u
          )
        );
        
        // Get processing service
        const processingService = getProcessingService();
        
        // Prepare document for processing
        const docToProcess = {
          file: upload.file,
          metadata: {
            fileName: upload.file.name,
            fileType: upload.file.name.split('.').pop() || '',
            fileSize: upload.file.size,
            workspaceId,
            userId: 'current-user', // In a real app, get from auth context
            uploadDate: new Date()
          }
        };
        
        // Process with progress updates
        const result = await processingService.processDocument(
          docToProcess,
          {
            workspaceId,
            embeddingModel,
            chunking: {
              strategy: 'hybrid',
              chunkSize: 1000,
              chunkOverlap: 200
            }
          },
          (progress, status, details) => {
            // Update progress in UI
            setUploads(prev => 
              prev.map(u => 
                u.id === upload.id 
                  ? { 
                      ...u, 
                      progress: Math.min(progress, 100),
                      status: progress === 100 ? 'complete' : 'processing'
                    }
                  : u
              )
            );
          }
        );
        
        if (result.success) {
          // Update with success
          setUploads(prev => 
            prev.map(u => 
              u.id === upload.id 
                ? { 
                    ...u, 
                    status: 'complete', 
                    progress: 100,
                    documentId: result.documentId
                  }
                : u
            )
          );
          
          // Notify success
          toast({
            title: 'Document Uploaded',
            description: `${upload.file.name} has been processed successfully.`,
            duration: 3000
          });
          
          // Call completion callback
          onUploadComplete?.(result.documentId);
        } else {
          // Update with error
          setUploads(prev => 
            prev.map(u => 
              u.id === upload.id 
                ? { 
                    ...u, 
                    status: 'error', 
                    progress: 100,
                    error: result.error
                  }
                : u
            )
          );
          
          // Notify error
          toast({
            title: 'Upload Failed',
            description: result.error || 'Unknown error occurred',
            variant: 'destructive',
            duration: 5000
          });
        }
      } catch (error) {
        // Update with error
        setUploads(prev => 
          prev.map(u => 
            u.id === upload.id 
              ? { 
                  ...u, 
                  status: 'error', 
                  progress: 100,
                  error: error instanceof Error ? error.message : 'Unknown error'
                }
              : u
          )
        );
        
        // Notify error
        toast({
          title: 'Upload Failed',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: 'destructive',
          duration: 5000
        });
      }
    }
    
    setIsProcessing(false);
  }, [workspaceId, embeddingModel, toast, getProcessingService, onUploadComplete]);
  
  // Set up dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    disabled: isProcessing,
    onDropRejected: (rejections) => {
      // Show error for rejected files
      rejections.forEach(rejection => {
        const file = rejection.file;
        let errorMessage = 'File not accepted: ';
        
        if (file.size > MAX_FILE_SIZE) {
          errorMessage = `File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
        } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
          errorMessage = `Unsupported file type: ${file.type || 'unknown'}. Please use a supported format.`;
        }
        
        toast({
          title: 'Invalid File',
          description: errorMessage,
          variant: 'destructive',
          duration: 5000
        });
      });
    }
  });
  
  // Remove an upload from the list
  const removeUpload = (uploadId: string) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId));
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Upload documents to be processed and indexed for search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-medium">
                {isDragActive ? 'Drop files here' : 'Drag and drop files here'}
              </h3>
              <p className="text-sm text-muted-foreground">
                or click to select files
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: TXT, MD, HTML, PDF, DOCX, DOC, CSV
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 10MB
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {uploads.length} file(s) queued
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUploads([])}
            disabled={uploads.length === 0 || isProcessing}
          >
            Clear All
          </Button>
        </CardFooter>
      </Card>

      {/* Upload List */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploads.map(upload => (
                <div key={upload.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{upload.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(upload.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {upload.status === 'complete' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {upload.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      {(upload.status === 'idle' || upload.status === 'uploading' || upload.status === 'processing') && (
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUpload(upload.id)}
                        disabled={upload.status === 'uploading' || upload.status === 'processing'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Progress value={upload.progress} className="h-2" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs">{upload.progress}%</span>
                      <span className="text-xs capitalize">{upload.status}</span>
                    </div>
                  </div>
                  
                  {upload.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{upload.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}