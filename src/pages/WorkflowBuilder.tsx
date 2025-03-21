import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WorkflowProvider, useWorkflow } from '@/context/WorkflowContext';
import { WorkflowBuilder as WorkflowBuilderComponent } from '@/components/workflow/WorkflowBuilder';
import { ChevronLeft, PlusCircle, FileIcon, FolderIcon, SearchIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

// Mini workflow builder component for the dashboard
export const MiniWorkflowBuilder: React.FC = () => {
  const { workflows, setActiveWorkflowId, deleteWorkflow } = useWorkflow();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredWorkflows = workflows.filter(workflow => 
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleDeleteWorkflow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(id);
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Workflows</h1>
          <p className="text-muted-foreground">Build, customize, and deploy AI agent workflows</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            asChild
          >
            <Link to="/profile">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
          
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                New Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="templates">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="empty">Empty</TabsTrigger>
                </TabsList>
                <TabsContent value="templates" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
                      const workflow = useWorkflow().createWorkflow('Simple RAG Agent', 'Basic workflow using retrieval augmented generation', 'template-1');
                      setActiveWorkflowId(workflow.id);
                      setShowNewDialog(false);
                    }}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Simple RAG Agent</CardTitle>
                        <CardDescription>Basic workflow using retrieval augmented generation</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          A simple workflow that retrieves relevant documents and uses them to generate a response.
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Use Template</Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
                      const workflow = useWorkflow().createWorkflow('Web Search Agent', 'Enhances responses with web search results', 'template-2');
                      setActiveWorkflowId(workflow.id);
                      setShowNewDialog(false);
                    }}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Web Search Agent</CardTitle>
                        <CardDescription>Enhances responses with web search results</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          A workflow that uses web search to gather information before generating a response.
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Use Template</Button>
                      </CardFooter>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="empty" className="space-y-4 mt-4">
                  <div className="text-center p-6">
                    <Button 
                      className="w-full"
                      onClick={() => {
                        const workflow = useWorkflow().createWorkflow('New Workflow');
                        setActiveWorkflowId(workflow.id);
                        setShowNewDialog(false);
                      }}
                    >
                      Create Empty Workflow
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search workflows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkflows.length > 0 ? (
          filteredWorkflows.map(workflow => (
            <Link
              key={workflow.id}
              to={`/workflow-builder/${workflow.id}`}
              className="block"
            >
              <Card className="cursor-pointer h-full hover:border-primary transition-colors flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <Button
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDeleteWorkflow(e, workflow.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" x2="10" y1="11" y2="17"/>
                        <line x1="14" x2="14" y1="11" y2="17"/>
                      </svg>
                    </Button>
                  </div>
                  <CardDescription>
                    {workflow.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileIcon className="h-4 w-4" />
                    <span>{workflow.nodes.length} nodes</span>
                    <span className="text-border">•</span>
                    <span>{workflow.edges.length} connections</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex justify-between items-center w-full">
                    <div className="text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(workflow.updatedAt))} ago
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {workflow.nodes.length > 0 ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border rounded-lg border-dashed">
            <FolderIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No workflows found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery 
                ? `No workflows matching "${searchQuery}"` 
                : "Create your first workflow to get started"}
            </p>
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            ) : (
              <Button onClick={() => setShowNewDialog(true)}>
                Create Workflow
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main wrapper component for the workflow builder page
export const WorkflowBuilderPage: React.FC = () => {
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  
  // Get the workflow ID from the URL if we're in edit mode
  // Check for workflow ID in URL or path
  useEffect(() => {
    // Handle URL path with ID param
    const pathParts = window.location.pathname.split('/');
    const pathId = pathParts[pathParts.length - 1];
    
    // Handle URL query param
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');
    
    // Set the ID if found and not already set
    const idFromUrl = queryId || (pathId && pathId !== 'workflow-builder' ? pathId : null);
    
    if (idFromUrl && !activeWorkflowId) {
      setActiveWorkflowId(idFromUrl);
    }
  }, [activeWorkflowId]);
  
  return (
    <WorkflowProvider>
      <div className="h-screen flex flex-col bg-background">
        {activeWorkflowId ? (
          <WorkflowBuilderComponent
            workflowId={activeWorkflowId}
            onBack={() => setActiveWorkflowId(null)}
          />
        ) : (
          <MiniWorkflowBuilder />
        )}
      </div>
    </WorkflowProvider>
  );
};