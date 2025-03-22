import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  fetchWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  setActiveWorkflow,
  Workflow,
  WorkflowNode,
  WorkflowEdge
} from '../redux/slices/workflowSlice';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../components/ui/alert-dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';

import {
  Play,
  Plus,
  Edit,
  Trash,
  AlertCircle,
  Loader2,
  Settings,
  ListFilter,
  ArrowRight,
  GitBranch
} from 'lucide-react';

export default function WorkflowManagement() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { workflows, activeWorkflow, executions, isLoading, error } = useAppSelector(
    state => state.workflows
  );

  // Local state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'AI Agents'
  });

  // Fetch workflows on mount
  useEffect(() => {
    dispatch(fetchWorkflows());
  }, [dispatch]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle category select change
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Workflow name is required',
          variant: 'destructive'
        });
        return;
      }

      // Create initial nodes and edges for a new workflow
      const initialNodes: WorkflowNode[] = [
        {
          id: 'input-1',
          type: 'input',
          position: { x: 100, y: 100 },
          data: {
            label: 'Input',
            variableName: 'input',
            dataType: 'string'
          }
        },
        {
          id: 'output-1',
          type: 'output',
          position: { x: 100, y: 300 },
          data: {
            label: 'Output',
            variableName: 'output',
            dataType: 'string'
          }
        }
      ];

      const initialEdges: WorkflowEdge[] = [
        {
          id: 'edge-input-output',
          source: 'input-1',
          target: 'output-1',
          type: 'default'
        }
      ];

      // Create new workflow
      await dispatch(createWorkflow({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        nodes: initialNodes,
        edges: initialEdges
      })).unwrap();

      // Show success message
      toast({
        title: 'Workflow Created',
        description: `"${formData.name}" has been successfully created.`
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        category: 'AI Agents'
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive'
      });
    }
  };

  // Handle delete workflow
  const handleDeleteWorkflow = async (id: string) => {
    try {
      await dispatch(deleteWorkflow(id)).unwrap();
      
      toast({
        title: 'Workflow Deleted',
        description: 'The workflow has been successfully deleted.'
      });
      
      setWorkflowToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive'
      });
    }
  };

  // Handle execute workflow
  const handleExecuteWorkflow = async (id: string) => {
    try {
      await dispatch(executeWorkflow(id)).unwrap();
      
      toast({
        title: 'Workflow Execution Started',
        description: 'The workflow execution has been started.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive'
      });
    }
  };

  // Handle edit workflow
  const handleEditWorkflow = (workflow: Workflow) => {
    dispatch(setActiveWorkflow(workflow));
    navigate(`/workflow-builder/${workflow.id}`);
  };

  // Get filtered workflows based on selected category
  const filteredWorkflows = selectedCategory === 'all'
    ? workflows
    : workflows.filter(w => w.category === selectedCategory);

  // Get unique categories from workflows, ensuring string typie
  const categories = ['all', ...Array.from(new Set(workflows.map(w => String(w.category || ''))))];

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workflow Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and execute automated workflows
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Define the details for your new workflow.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter workflow name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the purpose of this workflow"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI Agents">AI Agents</SelectItem>
                      <SelectItem value="Document Processing">Document Processing</SelectItem>
                      <SelectItem value="Search">Search</SelectItem>
                      <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Workflow'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Workflows</CardTitle>
            <div className="flex items-center space-x-2">
              <ListFilter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.toString()} value={category.toString()}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading workflows...</span>
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <GitBranch className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">No workflows found</h3>
              <p className="text-muted-foreground">
                {selectedCategory === 'all'
                  ? 'Create your first workflow to get started'
                  : `No workflows found in the "${selectedCategory}" category`}
              </p>
              {selectedCategory !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSelectedCategory('all')}
                >
                  Show All Workflows
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Nodes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows.map(workflow => (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <GitBranch className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <div>{workflow.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {workflow.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{workflow.category}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(workflow.createdAt)}</TableCell>
                      <TableCell>{formatDate(workflow.updatedAt)}</TableCell>
                      <TableCell>{workflow.nodes.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExecuteWorkflow(workflow.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditWorkflow(workflow)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setWorkflowToDelete(workflow.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution Status Card */}
      {executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
            <CardDescription>
              Track the status and results of your workflow executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map(execution => {
                    const workflow = workflows.find(w => w.id === execution.workflowId);
                    
                    return (
                      <TableRow key={execution.id}>
                        <TableCell className="font-mono text-xs">
                          {execution.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {workflow ? workflow.name : execution.workflowId}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              execution.status === 'completed'
                                ? 'default'
                                : execution.status === 'failed'
                                ? 'destructive'
                                : execution.status === 'running'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {execution.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(execution.startTime)}</TableCell>
                        <TableCell>
                          {execution.endTime ? formatDate(execution.endTime) : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!workflowToDelete}
        onOpenChange={open => !open && setWorkflowToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workflow
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => workflowToDelete && handleDeleteWorkflow(workflowToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}