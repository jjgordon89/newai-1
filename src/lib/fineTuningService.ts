import { HuggingFaceModel } from './api';
import { Document } from './api';

// Fine-tuning job status
export type FineTuningStatus = 
  | 'queued'       // Job is queued for processing
  | 'preparing'    // Data is being prepared for training
  | 'running'      // Model is being trained
  | 'succeeded'    // Training completed successfully
  | 'failed'       // Training failed
  | 'cancelled'    // Training was cancelled by the user
  | 'stopping';    // Training is being stopped

// Fine-tuning hyperparameters
export interface FineTuningHyperParams {
  epochs: number;           // Number of training epochs
  learningRate: number;     // Learning rate for training
  batchSize: number;        // Batch size for training
  warmupSteps: number;      // Warmup steps for learning rate scheduler
  weightDecay: number;      // Weight decay for optimizer
  maxSequenceLength: number; // Maximum sequence length for tokenizer
  evaluationStrategy: 'no' | 'steps' | 'epoch'; // When to evaluate
  saveSteps: number;        // Steps interval for saving checkpoints
  loraRank?: number;        // Rank for LoRA adapters (if using PEFT)
  loraAlpha?: number;       // Alpha for LoRA adapters (if using PEFT)
  usePeft: boolean;         // Whether to use PEFT (Parameter-Efficient Fine-Tuning)
}

// Dataset format/preparation options
export interface DatasetConfig {
  type: 'instruction' | 'chat' | 'completion' | 'classification';
  promptTemplate: string;
  includeSystemPrompt: boolean;
  validationSplit: number;  // Percentage of data to use for validation (0-1)
  preprocessingSteps: Array<'clean' | 'deduplicate' | 'balance'>;
}

// Fine-tuning job
export interface FineTuningJob {
  id: string;
  name: string;
  description?: string;
  baseModelId: string;
  workspaceId: string;
  status: FineTuningStatus;
  progress: number;          // Progress from 0-100
  hyperparams: FineTuningHyperParams;
  dataset: {
    name: string;
    documentIds: string[];   // IDs of documents used for training
    config: DatasetConfig;   // Dataset configuration
    samples: number;         // Number of samples in the dataset
  };
  createdAt: Date;
  updatedAt: Date;
  finishedAt?: Date;
  errorMessage?: string;
  metrics?: {
    trainingLoss?: number;
    validationLoss?: number;
    accuracy?: number;
    perplexity?: number;
  };
  // The fine-tuned model (available when status is 'succeeded')
  fineTunedModel?: FineTunedModel;
}

// Fine-tuned model
export interface FineTunedModel {
  id: string;
  name: string;
  description?: string;
  baseModelId: string;       // ID of base model used for fine-tuning
  workspaceId: string;       // Workspace the model belongs to
  jobId: string;             // ID of the fine-tuning job that created this model
  createdAt: Date;
  size: number;              // Size of model in MB
  metrics?: {                // Performance metrics
    accuracy?: number;
    perplexity?: number;
  };
  // Included to match HuggingFaceModel interface structure
  task?: string;
}

// Default hyperparameters for different model sizes
const DEFAULT_HYPERPARAMS: Record<'small' | 'medium' | 'large', FineTuningHyperParams> = {
  small: {
    epochs: 3,
    learningRate: 2e-5,
    batchSize: 8,
    warmupSteps: 50,
    weightDecay: 0.01,
    maxSequenceLength: 512,
    evaluationStrategy: 'steps',
    saveSteps: 500,
    loraRank: 8,
    loraAlpha: 32,
    usePeft: true
  },
  medium: {
    epochs: 3,
    learningRate: 1e-5,
    batchSize: 4,
    warmupSteps: 100,
    weightDecay: 0.01,
    maxSequenceLength: 1024,
    evaluationStrategy: 'steps',
    saveSteps: 500,
    loraRank: 16,
    loraAlpha: 32,
    usePeft: true
  },
  large: {
    epochs: 2,
    learningRate: 5e-6,
    batchSize: 2,
    warmupSteps: 200,
    weightDecay: 0.01,
    maxSequenceLength: 2048,
    evaluationStrategy: 'steps',
    saveSteps: 500,
    loraRank: 32,
    loraAlpha: 64,
    usePeft: true
  }
};

