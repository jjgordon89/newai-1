import { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  Play,
  Square,
  Trash2,
  Plus,
  Cpu,
  BrainCircuit,
  BarChart2,
  Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NewFineTuningJobDialog } from '@/components/fine-tuning/NewFineTuningJobDialog';
import { FineTuningJobDetails } from '@/components/fine-tuning/FineTuningJobDetails';
import { FineTunedModelCard } from '@/components/fine-tuning/FineTunedModelCard';
import { useToast } from '@/hooks/use-toast';

import {
  FineTuningJob,
  FineTunedModel,
  getWorkspaceFineTuningJobs,
  getWorkspaceFineTunedModels,
  cancelFineTuningJob,
  deleteFineTuningJob,
  deleteFineTunedModel,
} from '@/lib/fineTuningService';

export default function FineTuning() {
  const { activeWorkspaceId } = useWorkspace();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState<FineTuningJob[]>([]);
  const [models, setModels] = useState<FineTunedModel[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'job' | 'model', name: string} | null>(null);

  // Load jobs and models
  useEffect(() => {
    if (!activeWorkspaceId) return;
    
    // Load jobs
    const workspaceJobs = getWorkspaceFineTuningJobs(activeWorkspaceId);
    setJobs(workspaceJobs);
    
    // Load models
    const workspaceModels = getWorkspaceFineTunedModels(activeWorkspaceId);
    setModels(workspaceModels);
    
    // Set up polling for job updates
    const intervalId = setInterval(() => {
      const updatedJobs = getWorkspaceFineTuningJobs(activeWorkspaceId);
      setJobs(updatedJobs);
      
      // Also refresh models as jobs complete
      const updatedModels = getWorkspaceFineTunedModels(activeWorkspaceId);
      setModels(updatedModels);
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [activeWorkspaceId]);

  // Handle job actions
  const handleCancelJob = (jobId: string) => {
    const result = cancelFineTuningJob(jobId);
    if (result) {
      toast({
        title: "Job Cancelled",
        description: "The fine-tuning job has been cancelled.",
      });
      // Refresh jobs
      if (activeWorkspaceId) {
        const updatedJobs = getWorkspaceFineTuningJobs(activeWorkspaceId);
        setJobs(updatedJobs);
      }
    } else {
      toast({
        title: "Error",
        description: "Could not cancel the fine-tuning job.",
        variant: "destructive",
      });
    }
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'job') {
      const result = deleteFineTuningJob(itemToDelete.id);
      if (result) {
        toast({
          title: "Job Deleted",
          description: `The fine-tuning job "${itemToDelete.name}" has been deleted.`,
        });
        if (activeWorkspaceId) {
          const updatedJobs = getWorkspaceFineTuningJobs(activeWorkspaceId);
          setJobs(updatedJobs);
        }
      } else {
        toast({
          title: "Error",
          description: "Could not delete the fine-tuning job. Only completed or cancelled jobs can be deleted.",
          variant: "destructive",
        });
      }
    } else if (itemToDelete.type === 'model') {
      const result = deleteFineTunedModel(itemToDelete.id);
      if (result) {
        toast({
          title: "Model Deleted",
          description: `The fine-tuned model "${itemToDelete.name}" has been deleted.`,
        });
        if (activeWorkspaceId) {
          const updatedModels = getWorkspaceFineTunedModels(activeWorkspaceId);
          setModels(updatedModels);
        }
      } else {
        toast({
          title: "Error",
          description: "Could not delete the fine-tuned model.",
          variant: "destructive",
        });
      }
    }
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Job status badges
  const getStatusBadge = (status: FineTuningJob['status']) => {
    switch (status) {
      case 'queued':
        return <Badge className="bg-muted text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" /> Queued
        </Badge>;
      case 'preparing':
        return <Badge className="bg-blue-500/10 text-blue-500">
          <Cpu className="mr-1 h-3 w-3" /> Preparing
        </Badge>;
      case 'running':
        return <Badge className="bg-amber-500/10 text-amber-500">
          <Play className="mr-1 h-3 w-3" /> Running
        </Badge>;
      case 'succeeded':
        return <Badge className="bg-green-500/10 text-green-500">
          <CheckCircle className="mr-1 h-3 w-3" /> Completed
        </Badge>;
      case 'failed':
        return <Badge className="bg-destructive/10 text-destructive">
          <AlertTriangle className="mr-1 h-3 w-3" /> Failed
        </Badge>;
      case 'cancelled':
        return <Badge className="bg-muted text-muted-foreground">
          <Square className="mr-1 h-3 w-3" /> Cancelled
        </Badge>;
      case 'stopping':
        return <Badge className="bg-amber-500/10 text-amber-500">
          <Square className="mr-1 h-3 w-3" /> Stopping
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              Fine-Tuning
            </h1>
            <p className="text-muted-foreground">
              Fine-tune models on your workspace data for customized performance
            </p>
          </div>
          <Button 
            onClick={() => setShowNewJobDialog(true)}
            className="flex gap-1"
          >
            <Plus className="h-4 w-4" />
            New Fine-Tuning Job
          </Button>
        </div>
        
        <Tabs 
          defaultValue="jobs" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="models">Fine-Tuned Models</TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs" className="flex-1 overflow-auto">
            {jobs.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Fine-Tuning Jobs</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Create a new fine-tuning job to customize a model on your data.
                  Fine-tuned models can better understand your specific content and terminology.
                </p>
                <Button 
                  onClick={() => setShowNewJobDialog(true)}
                  variant="default"
                >
                  Create Fine-Tuning Job
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map(job => (
                  <Card 
                    key={job.id} 
                    className={`transition-shadow hover:shadow-md cursor-pointer ${selectedJobId === job.id ? 'border-primary/50 shadow-sm' : ''}`}
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            {job.name}
                          </CardTitle>
                          <CardDescription>
                            Based on {job.baseModelId.split('/').pop()}
                          </CardDescription>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      {(job.status === 'preparing' || job.status === 'running') && (
                        <>
                          <Progress value={job.progress} className="h-2 mb-1" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{Math.round(job.progress)}% Complete</span>
                            <span>Updated {formatDate(job.updatedAt)}</span>
                          </div>
                        </>
                      )}
                      
                      {job.status === 'succeeded' && (
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Fine-tuned model:</span>
                            <span className="font-medium">{job.fineTunedModel?.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Completed:</span>
                            <span>{job.finishedAt ? formatDate(job.finishedAt) : '-'}</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge className="bg-muted/30">
                              <Settings className="mr-1 h-3 w-3" /> {job.hyperparams.epochs} epochs
                            </Badge>
                            <Badge className="bg-muted/30">
                              <Cpu className="mr-1 h-3 w-3" /> Batch size: {job.hyperparams.batchSize}
                            </Badge>
                            {job.metrics?.accuracy && (
                              <Badge className="bg-green-500/10 text-green-500">
                                <BarChart2 className="mr-1 h-3 w-3" /> Accuracy: {(job.metrics.accuracy * 100).toFixed(1)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {job.status === 'failed' && (
                        <div className="text-destructive text-sm mt-1">
                          <span className="font-medium">Error:</span> {job.errorMessage}
                        </div>
                      )}
                      
                      {(job.status === 'cancelled' || job.status === 'stopping') && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {job.status === 'cancelled' ? 'Job was cancelled' : 'Job is stopping...'}
                          {job.finishedAt && ` on ${formatDate(job.finishedAt)}`}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      <div className="text-xs text-muted-foreground">
                        Created {formatDate(job.createdAt)}
                      </div>
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {job.status === 'running' && (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelJob(job.id);
                                }}
                              >
                                <Square className="mr-2 h-4 w-4" />
                                Cancel Job
                              </DropdownMenuItem>
                            )}
                            {['succeeded', 'failed', 'cancelled'].includes(job.status) && (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemToDelete({
                                    id: job.id, 
                                    type: 'job',
                                    name: job.name
                                  });
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Job
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="models" className="flex-1 overflow-auto">
            {models.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Cpu className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Fine-Tuned Models</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Complete a fine-tuning job to create custom models based on your data.
                  Fine-tuned models will appear here.
                </p>
                <Button 
                  onClick={() => {
                    setActiveTab('jobs');
                    setShowNewJobDialog(true);
                  }}
                  variant="default"
                >
                  Create Fine-Tuning Job
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map(model => (
                  <FineTunedModelCard
                    key={model.id}
                    model={model}
                    onDelete={() => {
                      setItemToDelete({
                        id: model.id,
                        type: 'model',
                        name: model.name
                      });
                      setDeleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Job details dialog */}
      {selectedJobId && (
        <Dialog open={!!selectedJobId} onOpenChange={(open) => !open && setSelectedJobId(null)}>
          <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden">
            <FineTuningJobDetails 
              jobId={selectedJobId} 
              onClose={() => setSelectedJobId(null)}
              onCancel={() => {
                handleCancelJob(selectedJobId);
                setSelectedJobId(null);
              }}
              onDelete={() => {
                setItemToDelete({
                  id: selectedJobId,
                  type: 'job',
                  name: jobs.find(job => job.id === selectedJobId)?.name || 'Job'
                });
                setSelectedJobId(null);
                setDeleteDialogOpen(true);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* New job dialog */}
      <NewFineTuningJobDialog
        open={showNewJobDialog}
        onOpenChange={setShowNewJobDialog}
        workspaceId={activeWorkspaceId || ''}
        onSuccess={() => {
          if (activeWorkspaceId) {
            const updatedJobs = getWorkspaceFineTuningJobs(activeWorkspaceId);
            setJobs(updatedJobs);
          }
        }}
      />
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {itemToDelete?.type === 'job' 
                ? `Are you sure you want to delete the fine-tuning job "${itemToDelete?.name}"? This action cannot be undone.`
                : `Are you sure you want to delete the fine-tuned model "${itemToDelete?.name}"? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}