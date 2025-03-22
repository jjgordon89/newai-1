import React, { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { DocumentUploader } from '@/components/document/DocumentUploader';
import { DocumentList } from '@/components/document/DocumentList';
import { DocumentViewer } from '@/components/document/DocumentViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoredDocument } from '@/lib/documentStorage';
import { Button } from '@/components/ui/button';
import { Plus, FileText, List } from 'lucide-react';

export default function DocumentManagement() {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState<string>('list');
  const [selectedDocument, setSelectedDocument] = useState<StoredDocument | null>(null);
  
  // Use a fixed workspace ID for this demo
  // In a real app, this would come from the user's selected workspace
  const workspaceId = localStorage.getItem('activeWorkspaceId') || 
    user?.id || 
    'default-workspace';
  
  // Handle document selection for viewing
  const handleViewDocument = (document: StoredDocument) => {
    setSelectedDocument(document);
    setActiveTab('view');
  };
  
  // Handle document selection for editing (not implemented in this demo)
  const handleEditDocument = (document: StoredDocument) => {
    setSelectedDocument(document);
    setActiveTab('view'); // Just view for now, as edit is not implemented
  };
  
  // Handle going back to the document list
  const handleBackToList = () => {
    setActiveTab('list');
  };
  
  // Handle document upload completion
  const handleDocumentUploaded = (documentId: string) => {
    // Switch to list view after upload
    setActiveTab('list');
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">
            Upload, view, and manage your documents
          </p>
        </div>
        <Button onClick={() => setActiveTab('upload')}>
          <Plus className="h-4 w-4 mr-2" />
          Upload New Document
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="list" className="flex items-center">
            <List className="h-4 w-4 mr-2" />
            Document List
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </TabsTrigger>
          <TabsTrigger value="view" disabled={!selectedDocument} className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            View Document
          </TabsTrigger>
        </TabsList>
        
        <div className="border rounded-lg shadow-sm bg-card">
          <TabsContent value="list" className="m-0 p-6">
            <DocumentList 
              workspaceId={workspaceId} 
              onViewDocument={handleViewDocument}
              onEditDocument={handleEditDocument}
            />
          </TabsContent>
          
          <TabsContent value="upload" className="m-0 p-6">
            <DocumentUploader 
              workspaceId={workspaceId}
              onDocumentUploaded={handleDocumentUploaded}
            />
          </TabsContent>
          
          <TabsContent value="view" className="m-0 p-6">
            <DocumentViewer 
              document={selectedDocument || undefined}
              workspaceId={workspaceId}
              onBack={handleBackToList}
            />
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Informational cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-2">Document Storage</h3>
          <p className="text-muted-foreground">
            Documents are stored securely using local storage for this demo. In a production environment, 
            they would be stored in a database or cloud storage solution.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-2">Redux Integration</h3>
          <p className="text-muted-foreground">
            This document management system is built using Redux Toolkit for state management, 
            with async thunks for handling asynchronous operations.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-2">Supported File Types</h3>
          <p className="text-muted-foreground">
            Currently supports TXT, PDF, DOCX, CSV, MD, JSON, and HTML files. 
            File contents are extracted and displayed directly in the browser.
          </p>
        </div>
      </div>
    </div>
  );
}