// Default dataset configurations for different task types
const DEFAULT_DATASET_CONFIG: Record<DatasetConfig['type'], Omit<DatasetConfig, 'type'>> = {
  instruction: {
    promptTemplate: "### Instruction:\n{instruction}\n\n### Response:\n{response}",
    includeSystemPrompt: true,
    validationSplit: 0.1,
    preprocessingSteps: ['clean', 'deduplicate']
  },
  chat: {
    promptTemplate: "<s>[INST] {instruction} [/INST] {response}</s>",
    includeSystemPrompt: true,
    validationSplit: 0.1,
    preprocessingSteps: ['clean', 'deduplicate']
  },
  completion: {
    promptTemplate: "{context}\n{completion}",
    includeSystemPrompt: false,
    validationSplit: 0.1,
    preprocessingSteps: ['clean']
  },
  classification: {
    promptTemplate: "{text}\nLabel: {label}",
    includeSystemPrompt: false,
    validationSplit: 0.2,
    preprocessingSteps: ['clean', 'balance']
  }
};

// Mock storage for fine-tuning jobs and models (in a real app, this would be in a database)
let fineTuningJobs: FineTuningJob[] = [];
let fineTunedModels: FineTunedModel[] = [];

// Load from localStorage if available
const loadFromStorage = () => {
  try {
    const savedJobs = localStorage.getItem('fineTuningJobs');
    const savedModels = localStorage.getItem('fineTunedModels');
    
    if (savedJobs) {
      fineTuningJobs = JSON.parse(savedJobs).map((job: any) => ({
        ...job,
        createdAt: new Date(job.createdAt),
        updatedAt: new Date(job.updatedAt),
        finishedAt: job.finishedAt ? new Date(job.finishedAt) : undefined
      }));
    }
    
    if (savedModels) {
      fineTunedModels = JSON.parse(savedModels).map((model: any) => ({
        ...model,
        createdAt: new Date(model.createdAt)
      }));
    }
  } catch (error) {
    console.error('Error loading fine-tuning data from storage:', error);
    // Initialize with empty arrays if there's an error
    fineTuningJobs = [];
    fineTunedModels = [];
  }
};

// Save to localStorage
const saveToStorage = () => {
  localStorage.setItem('fineTuningJobs', JSON.stringify(fineTuningJobs));
  localStorage.setItem('fineTunedModels', JSON.stringify(fineTunedModels));
};

// Initialize data from storage
loadFromStorage();

// Get appropriate default hyperparameters based on model ID
export const getDefaultHyperParams = (modelId: string): FineTuningHyperParams => {
  // Determine model size based on model ID
  let size: 'small' | 'medium' | 'large' = 'medium';
  
  if (modelId.includes('7b') || modelId.includes('7B') || modelId.includes('small')) {
    size = 'medium';
  } else if (modelId.includes('13b') || modelId.includes('13B') || modelId.includes('large')) {
    size = 'large';
  } else if (modelId.includes('3b') || modelId.includes('3B') || modelId.includes('tiny') || 
             modelId.includes('phi-2') || modelId.includes('phi2')) {
    size = 'small';
  }
  
  return { ...DEFAULT_HYPERPARAMS[size] };
};

// Get default dataset configuration for a given task type
export const getDefaultDatasetConfig = (type: DatasetConfig['type']): DatasetConfig => {
  return { type, ...DEFAULT_DATASET_CONFIG[type] };
};

// Estimate training time and cost based on model and dataset size
export const estimateTrainingResources = (
  baseModelId: string,
  sampleCount: number,
  hyperparams: FineTuningHyperParams
): { timeHours: number; estimatedCost: number } => {
  // These are simplified estimates - in a real application, 
  // more sophisticated calculations would be used
  
  // Base time per sample (in seconds)
  let timePerSample = 0.01;
  
  // Adjust based on model size
  if (baseModelId.includes('7b') || baseModelId.includes('7B')) {
    timePerSample = 0.05;
  } else if (baseModelId.includes('13b') || baseModelId.includes('13B')) {
    timePerSample = 0.1;
  }
  
  // Adjust based on sequence length
  const seqLenFactor = hyperparams.maxSequenceLength / 512;
  timePerSample *= seqLenFactor;
  
  // Calculate total time
  const totalTimeSeconds = sampleCount * hyperparams.epochs * timePerSample;
  const timeHours = totalTimeSeconds / 3600;
  
  // Calculate estimated cost ($0.50 per hour for small models, $2.00 for large)
  let hourlyRate = 0.5;
  if (baseModelId.includes('13b') || baseModelId.includes('13B')) {
    hourlyRate = 2.0;
  }
  
  const estimatedCost = timeHours * hourlyRate;
  
  return {
    timeHours,
    estimatedCost
  };
};

