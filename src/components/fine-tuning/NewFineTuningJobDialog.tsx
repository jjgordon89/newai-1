import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import { 
  FileText, 
  ChevronsUpDown, 
  Settings, 
  Database, 
  BrainCircuit,
  InfoIcon,
  CheckCircle2,
  Check
} from 'lucide-react';

import { HuggingFaceModel } from '@/lib/api';
import { SUPPORTED_MODELS } from '@/components/ModelSelector';

import {
  createFineTuningJob,
  getDefaultHyperParams,
  getDefaultDatasetConfig,
  estimateTrainingResources,
  DatasetConfig,
  FineTuningHyperParams
} from '@/lib/fineTuningService';

interface NewFineTuningJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onSuccess?: () => void;
}

// Form schema for the job creation
type FormValues = {
  name: string;
  description: string;
  baseModelId: string;
  documentIds: string[];
  datasetType: DatasetConfig['type'];
  advancedOptions: boolean;
  hyperparams: Partial<FineTuningHyperParams>;
  datasetConfig: Partial<DatasetConfig>;
};

export function NewFineTuningJobDialog({ 
  open, 
  onOpenChange, 
  workspaceId,
  onSuccess 
}: NewFineTuningJobDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [selectedModel, setSelectedModel] = useState<HuggingFaceModel | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [estimation, setEstimation] = useState<{ timeHours: number; estimatedCost: number } | null>(null);
  const { toast } = useToast();
  const { listDocuments } = useWorkspace();
  
  // Fine-tunable models (only show open-source models)
  const fineTunableModels = SUPPORTED_MODELS.filter(model => 
    model.category === 'open-source'
  );
  
  // Available documents in workspace
  const documents = listDocuments ? listDocuments(workspaceId) || [] : [];
  
  // Set up form
  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      baseModelId: fineTunableModels[0]?.id || '',
      documentIds: [],
      datasetType: 'instruction',
      advancedOptions: false,
      hyperparams: {},
      datasetConfig: {}
    }
  });
  
  // Extract needed values from form
  const baseModelId = form.watch('baseModelId');
  const datasetType = form.watch('datasetType');
  const hyperparams = form.watch('hyperparams');
  
  // Update selected model when base model changes
  useEffect(() => {
    const model = fineTunableModels.find(m => m.id === baseModelId);
    setSelectedModel(model || null);
  }, [baseModelId, fineTunableModels]);
  
  // Update document IDs in form when selection changes
  useEffect(() => {
    form.setValue('documentIds', selectedDocuments);
  }, [selectedDocuments, form]);
  
  // Update estimation when relevant parameters change
  useEffect(() => {
    if (!baseModelId || selectedDocuments.length === 0) {
      setEstimation(null);
      return;
    }
    
    // Estimate dataset size based on number of documents
    // In a real implementation, this would analyze the actual documents
    const estimatedSamples = selectedDocuments.length * 100;
    
    // Get default hyperparams
    const defaultHyperParams = getDefaultHyperParams(baseModelId);
    
    // Merge with user-selected hyperparams
    const mergedHyperParams = {
      ...defaultHyperParams,
      ...hyperparams
    };
    
    // Calculate estimation
    const est = estimateTrainingResources(
      baseModelId,
      estimatedSamples,
      mergedHyperParams
    );
    
    setEstimation(est);
  }, [baseModelId, selectedDocuments, hyperparams]);
  
  // Handle document selection toggle
  const toggleDocument = (documentId: string) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };
  
  // Handle form submission
  const onSubmit = (values: FormValues) => {
    if (!workspaceId) {
      toast({
        title: "Error",
        description: "No active workspace selected",
        variant: "destructive"
      });
      return;
    }
    
    if (values.documentIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one document for training",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create the fine-tuning job
      createFineTuningJob(
        values.name,
        values.baseModelId,
        workspaceId,
        values.documentIds,
        {
          datasetType: values.datasetType,
          hyperparams: advancedOptions ? values.hyperparams : undefined,
          datasetConfig: advancedOptions ? values.datasetConfig : undefined,
          description: values.description
        }
      );
      
      // Show success message
      toast({
        title: "Fine-Tuning Job Created",
        description: `The fine-tuning job "${values.name}" has been created and queued for processing.`
      });
      
      // Close dialog and reset form
      onOpenChange(false);
      form.reset();
      setSelectedDocuments([]);
      
      // Callback for parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Initialize hyperparams and dataset config when model or type changes
  useEffect(() => {
    if (baseModelId && advancedOptions) {
      // Set default hyperparams for this model
      const defaultHyperParams = getDefaultHyperParams(baseModelId);
      form.setValue('hyperparams', defaultHyperParams);
      
      // Set default dataset config for this type
      const defaultDatasetConfig = getDefaultDatasetConfig(datasetType);
      form.setValue('datasetConfig', defaultDatasetConfig);
    }
  }, [baseModelId, datasetType, advancedOptions, form]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Create New Fine-Tuning Job
          </DialogTitle>
          <DialogDescription>
            Fine-tune a language model on your data to improve its performance on specific tasks.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="px-1">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                  <TabsTrigger value="data">Training Data</TabsTrigger>
                  <TabsTrigger value="advanced" disabled={!advancedOptions}>Advanced</TabsTrigger>
                </TabsList>
              </div>
              
              <ScrollArea className="flex-1 px-1 -mx-1">
                {/* Basic Settings */}
                <TabsContent value="basic" className="pt-4 pb-2 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Job name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="E.g., My Finance Model v1" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A name for your fine-tuning job and the resulting model
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Brief description of this fine-tuned model" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A short description of the purpose or data used
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="baseModelId"
                    rules={{ required: "Base model is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Model</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fineTunableModels.map(model => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The base model to fine-tune (smaller models train faster)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="datasetType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dataset Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a dataset type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="instruction">Instruction (Q&A)</SelectItem>
                            <SelectItem value="chat">Chat Conversations</SelectItem>
                            <SelectItem value="completion">Text Completion</SelectItem>
                            <SelectItem value="classification">Classification</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of data you're using for fine-tuning
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="advancedOptions" 
                        checked={advancedOptions}
                        onCheckedChange={(checked) => {
                          setAdvancedOptions(checked === true);
                          form.setValue('advancedOptions', checked === true);
                          if (checked === true) {
                            setActiveTab('advanced');
                          }
                        }}
                      />
                      <label
                        htmlFor="advancedOptions"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Enable advanced training options
                      </label>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Training Data */}
                <TabsContent value="data" className="pt-4 pb-2 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base">Select Documents</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Choose the documents to use for training your model
                      </p>
                      
                      {documents.length === 0 ? (
                        <Alert>
                          <InfoIcon className="h-4 w-4" />
                          <AlertTitle>No documents available</AlertTitle>
                          <AlertDescription>
                            Upload documents to your workspace to use them for fine-tuning.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="bg-muted/40 rounded-md border p-1 max-h-[300px] overflow-y-auto">
                          <div className="divide-y">
                            {documents.map(doc => (
                              <div 
                                key={doc.id} 
                                className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/60 rounded-sm ${
                                  selectedDocuments.includes(doc.id) ? 'bg-accent/30' : ''
                                }`}
                                onClick={() => toggleDocument(doc.id)}
                              >
                                <div className="flex-shrink-0">
                                  {selectedDocuments.includes(doc.id) ? (
                                    <div className="h-5 w-5 rounded-sm bg-primary flex items-center justify-center">
                                      <Check className="h-4 w-4 text-white" />
                                    </div>
                                  ) : (
                                    <div className="h-5 w-5 rounded-sm border border-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                  <span className="truncate">{doc.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{selectedDocuments.length} document(s) selected</span>
                        <button 
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => setSelectedDocuments([])}
                        >
                          Clear selection
                        </button>
                      </div>
                    </div>
                    
                    {estimation && (
                      <div className="mt-4 p-3 bg-card rounded-md border">
                        <h3 className="text-sm font-medium mb-2">Training Estimation</h3>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Estimated Time:</span>
                              <span className="font-medium ml-2">
                                {estimation.timeHours < 1 
                                  ? `${Math.round(estimation.timeHours * 60)} minutes` 
                                  : `${estimation.timeHours.toFixed(1)} hours`}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Estimated Cost:</span>
                              <span className="font-medium ml-2">${estimation.estimatedCost.toFixed(2)}</span>
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="text-muted-foreground">Training Progress</span>
                              <span className="text-muted-foreground">This is a simulation</span>
                            </div>
                            <div className="h-8 w-full bg-accent/30 rounded-md relative overflow-hidden">
                              <div className="absolute inset-0 flex items-center justify-center text-xs">
                                Estimated training time visualization
                              </div>
                              <div className="absolute left-0 top-0 bottom-0 w-0 bg-gradient-to-r from-primary/20 to-primary/40 animate-progress-simulation" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Advanced Settings */}
                <TabsContent value="advanced" className="pt-4 pb-2 space-y-6">
                  {!advancedOptions && (
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Advanced Options Disabled</AlertTitle>
                      <AlertDescription>
                        Enable advanced options in the Basic Settings tab to configure hyperparameters.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {advancedOptions && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Settings className="h-4 w-4" /> Training Hyperparameters
                        </h3>
                        <div className="space-y-4">
                          {/* Epochs */}
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor="epochs">Training Epochs</Label>
                              <span className="text-sm font-medium">
                                {form.watch('hyperparams.epochs')}
                              </span>
                            </div>
                            <Slider
                              id="epochs"
                              min={1}
                              max={10}
                              step={1}
                              value={[form.watch('hyperparams.epochs') || 3]}
                              onValueChange={(value) => {
                                form.setValue('hyperparams.epochs', value[0], { shouldDirty: true });
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              Number of complete passes through the training dataset
                            </p>
                          </div>
                          
                          {/* Learning Rate */}
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor="learningRate">Learning Rate</Label>
                              <span className="text-sm font-medium">
                                {(form.watch('hyperparams.learningRate') || 0).toExponential(1)}
                              </span>
                            </div>
                            <Slider
                              id="learningRate"
                              min={1e-6}
                              max={5e-5}
                              step={1e-6}
                              value={[form.watch('hyperparams.learningRate') || 2e-5]}
                              onValueChange={(value) => {
                                form.setValue('hyperparams.learningRate', value[0], { shouldDirty: true });
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              Step size for gradient updates during training
                            </p>
                          </div>
                          
                          {/* Batch Size */}
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor="batchSize">Batch Size</Label>
                              <span className="text-sm font-medium">
                                {form.watch('hyperparams.batchSize')}
                              </span>
                            </div>
                            <Slider
                              id="batchSize"
                              min={1}
                              max={16}
                              step={1}
                              value={[form.watch('hyperparams.batchSize') || 4]}
                              onValueChange={(value) => {
                                form.setValue('hyperparams.batchSize', value[0], { shouldDirty: true });
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              Number of samples processed in each training step
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Database className="h-4 w-4" /> Dataset Configuration
                        </h3>
                        <div className="space-y-4">
                          {/* Validation Split */}
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor="validationSplit">Validation Split</Label>
                              <span className="text-sm font-medium">
                                {Math.round((form.watch('datasetConfig.validationSplit') || 0.1) * 100)}%
                              </span>
                            </div>
                            <Slider
                              id="validationSplit"
                              min={0.05}
                              max={0.3}
                              step={0.05}
                              value={[form.watch('datasetConfig.validationSplit') || 0.1]}
                              onValueChange={(value) => {
                                form.setValue('datasetConfig.validationSplit', value[0], { shouldDirty: true });
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              Percentage of data to use for validation
                            </p>
                          </div>
                          
                          {/* Include System Prompt */}
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="includeSystemPrompt" 
                              checked={form.watch('datasetConfig.includeSystemPrompt')}
                              onCheckedChange={(checked) => {
                                form.setValue('datasetConfig.includeSystemPrompt', checked === true, { shouldDirty: true });
                              }}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor="includeSystemPrompt"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Include System Prompt
                              </label>
                              <p className="text-xs text-muted-foreground">
                                Include system instructions in training examples
                              </p>
                            </div>
                          </div>
                          
                          {/* Preprocessing Steps */}
                          <div className="space-y-2">
                            <Label className="text-sm">Preprocessing Steps</Label>
                            <div className="flex flex-wrap gap-2">
                              {['clean', 'deduplicate', 'balance'].map((step) => (
                                <Badge 
                                  key={step}
                                  className={`cursor-pointer ${
                                    (form.watch('datasetConfig.preprocessingSteps') || []).includes(step as any)
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                  onClick={() => {
                                    const steps = form.watch('datasetConfig.preprocessingSteps') || [];
                                    if (steps.includes(step as any)) {
                                      form.setValue(
                                        'datasetConfig.preprocessingSteps',
                                        steps.filter(s => s !== step),
                                        { shouldDirty: true }
                                      );
                                    } else {
                                      form.setValue(
                                        'datasetConfig.preprocessingSteps',
                                        [...steps, step as any],
                                        { shouldDirty: true }
                                      );
                                    }
                                  }}
                                >
                                  {step}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Data preprocessing steps to apply before training
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <BrainCircuit className="h-4 w-4" /> Model Adaptation
                        </h3>
                        <div className="space-y-4">
                          {/* Use PEFT */}
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="usePeft" 
                              checked={form.watch('hyperparams.usePeft')}
                              onCheckedChange={(checked) => {
                                form.setValue('hyperparams.usePeft', checked === true, { shouldDirty: true });
                              }}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor="usePeft"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Use Parameter-Efficient Fine-Tuning (LoRA)
                              </label>
                              <p className="text-xs text-muted-foreground">
                                Uses LoRA adapters for more efficient training with smaller memory footprint
                              </p>
                            </div>
                          </div>
                          
                          {form.watch('hyperparams.usePeft') && (
                            <>
                              {/* LoRA Rank */}
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label htmlFor="loraRank">LoRA Rank</Label>
                                  <span className="text-sm font-medium">
                                    {form.watch('hyperparams.loraRank')}
                                  </span>
                                </div>
                                <Slider
                                  id="loraRank"
                                  min={1}
                                  max={64}
                                  step={1}
                                  value={[form.watch('hyperparams.loraRank') || 8]}
                                  onValueChange={(value) => {
                                    form.setValue('hyperparams.loraRank', value[0], { shouldDirty: true });
                                  }}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Rank for LoRA adapter matrices (higher = more capacity)
                                </p>
                              </div>
                              
                              {/* LoRA Alpha */}
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label htmlFor="loraAlpha">LoRA Alpha</Label>
                                  <span className="text-sm font-medium">
                                    {form.watch('hyperparams.loraAlpha')}
                                  </span>
                                </div>
                                <Slider
                                  id="loraAlpha"
                                  min={1}
                                  max={128}
                                  step={1}
                                  value={[form.watch('hyperparams.loraAlpha') || 32]}
                                  onValueChange={(value) => {
                                    form.setValue('hyperparams.loraAlpha', value[0], { shouldDirty: true });
                                  }}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Alpha parameter for LoRA (scaling factor)
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
            
            <DialogFooter className="flex justify-between items-center border-t pt-4 mt-4">
              <div className="text-sm text-muted-foreground">
                {selectedDocuments.length === 0 ? (
                  "Select documents to train on"
                ) : (
                  `Using ${selectedDocuments.length} document(s) for training`
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={
                    !form.formState.isDirty ||
                    selectedDocuments.length === 0 ||
                    !baseModelId ||
                    !form.watch('name')
                  }
                >
                  Create Fine-Tuning Job
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}