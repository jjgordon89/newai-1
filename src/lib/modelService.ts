import { Models } from '@/types/models';

// Define model-related types
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextLength: number;
  isAvailable: boolean;
  isPremium: boolean;
  type: 'text' | 'vision' | 'voice' | 'multimodal';
  costPerToken?: number;
}

// Sample model data
export const availableModels: ModelInfo[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'OpenAI\'s most advanced model, capable of complex reasoning and detailed instructions',
    contextLength: 8192,
    isAvailable: true,
    isPremium: true,
    type: 'text',
    costPerToken: 0.00003
  },
  {
    id: 'gpt-4-vision',
    name: 'GPT-4 Vision',
    provider: 'OpenAI',
    description: 'GPT-4 with vision capabilities, can analyze images and provide detailed descriptions',
    contextLength: 8192,
    isAvailable: true,
    isPremium: true,
    type: 'vision',
    costPerToken: 0.00004
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Efficient model balancing capabilities and speed, good for most tasks',
    contextLength: 4096,
    isAvailable: true,
    isPremium: false,
    type: 'text',
    costPerToken: 0.000005
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Anthropic\'s most capable model, with strong reasoning and instruction following',
    contextLength: 100000,
    isAvailable: true,
    isPremium: true,
    type: 'multimodal',
    costPerToken: 0.00005
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced model for most tasks, good performance with reasonable speed',
    contextLength: 100000,
    isAvailable: true,
    isPremium: false,
    type: 'multimodal',
    costPerToken: 0.00001
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fast, efficient AI assistant for routine tasks and conversational needs',
    contextLength: 100000,
    isAvailable: true,
    isPremium: false,
    type: 'multimodal',
    costPerToken: 0.000005
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 (70B)',
    provider: 'Meta',
    description: 'Open model with strong capabilities, can run locally with sufficient hardware',
    contextLength: 8192,
    isAvailable: true,
    isPremium: false,
    type: 'text'
  },
  {
    id: 'falcon-180b',
    name: 'Falcon-180B',
    provider: 'TII',
    description: 'Technology Innovation Institute\'s large-scale language model',
    contextLength: 2048,
    isAvailable: true,
    isPremium: false,
    type: 'text'
  }
];

export const embeddingModels = [
  { id: 'text-embedding-3-small', name: 'text-embedding-3-small', provider: 'OpenAI', dimensions: 1536 },
  { id: 'text-embedding-3-large', name: 'text-embedding-3-large', provider: 'OpenAI', dimensions: 3072 },
  { id: 'bge-small', name: 'BGE Small', provider: 'HuggingFace', dimensions: 384 },
  { id: 'bge-large', name: 'BGE Large', provider: 'HuggingFace', dimensions: 1024 }
];

// Service functions for models
export const modelService = {
  getAllModels: (): ModelInfo[] => {
    return availableModels;
  },
  
  getModelById: (id: string): ModelInfo | undefined => {
    return availableModels.find(model => model.id === id);
  },
  
  getModelsByProvider: (provider: string): ModelInfo[] => {
    return availableModels.filter(model => model.provider === provider);
  },
  
  getModelsByType: (type: 'text' | 'vision' | 'voice' | 'multimodal'): ModelInfo[] => {
    return availableModels.filter(model => model.type === type);
  },
  
  getNonPremiumModels: (): ModelInfo[] => {
    return availableModels.filter(model => !model.isPremium);
  },

  // Calculate cost for token usage - helpful for showing cost estimates
  calculateCost: (modelId: string, promptTokens: number, completionTokens: number): number | null => {
    const model = availableModels.find(m => m.id === modelId);
    if (!model || !model.costPerToken) return null;
    
    return (promptTokens + completionTokens) * model.costPerToken;
  },
  
  // Get recommended model based on task description
  getRecommendedModel: (task: string, needsVision: boolean, prefersFree: boolean): ModelInfo => {
    if (needsVision) {
      return availableModels.find(m => m.type === 'vision' && (!prefersFree || !m.isPremium)) || availableModels[1];
    }
    
    if (prefersFree) {
      return availableModels.find(m => !m.isPremium) || availableModels[2];
    }
    
    // Default to GPT-4 for complex tasks
    if (task.includes('complex') || task.includes('reasoning') || task.includes('analysis')) {
      return availableModels[0];
    }
    
    // Use Claude for very long context
    if (task.includes('document') || task.includes('long text') || task.includes('book')) {
      return availableModels[3];
    }
    
    return availableModels[2]; // Default to GPT-3.5-Turbo for most tasks
  }
};