import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Search, List, RefreshCw } from 'lucide-react';
import DocumentUpload from '@/components/document/DocumentUpload';
import DocumentSearch from '@/components/document/DocumentSearch';
import { StoredDocument, documentStorage } from '@/lib/documentStorage';
import { SearchResultItem } from '@/lib/vectorSearchService';
import { useToast } from '@/components/ui/use-toast';

/**
 * Document Management Page
 * 
 * Combines document upload, search, and listing capabilities
 */
export default function DocumentManagementPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState('default');
  const [selectedDocument, setSelectedDocument] = useState<StoredDocument | SearchResultItem | null>(null);
  
  const { toast } = useToast();
  
  // Load documents on mount and when workspace changes
  useEffect(() => {
    loadDocuments();
  }, [workspaceId]);
  
  // Load documents from storage
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const repository = documentStorage.getRepository(workspaceId);
      const docs = await repository.listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle document selection from search results
  const handleSearchResultSelect = (document: SearchResultItem) => {
    setSelectedDocument(document);
    setActiveTab('view');
  };
  
  // Handle document selection from document list
  const handleDocumentSelect = (document: StoredDocument) => {
    setSelectedDocument(document);
    setActiveTab('view');
  };
  
  // Handle document upload completion
  const handleUploadComplete = (documentId: string) => {
    loadDocuments();
    setActiveTab('list');
  };
  
  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      await documentStorage.deleteDocument(documentId);
      
      // Reload documents
      loadDocuments();
      
      // If the deleted document was selected, clear selection
      if (selectedDocument && 'id' in selectedDocument && selectedDocument.id === documentId) {
        setSelectedDocument(null);
      }
      
      toast({
        title: 'Document Deleted',
        description: 'The document has been deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Upload, search, and manage your documents</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={loadDocuments} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 max-w-md">
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="upload">
            <UploadCloud className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="view" disabled={!selectedDocument}>
            View
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {/* Documents List Tab */}
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>
                  Manage your uploaded documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No documents found</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab('upload')}
                    >
                      Upload your first document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="border rounded-md p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div 
                            className="cursor-pointer flex-1"
                            onClick={() => handleDocumentSelect(doc)}
                          >
                            <h3 className="font-medium">{doc.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {doc.content.substring(0, 200)}...
                            </p>
                            <div className="flex text-xs text-muted-foreground mt-2">
                              <span>Created: {new Date(doc.createdAt).toLocaleString()}</span>
                              <span className="mx-2">•</span>
                              <span>Size: {doc.metadata.fileSize ? `${Math.round(doc.metadata.fileSize / 1024)} KB` : 'Unknown'}</span>
                            </div>
                          </div>
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Upload Tab */}
          <TabsContent value="upload">
            <DocumentUpload
              workspaceId={workspaceId}
              onUploadComplete={handleUploadComplete}
            />
          </TabsContent>
          
          {/* Search Tab */}
          <TabsContent value="search">
            <DocumentSearch
              workspaceId={workspaceId}
              onDocumentSelect={handleSearchResultSelect}
            />
          </TabsContent>
          
          {/* Document View Tab */}
          <TabsContent value="view">
            {selectedDocument && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {'title' in selectedDocument 
                      ? selectedDocument.title 
                      : selectedDocument.documentName || 'Document'}
                  </CardTitle>
                  <CardDescription>
                    {'createdAt' in selectedDocument
                      ? `Created: ${new Date(selectedDocument.createdAt).toLocaleString()}`
                      : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">
                      {'content' in selectedDocument
                        ? selectedDocument.content
                        : selectedDocument.text}
                    </p>
                  </div>
                  
                  {/* Metadata section */}
                  <div className="mt-8 border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Document Metadata</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {'metadata' in selectedDocument && Object.entries(selectedDocument.metadata)
                        .filter(([key]) => key !== 'embedding') // Skip embedding as it's too large
                        .map(([key, value]) => (
                          <div key={key}>
                            <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                            <dd className="text-sm mt-1">
                              {typeof value === 'object' 
                                ? JSON.stringify(value) 
                                : String(value)}
                            </dd>
                          </div>
                        ))}
                      
                      {'similarity' in selectedDocument && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Similarity Score</dt>
                          <dd className="text-sm mt-1">
                            {(selectedDocument.similarity * 100).toFixed(2)}%
                          </dd>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}