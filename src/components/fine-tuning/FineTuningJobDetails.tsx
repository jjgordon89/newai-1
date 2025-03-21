import { useState, useEffect } from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Square,
  Trash2,
  BarChart2,
  FileText,
  Settings,
  Database,
  Layers,
  Cpu,
  BrainCircuit,
  Info,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getFineTuningJob, FineTuningJob } from '@/lib/fineTuningService';

interface FineTuningJobDetailsProps {
  jobId: string;
  onClose: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export function FineTuningJobDetails({
  jobId,
  onClose,
  onCancel,
  onDelete
}: FineTuningJobDetailsProps) {
  const [job, setJob] = useState<FineTuningJob | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { listDocuments } = useWorkspace();
  
  // Load job details
  useEffect(() => {
    if (!jobId) return;
    
    // Get the job
    const loadedJob = getFineTuningJob(jobId);
    if (loadedJob) {
      setJob(loadedJob);
    }
    
    // Set up polling for job updates
    const intervalId = setInterval(() => {
      const updatedJob = getFineTuningJob(jobId);
      if (updatedJob) {
        setJob(updatedJob);
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [jobId]);
  
  if (!job) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-6 w-32 bg-muted rounded mb-2 mx-auto"></div>
          <div className="h-4 w-48 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }
  
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
  
  // Get status badge
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
  
  // Document names
  const documentNames = job.dataset.documentIds.map(id => {
    const workspaceDocs = listDocuments ? listDocuments(job.workspaceId) || [] : [];
    const doc = workspaceDocs.find(doc => doc.id === id);
    return doc ? doc.name : `Document ${id}`;
  });
  
  // Status display
  const getStatusDisplay = () => {
    if (job.status === 'running' || job.status === 'preparing') {
      return (
        <div className="my-4">
          <div className="flex items-center justify-between mb-1 text-sm">
            <span>{job.status === 'preparing' ? 'Preparing data' : 'Training in progress'}</span>
            <span>{Math.round(job.progress)}%</span>
          </div>
          <Progress value={job.progress} className="h-2" />
        </div>
      );
    }
    
    if (job.status === 'failed') {
      return (
        <div className="my-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          <div className="font-medium flex items-center mb-1">
            <AlertTriangle className="h-4 w-4 mr-1" /> Training Failed
          </div>
          <p>{job.errorMessage}</p>
        </div>
      );
    }
    
    if (job.status === 'succeeded') {
      return (
        <div className="my-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-500 text-sm">
          <div className="font-medium flex items-center mb-1">
            <CheckCircle className="h-4 w-4 mr-1" /> Training Completed
          </div>
          <p>Fine-tuned model "{job.fineTunedModel?.name}" is ready to use</p>
        </div>
      );
    }
    
    if (job.status === 'cancelled') {
      return (
        <div className="my-4 p-3 bg-muted border border-muted rounded-md text-muted-foreground text-sm">
          <div className="font-medium flex items-center mb-1">
            <Square className="h-4 w-4 mr-1" /> Training Cancelled
          </div>
          <p>This fine-tuning job was cancelled {job.finishedAt ? `on ${formatDate(job.finishedAt)}` : ''}</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-xl flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              {job.name}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 mt-1">
              {getStatusBadge(job.status)}
              <span className="text-muted-foreground text-sm">
                Created {formatDate(job.createdAt)}
              </span>
            </DialogDescription>
          </div>
          {onCancel && job.status === 'running' && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex items-center gap-1"
            >
              <Square className="h-4 w-4" />
              Cancel Job
            </Button>
          )}
        </div>
      </DialogHeader>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="metrics" disabled={job.status !== 'succeeded'}>Results</TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="p-6 pt-0">
            {getStatusDisplay()}
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <div className="text-sm font-medium">Base Model</div>
                <div className="text-sm">{job.baseModelId}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Dataset Type</div>
                <div className="text-sm capitalize">{job.dataset.config.type}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Training Size</div>
                <div className="text-sm">{job.dataset.samples.toLocaleString()} samples</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Status</div>
                <div className="text-sm capitalize">{job.status}</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <FileText className="h-4 w-4" /> Data Sources
                </h3>
                <div className="bg-muted/40 rounded-md p-3">
                  <ul className="space-y-1">
                    {documentNames.length > 0 ? (
                      documentNames.map((name, i) => (
                        <li key={i} className="text-sm flex items-center gap-1">
                          <FileText className="h-3 w-3 text-primary" /> {name}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">No documents specified</li>
                    )}
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Settings className="h-4 w-4" /> Training Configuration
                </h3>
                <div className="bg-muted/40 rounded-md p-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Epochs</div>
                      <div className="text-sm">{job.hyperparams.epochs}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Batch Size</div>
                      <div className="text-sm">{job.hyperparams.batchSize}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Learning Rate</div>
                      <div className="text-sm">{job.hyperparams.learningRate}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Max Sequence Length</div>
                      <div className="text-sm">{job.hyperparams.maxSequenceLength}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {job.status === 'succeeded' && job.metrics && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <BarChart2 className="h-4 w-4" /> Training Results
                  </h3>
                  <div className="bg-muted/40 rounded-md p-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {job.metrics.trainingLoss !== undefined && (
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Training Loss</div>
                          <div className="text-sm">{job.metrics.trainingLoss.toFixed(4)}</div>
                        </div>
                      )}
                      {job.metrics.validationLoss !== undefined && (
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Validation Loss</div>
                          <div className="text-sm">{job.metrics.validationLoss.toFixed(4)}</div>
                        </div>
                      )}
                      {job.metrics.accuracy !== undefined && (
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                          <div className="text-sm">{(job.metrics.accuracy * 100).toFixed(2)}%</div>
                        </div>
                      )}
                      {job.metrics.perplexity !== undefined && (
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Perplexity</div>
                          <div className="text-sm">{job.metrics.perplexity.toFixed(2)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="configuration" className="p-6 pt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Database className="h-4 w-4" /> Dataset Configuration
                </h3>
                <div className="bg-muted/40 rounded-md p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Dataset Type</div>
                      <div className="text-sm capitalize">{job.dataset.config.type}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Validation Split</div>
                      <div className="text-sm">{(job.dataset.config.validationSplit * 100).toFixed(0)}%</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Include System Prompt</div>
                      <div className="text-sm">{job.dataset.config.includeSystemPrompt ? 'Yes' : 'No'}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Preprocessing Steps</div>
                      <div className="text-sm flex flex-wrap gap-1">
                        {job.dataset.config.preprocessingSteps.map((step, i) => (
                          <Badge key={i} className="bg-muted/50">{step}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Prompt Template</div>
                    <div className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto whitespace-pre">
                      {job.dataset.config.promptTemplate}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Settings className="h-4 w-4" /> Hyperparameters
                </h3>
                <div className="bg-muted/40 rounded-md p-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Epochs</div>
                      <div className="text-sm">{job.hyperparams.epochs}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Batch Size</div>
                      <div className="text-sm">{job.hyperparams.batchSize}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Learning Rate</div>
                      <div className="text-sm">{job.hyperparams.learningRate}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Weight Decay</div>
                      <div className="text-sm">{job.hyperparams.weightDecay}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Warmup Steps</div>
                      <div className="text-sm">{job.hyperparams.warmupSteps}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Max Sequence Length</div>
                      <div className="text-sm">{job.hyperparams.maxSequenceLength}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Evaluation Strategy</div>
                      <div className="text-sm">{job.hyperparams.evaluationStrategy}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Save Steps</div>
                      <div className="text-sm">{job.hyperparams.saveSteps}</div>
                    </div>
                    {job.hyperparams.usePeft && (
                      <>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">LoRA Rank</div>
                          <div className="text-sm">{job.hyperparams.loraRank}</div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">LoRA Alpha</div>
                          <div className="text-sm">{job.hyperparams.loraAlpha}</div>
                        </div>
                      </>
                    )}
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Parameter-Efficient Fine-Tuning</div>
                      <div className="text-sm">{job.hyperparams.usePeft ? 'Yes (LoRA)' : 'No'}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Layers className="h-4 w-4" /> Model Details
                </h3>
                <div className="bg-muted/40 rounded-md p-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Base Model</div>
                      <div className="text-sm">{job.baseModelId}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Model Type</div>
                      <div className="text-sm">
                        {job.baseModelId.includes('llama') ? 'LLaMA' : 
                         job.baseModelId.includes('mistral') ? 'Mistral' : 
                         job.baseModelId.includes('phi') ? 'Phi' : 'Generic LLM'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="p-6 pt-0">
            {job.metrics ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <BarChart2 className="h-4 w-4" /> Performance Metrics
                  </h3>
                  <div className="bg-muted/40 rounded-md p-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {job.metrics.trainingLoss !== undefined && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Training Loss</div>
                          <div className="text-lg font-medium">{job.metrics.trainingLoss.toFixed(4)}</div>
                          <div className="text-xs text-muted-foreground">
                            Lower is better. Measures how well the model fits the training data.
                          </div>
                        </div>
                      )}
                      
                      {job.metrics.validationLoss !== undefined && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Validation Loss</div>
                          <div className="text-lg font-medium">{job.metrics.validationLoss.toFixed(4)}</div>
                          <div className="text-xs text-muted-foreground">
                            Lower is better. Measures how well the model generalizes to new data.
                          </div>
                        </div>
                      )}
                      
                      {job.metrics.accuracy !== undefined && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                          <div className="text-lg font-medium">{(job.metrics.accuracy * 100).toFixed(2)}%</div>
                          <div className="text-xs text-muted-foreground">
                            Higher is better. Percentage of correct predictions.
                          </div>
                        </div>
                      )}
                      
                      {job.metrics.perplexity !== undefined && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Perplexity</div>
                          <div className="text-lg font-medium">{job.metrics.perplexity.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            Lower is better. Measures how confident the model is in its predictions.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Info className="h-4 w-4" /> Model Information
                  </h3>
                  <div className="bg-muted/40 rounded-md p-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground">Model Name</div>
                        <div className="text-sm">{job.fineTunedModel?.name || 'Unnamed model'}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground">Base Model</div>
                        <div className="text-sm">{job.baseModelId}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground">Created</div>
                        <div className="text-sm">{job.finishedAt ? formatDate(job.finishedAt) : 'Unknown'}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground">Model Size</div>
                        <div className="text-sm">{job.fineTunedModel?.size} MB</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No metrics available for this job.
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
      
      <div className="flex justify-between items-center p-4 border-t">
        {(job.status === 'succeeded' || job.status === 'failed' || job.status === 'cancelled') && onDelete && (
          <Button 
            variant="destructive" 
            onClick={onDelete}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete Job
          </Button>
        )}
        
        <Button onClick={onClose} className="ml-auto">
          Close
        </Button>
      </div>
    </>
  );
}