import React, { useEffect } from 'react';
import { DocumentSettings } from '@/components/DocumentSettings';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Database, ArrowLeft, Settings, DownloadCloud, UploadCloud } from 'lucide-react';

export default function DocumentSettingsPage() {
  const { activeWorkspaceId, workspaces } = useWorkspace();
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  // If no workspace is active, use the first one
  const workspaceId = activeWorkspaceId || workspaces[0]?.id;

  if (!workspaceId) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">No Workspace Available</h1>
            <p className="text-muted-foreground">Please create a workspace to manage documents</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                <a href="/profile">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </a>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Document Settings</h1>
            </div>
            <p className="text-muted-foreground">
              Configure document processing and knowledge base settings for {activeWorkspace?.name || "your workspace"}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5">
              <UploadCloud className="h-4 w-4" />
              Export Settings
            </Button>
            <Button variant="outline" className="gap-1.5">
              <DownloadCloud className="h-4 w-4" />
              Import Settings
            </Button>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="settings" className="text-base py-3 gap-2">
              <Settings className="h-4 w-4" />
              Document Settings
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-base py-3 gap-2">
              <FileText className="h-4 w-4" />
              Manage Documents
            </TabsTrigger>
            <TabsTrigger value="vectordb" className="text-base py-3 gap-2">
              <Database className="h-4 w-4" />
              Vector Database
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-6">
            <DocumentSettings workspaceId={workspaceId} />
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-6">
            <div className="text-center py-10">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Document Management</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                This section will allow you to view, upload, and manage all the documents in your knowledge base.
              </p>
              <Button asChild>
                <a href="/knowledge-base">Go to Document Manager</a>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="vectordb" className="space-y-6">
            <div className="text-center py-10">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vector Database</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                This section will provide tools to manage, monitor, and optimize your vector database for document retrieval.
              </p>
              <Button>Vector Database Management</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}