import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanceDbSearchPanel } from '@/components/LanceDbSearchPanel';
import { Button } from '@/components/ui/button';
import { Database, Search, Book, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const DocumentKnowledgeBase = () => {
  const workspaceContext = useWorkspace();
  const activeWorkspaceId = workspaceContext?.activeWorkspaceId || 'default-workspace';
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Knowledge Base
          </h1>
          <p className="text-muted-foreground">
            Search and explore your document knowledge
          </p>
        </div>
        
        <Button asChild className="gap-2">
          <Link to="/documents">
            <FileText className="h-4 w-4" />
            Manage Documents
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeWorkspaceId ? (
            <LanceDbSearchPanel workspaceId={activeWorkspaceId} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No workspace selected</CardTitle>
                <CardDescription>
                  Please select a workspace to search documents
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Vector Search
              </CardTitle>
              <CardDescription>
                About vector search and RAG
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Vector search enables semantic understanding of your documents, allowing AI to retrieve relevant information based on meaning rather than just keywords.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Book className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Retrieval Augmented Generation</p>
                    <p className="text-xs text-muted-foreground">Provides context to LLMs from your knowledge base</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <Search className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Semantic Search</p>
                    <p className="text-xs text-muted-foreground">Finds relevant information based on meaning</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentKnowledgeBase;