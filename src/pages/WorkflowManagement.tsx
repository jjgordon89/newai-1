import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/context/WorkflowContext';
import { Workflow } from '@/lib/workflowTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { 
  Plus, 
  Search, 
  FolderIcon, 
  FileIcon, 
  Settings, 
  Download, 
  Upload, 
  Copy, 
  Trash, 
  Play,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const WorkflowManagement: React.FC = () => {
  console.log("Rendering WorkflowManagement component");
  const navigate = useNavigate();
  const {
    workflows,
    createWorkflow,
    deleteWorkflow,
    templates,
    setActiveWorkflowId
  } = useWorkflow();
  
  console.log("Workflows:", workflows);
  console.log("Templates:", templates);
  
  // Local state for workflows if context fails
  const [localWorkflows, setLocalWorkflows] = useState<Workflow[]>([]);
  
  useEffect(() => {
    console.log("WorkflowManagement mounted");
    
    // Force a refresh of localStorage data
    const savedWorkflows = localStorage.getItem('workflows');
    if (savedWorkflows) {
      console.log("LocalStorage workflows:", JSON.parse(savedWorkflows));
    } else {
      console.log("No workflows found in localStorage");
    }
    
    // Add dummy workflow for debugging if none exist
    if (workflows.length === 0) {
      console.log("No workflows in context, creating local fallback workflows");
      
      // Create some fallback local workflows for testing
      const fallbackWorkflows = [
        {
          id: "fallback-1",
          name: "Simple RAG Workflow",
          description: "A workflow that uses retrieval augmented generation",
          category: "AI Agents",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nodes: [],
          edges: []
        },
        {
          id: "fallback-2",
          name: "Web Search Agent",
          description: "A workflow that enhances responses with web search results",
          category: "Search",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nodes: [],
          edges: []
        }
      ];
      
      setLocalWorkflows(fallbackWorkflows);
    }
  }, [workflows.length]);
  
  // Use local workflows if context workflows are empty
  const effectiveWorkflows = workflows.length > 0 ? workflows : localWorkflows;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Filter workflows based on search query
  const filteredWorkflows = effectiveWorkflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (workflow.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group workflows by category
  const workflowsByCategory = filteredWorkflows.reduce((acc, workflow) => {
    const category = workflow.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(workflow);
    return acc;
  }, {} as Record<string, Workflow[]>);
  
  // Sort categories by name
  const sortedCategories = Object.keys(workflowsByCategory).sort();
  
  // Handle creating a new workflow
  const handleCreateWorkflow = (name: string, description: string, templateId?: string) => {
    try {
      const newWorkflow = createWorkflow(name, description, templateId);
      setShowCreateDialog(false);
      toast({
        title: "Workflow Created",
        description: `"${name}" has been created successfully.`,
      });
      // Navigate to the workflow builder with the new workflow
      navigate(`/workflow-builder/${newWorkflow.id}`);
    } catch (error) {
      toast({
        title: "Error Creating Workflow",
        description: `Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };
  
  // Handle deleting a workflow
  const handleDeleteWorkflow = () => {
    if (!selectedWorkflow) return;
    
    try {
      deleteWorkflow(selectedWorkflow.id);
      setSelectedWorkflow(null);
      setShowDeleteDialog(false);
      toast({
        title: "Workflow Deleted",
        description: `"${selectedWorkflow.name}" has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error Deleting Workflow",
        description: `Failed to delete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };
  
  // Handle importing a workflow
  const handleImportWorkflow = () => {
    try {
      setImportError('');
      
      if (!importData.trim()) {
        setImportError('Please enter workflow JSON data');
        return;
      }
      
      // Parse the import data
      const parsedData = JSON.parse(importData);
      
      // Basic validation
      if (!parsedData.name || !parsedData.nodes || !Array.isArray(parsedData.nodes)) {
        setImportError('Invalid workflow data structure');
        return;
      }
      
      // Create the workflow
      const newWorkflow = createWorkflow(
        parsedData.name,
        parsedData.description || '',
      );
      
      // Add nodes and edges to the workflow
      // This would need to be implemented in the WorkflowContext
      // For now, we'll just create an empty workflow with the name and description
      
      setShowImportDialog(false);
      setImportData('');
      
      toast({
        title: "Workflow Imported",
        description: `"${parsedData.name}" has been imported successfully.`,
      });
      
      // Navigate to the workflow builder with the imported workflow
      navigate(`/workflow-builder/${newWorkflow.id}`);
    } catch (error) {
      setImportError(`Failed to import workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Handle exporting a workflow
  const handleExportWorkflow = (workflow: Workflow) => {
    try {
      // Create export data
      const exportData = {
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0'
        }
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create data URI
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
      
      // Create download link
      const exportFileDefaultName = `workflow-${workflow.id}-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Workflow Exported",
        description: `"${workflow.name}" has been exported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error Exporting Workflow",
        description: `Failed to export workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };
  
  // Handle running a workflow
  const handleRunWorkflow = (workflow: Workflow) => {
    setActiveWorkflowId(workflow.id);
    navigate(`/workflow-builder/${workflow.id}`);
    
    // The actual execution will be handled in the WorkflowBuilder component
    // This just navigates to the workflow builder with the selected workflow
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workflow Management</h1>
          <p className="text-muted-foreground">Build, manage, and run AI workflows</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Workflow grid */}
      {sortedCategories.length > 0 ? (
        <div className="space-y-8">
          {sortedCategories.map(category => (
            <div key={category}>
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold">{category}</h2>
                <Separator className="flex-1 ml-4" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflowsByCategory[category].map(workflow => (
                  <Card key={workflow.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg truncate">{workflow.name}</CardTitle>
                        <Badge variant={workflow.nodes.length > 0 ? "default" : "outline"}>
                          {workflow.nodes.length > 0 ? 'Active' : 'Draft'}
                        </Badge>
                      </div>
                      <CardDescription className="truncate">
                        {workflow.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileIcon className="h-4 w-4" />
                        <span>{workflow.nodes.length} nodes</span>
                        <span className="text-border">•</span>
                        <span>{workflow.edges.length} connections</span>
                      </div>
                      
                      <div className="mt-3 text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(workflow.updatedAt))} ago
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0 flex gap-2">
                      <Button variant="default" size="sm" className="flex-1" onClick={() => handleRunWorkflow(workflow)}>
                        <Play className="h-4 w-4 mr-2" />
                        Run
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={() => navigate(`/workflow-builder/${workflow.id}`)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" onClick={() => handleExportWorkflow(workflow)} title="Export">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => {
                            setSelectedWorkflow(workflow);
                            setShowDeleteDialog(true);
                          }}
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed">
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
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Workflow
            </Button>
          )}
        </div>
      )}
      
      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Start with a template or create a workflow from scratch
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="templates">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="empty">Empty</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                {templates.map(template => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleCreateWorkflow(template.name, template.description, template.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {template.nodes.length} nodes • {template.edges.length} connections
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Use Template</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="empty" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Workflow Name
                  </label>
                  <Input
                    id="name"
                    placeholder="My Workflow"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description (optional)
                  </label>
                  <Input
                    id="description"
                    placeholder="Description of what this workflow does"
                  />
                </div>
                <div className="pt-4">
                  <Button 
                    className="w-full"
                    onClick={() => {
                      const nameInput = document.getElementById('name') as HTMLInputElement;
                      const descInput = document.getElementById('description') as HTMLInputElement;
                      handleCreateWorkflow(nameInput.value, descInput.value);
                    }}
                  >
                    Create Empty Workflow
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Import Workflow Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Workflow</DialogTitle>
            <DialogDescription>
              Paste the workflow JSON to import
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <textarea
              className="w-full h-64 p-3 text-sm font-mono border rounded-md"
              placeholder="Paste workflow JSON here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
            
            {importError && (
              <div className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {importError}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportWorkflow}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedWorkflow && (
            <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
              <FileIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{selectedWorkflow.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedWorkflow.nodes.length} nodes • {selectedWorkflow.edges.length} connections
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWorkflow}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowManagement;