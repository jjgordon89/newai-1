import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { uploadDocument, fetchDocuments } from '@/redux/slices/documentSlice';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DocumentUploaderProps {
  workspaceId: string;
  onDocumentUploaded?: (documentId: string) => void;
}

export function DocumentUploader({ workspaceId, onDocumentUploaded }: DocumentUploaderProps) {
  const dispatch = useAppDispatch();
  const { uploadProgress, error, isLoading } = useAppSelector(state => state.documents);
  const { toast } = useToast();
  
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Convert the upload progress object to an array for rendering
  const progressItems = Object.entries(uploadProgress).map(([fileId, progress]) => {
    // Ensure progress is treated as an object before spreading
    const progressObj = progress as Record<string, any>;
    return {
      id: fileId,
      fileName: progressObj.fileName || 'Unknown file',
      progress: progressObj.progress || 0,
      status: progressObj.status || 'uploading',
      error: progressObj.error || null
    };
  });
  
  // Refresh documents when a file is uploaded successfully
  useEffect(() => {
    const hasCompletedUpload = progressItems.some(item => item.status === 'complete');
    if (hasCompletedUpload) {
      dispatch(fetchDocuments(workspaceId));
    }
  }, [uploadProgress, dispatch, workspaceId]);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(e.target.files);
      
      // Reset the input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleFiles = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const resultAction = await dispatch(uploadDocument({
          file,
          workspaceId,
          metadata: {
            uploadedBy: 'user', // This could be the actual user ID in a real app
          }
        })).unwrap();
        
        // Notify of successful upload
        toast({
          title: 'Document uploaded',
          description: `${file.name} has been uploaded successfully.`,
        });
        
        // Call the callback if provided
        if (onDocumentUploaded) {
          onDocumentUploaded(resultAction.id);
        }
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: `Failed to upload ${file.name}: ${error}`,
          variant: 'destructive',
        });
      }
    }
  };
  
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Document Uploader
        </CardTitle>
        <CardDescription>
          Upload documents to add to your knowledge base
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.txt,.docx,.csv,.md,.json,.html"
          />
          
          <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          
          <div className="text-xl font-medium mb-2">
            Drag files here or click to upload
          </div>
          
          <div className="text-sm text-muted-foreground mb-4">
            Support for PDF, TXT, DOCX, CSV, MD, JSON, and HTML
          </div>
          
          <Button 
            onClick={openFileSelector}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </>
            )}
          </Button>
        </div>
        
        {/* Progress items */}
        {progressItems.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium">Upload Progress</h3>
            
            {progressItems.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <File className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="truncate max-w-xs">{item.fileName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.status === 'processing' ? 'Processing...' : 
                     item.status === 'complete' ? 'Complete' :
                     item.status === 'error' ? 'Error' : 'Uploading...'}
                  </span>
                </div>
                
                <Progress 
                  value={item.progress} 
                  className={`h-1.5 ${
                    item.status === 'error' ? 'bg-red-100' : 
                    item.status === 'complete' ? 'bg-green-100' : ''
                  }`}
                />
                
                {item.status === 'error' && item.error && (
                  <p className="text-xs text-red-500 mt-1">{item.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Uploaded documents will be stored in your workspace knowledge base
      </CardFooter>
    </Card>
  );
}
