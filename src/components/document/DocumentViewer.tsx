import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDocument } from '@/redux/slices/documentSlice';
import { StoredDocument } from '@/lib/documentStorage';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, Clock, FileText, Loader2, Tag, User } from 'lucide-react';

interface DocumentViewerProps {
  documentId?: string;
  workspaceId: string;
  document?: StoredDocument;
  onBack?: () => void;
}

export function DocumentViewer({
  documentId,
  workspaceId,
  document: propDocument,
  onBack
}: DocumentViewerProps) {
  const dispatch = useAppDispatch();
  const { activeDocument, isLoading, error } = useAppSelector(state => state.documents);
  
  // Use either the document provided via props or the activeDocument from the store
  const document = propDocument || activeDocument;
  
  // Fetch the document if needed
  useEffect(() => {
    if (documentId && !document && workspaceId) {
      dispatch(fetchDocument({ documentId, workspaceId }));
    }
  }, [dispatch, documentId, document, workspaceId]);
  
  // Format date
  const formatDate = (dateString: string | number): string => {
    return new Date(dateString).toLocaleString();
  };
  
  // Document is loading
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading document...</span>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            Error Loading Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  // No document
  if (!document) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Document Selected</CardTitle>
          <CardDescription>
            Select a document to view its contents
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            No document is currently selected for viewing
          </p>
        </CardContent>
        <CardFooter>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  // Get proper content renderer based on document type
  const renderContent = () => {
    const docType = document.metadata?.type || 'txt';
    switch (docType) {
      case 'json':
        try {
          const jsonObj = JSON.parse(document.content);
          return (
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
              {JSON.stringify(jsonObj, null, 2)}
            </pre>
          );
        } catch (e) {
          return <div className="text-red-500">Invalid JSON</div>;
        }
      case 'md':
        return (
          <div className="prose max-w-none dark:prose-invert">
            {document.content}
          </div>
        );
      case 'html':
        return (
          <div 
            className="border rounded-md p-4 h-[500px] overflow-auto"
            dangerouslySetInnerHTML={{ __html: document.content }} 
          />
        );
      case 'csv':
        return (
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <tbody>
                {document.content.split('\n').map((line, lineIndex) => (
                  <tr key={lineIndex}>
                    {line.split(',').map((cell, cellIndex) => (
                      <td 
                        key={cellIndex} 
                        className="border px-2 py-1"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'txt':
      case 'docx':
      case 'pdf':
      default:
        return (
          <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
            {document.content}
          </div>
        );
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {document.title}
            </CardTitle>
            <CardDescription>
              {(document.metadata?.type || 'unknown').toUpperCase()} Document • Version {document.metadata?.version || '1'}
            </CardDescription>
          </div>
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>
      </CardHeader>
      
      <Tabs defaultValue="content">
        <div className="px-6">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="content">Document Content</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="content" className="m-0">
          <CardContent className="pt-6">
            {renderContent()}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="metadata" className="m-0">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Timeline
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p>{formatDate(document.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p>{formatDate(document.updatedAt)}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <Tag className="h-4 w-4 mr-2" />
                  File Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">File Name</p>
                    <p>{document.metadata.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">File Size</p>
                    <p>{document.metadata.fileSize} bytes</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">MIME Type</p>
                    <p>{document.metadata.fileType || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p>v{document.metadata?.version || '1'}</p>
                  </div>
                </div>
              </div>
              
              {document.metadata.uploadedBy && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <User className="h-4 w-4 mr-2" />
                      Upload Information
                    </h3>
                    <div>
                      <p className="text-sm text-muted-foreground">Uploaded By</p>
                      <p>{document.metadata.uploadedBy}</p>
                    </div>
                  </div>
                </>
              )}
              
              {/* Additional metadata fields */}
              {Object.entries(document.metadata).filter(([key]) => 
                !['fileName', 'fileSize', 'fileType', 'uploadedAt', 'version', 'lastModified', 'uploadedBy'].includes(key)
              ).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Additional Metadata</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(document.metadata)
                        .filter(([key]) => 
                          !['fileName', 'fileSize', 'fileType', 'uploadedAt', 'version', 'lastModified', 'uploadedBy'].includes(key)
                        )
                        .map(([key, value]) => (
                          <div key={key}>
                            <p className="text-sm text-muted-foreground">{key}</p>
                            <p>{String(value)}</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Badge variant="outline">{(document.metadata?.type || 'unknown').toUpperCase()}</Badge>
          <Badge variant="outline">v{document.metadata?.version || '1'}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated: {formatDate(document.updatedAt)}
        </p>
      </CardFooter>
    </Card>
  );
}
