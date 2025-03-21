import React from 'react';
import { DocumentManager } from '@/components/DocumentManager';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Book } from 'lucide-react';

const Documents = () => {
  const workspaceContext = useWorkspace();
  const activeWorkspaceId = workspaceContext?.activeWorkspaceId || 'default-workspace';
  
  return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Document Management
            </h1>
            <p className="text-muted-foreground">
              Upload and manage documents for your AI workflows
            </p>
          </div>
          
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeWorkspaceId ? (
              <DocumentManager workspaceId={activeWorkspaceId} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No workspace selected</CardTitle>
                  <CardDescription>
                    Please select a workspace to manage documents
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-primary" />
                  Knowledge Base
                </CardTitle>
                <CardDescription>
                  Search and explore your document knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Documents uploaded here are available for RAG operations in your workflows
                </p>
                <Button variant="outline" className="w-full">
                  Explore Knowledge Base
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default Documents;