// Create a new fine-tuning job
export const createFineTuningJob = (
  name: string,
  baseModelId: string,
  workspaceId: string,
  documentIds: string[],
  config: {
    datasetType: DatasetConfig['type'],
    hyperparams?: Partial<FineTuningHyperParams>,
    datasetConfig?: Partial<DatasetConfig>,
    description?: string
  }
): FineTuningJob => {
  const jobId = `ft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  // Get default hyperparameters for this model
  const defaultHyperParams = getDefaultHyperParams(baseModelId);
  
  // Merge with provided hyperparameters
  const hyperparams: FineTuningHyperParams = {
    ...defaultHyperParams,
    ...config.hyperparams
  };
  
  // Get default dataset configuration
  const defaultDatasetConfig = getDefaultDatasetConfig(config.datasetType);
  
  // Merge with provided dataset configuration
  const datasetConfig: DatasetConfig = {
    ...defaultDatasetConfig,
    ...config.datasetConfig,
    type: config.datasetType
  };
  
  // Create the job
  const job: FineTuningJob = {
    id: jobId,
    name,
    description: config.description,
    baseModelId,
    workspaceId,
    status: 'queued',
    progress: 0,
    hyperparams,
    dataset: {
      name: `${name}-dataset`,
      documentIds,
      config: datasetConfig,
      samples: 0  // This will be updated during the preprocessing phase
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Add to the list of jobs
  fineTuningJobs.push(job);
  saveToStorage();
  
  // Start the job simulation
  simulateJobProgress(jobId);
  
  return job;
};

// Get a fine-tuning job by ID
export const getFineTuningJob = (jobId: string): FineTuningJob | undefined => {
  return fineTuningJobs.find(job => job.id === jobId);
};

// Get all fine-tuning jobs for a workspace
export const getWorkspaceFineTuningJobs = (workspaceId: string): FineTuningJob[] => {
  return fineTuningJobs.filter(job => job.workspaceId === workspaceId);
};

// Cancel a fine-tuning job
export const cancelFineTuningJob = (jobId: string): boolean => {
  const jobIndex = fineTuningJobs.findIndex(job => job.id === jobId);
  if (jobIndex === -1) return false;
  
  const job = fineTuningJobs[jobIndex];
  
  // Only jobs in certain states can be cancelled
  if (['queued', 'preparing', 'running'].includes(job.status)) {
    fineTuningJobs[jobIndex] = {
      ...job,
      status: 'cancelled',
      updatedAt: new Date(),
      finishedAt: new Date()
    };
    saveToStorage();
    return true;
  }
  
  return false;
};

// Delete a fine-tuning job (only for completed, failed, or cancelled jobs)
export const deleteFineTuningJob = (jobId: string): boolean => {
  const jobIndex = fineTuningJobs.findIndex(job => job.id === jobId);
  if (jobIndex === -1) return false;
  
  const job = fineTuningJobs[jobIndex];
  
  // Only jobs in certain states can be deleted
  if (['succeeded', 'failed', 'cancelled'].includes(job.status)) {
    fineTuningJobs.splice(jobIndex, 1);
    saveToStorage();
    return true;
  }
  
  return false;
};

// Get a fine-tuned model by ID
export const getFineTunedModel = (modelId: string): FineTunedModel | undefined => {
  return fineTunedModels.find(model => model.id === modelId);
};

// Get all fine-tuned models for a workspace
export const getWorkspaceFineTunedModels = (workspaceId: string): FineTunedModel[] => {
  return fineTunedModels.filter(model => model.workspaceId === workspaceId);
};

// Delete a fine-tuned model
export const deleteFineTunedModel = (modelId: string): boolean => {
  const modelIndex = fineTunedModels.findIndex(model => model.id === modelId);
  if (modelIndex === -1) return false;
  
  fineTunedModels.splice(modelIndex, 1);
  saveToStorage();
  return true;
};

// Convert a fine-tuned model to the format used by the model selector
export const convertToHuggingFaceModel = (model: FineTunedModel): HuggingFaceModel => {
  return {
    id: model.id,
    name: model.name,
    description: model.description || `Fine-tuned version of ${model.baseModelId}`,
    task: 'text-generation',
    // Add custom properties to indicate this is a fine-tuned model
    baseModelId: model.baseModelId,
    isFineTuned: true
  } as HuggingFaceModel & { isFineTuned: true; baseModelId: string };
};

// Simulate job progress (for demonstration purposes - in a real app, this would be handled by a backend)
const simulateJobProgress = (jobId: string) => {
  const updateInterval = setInterval(() => {
    // Find the job
    const jobIndex = fineTuningJobs.findIndex(job => job.id === jobId);
    if (jobIndex === -1) {
      clearInterval(updateInterval);
      return;
    }
    
    const job = fineTuningJobs[jobIndex];
    
    // If job is already completed or cancelled, stop the simulation
    if (['succeeded', 'failed', 'cancelled', 'stopping'].includes(job.status)) {
      clearInterval(updateInterval);
      return;
    }
    
    // Update job based on current status
    switch (job.status) {
      case 'queued':
        // Move to preparing after a brief delay
        fineTuningJobs[jobIndex] = {
          ...job,
          status: 'preparing',
          progress: 5,
          updatedAt: new Date(),
          // Set the sample count during preparation
          dataset: {
            ...job.dataset,
            samples: Math.floor(Math.random() * 5000) + 1000
          }
        };
        break;
        
      case 'preparing':
        // Move to running after preparation is complete
        if (job.progress >= 20) {
          fineTuningJobs[jobIndex] = {
            ...job,
            status: 'running',
            progress: 20,
            updatedAt: new Date()
          };
        } else {
          fineTuningJobs[jobIndex] = {
            ...job,
            progress: job.progress + 5,
            updatedAt: new Date()
          };
        }
        break;
        
      case 'running':
        // Update progress during training
        if (job.progress >= 99) {
          // Simulation: 90% success rate
          const success = Math.random() < 0.9;
          
          if (success) {
            // Create the fine-tuned model
            const ftModelId = `ft-model-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            
            const metrics = {
              trainingLoss: Math.random() * 0.5 + 0.1,
              validationLoss: Math.random() * 0.7 + 0.2,
              accuracy: Math.random() * 0.3 + 0.7,
              perplexity: Math.random() * 10 + 5
            };
            
            const fineTunedModel: FineTunedModel = {
              id: ftModelId,
              name: job.name,
              description: job.description,
              baseModelId: job.baseModelId,
              workspaceId: job.workspaceId,
              jobId: job.id,
              createdAt: new Date(),
              size: Math.floor(Math.random() * 500) + 100, // Size in MB
              metrics: {
                accuracy: metrics.accuracy,
                perplexity: metrics.perplexity
              }
            };
            
            // Add the model to the list
            fineTunedModels.push(fineTunedModel);
            
            // Update the job
            fineTuningJobs[jobIndex] = {
              ...job,
              status: 'succeeded',
              progress: 100,
              updatedAt: new Date(),
              finishedAt: new Date(),
              metrics,
              fineTunedModel
            };
          } else {
            // Failed job
            fineTuningJobs[jobIndex] = {
              ...job,
              status: 'failed',
              progress: job.progress,
              updatedAt: new Date(),
              finishedAt: new Date(),
              errorMessage: 'Training failed due to convergence issues. Try adjusting hyperparameters.'
            };
          }
        } else {
          // Increment progress
          const increment = Math.random() * 2 + 1; // 1-3% progress per update
          fineTuningJobs[jobIndex] = {
            ...job,
            progress: Math.min(99, job.progress + increment),
            updatedAt: new Date()
          };
        }
        break;
        
      default:
        clearInterval(updateInterval);
        return;
    }
    
    saveToStorage();
  }, 3000); // Update every 3 seconds
};

// Check if the service has been initialized
export const isFineTuningServiceInitialized = (): boolean => {
  return true; // For our simulation, it's always initialized
};