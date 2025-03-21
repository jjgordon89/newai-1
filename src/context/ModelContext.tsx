import React, { createContext, useState, useContext, useEffect } from 'react';
import { modelService, ModelInfo } from '@/lib/modelService';
import { useUserPreferences } from './UserPreferencesContext';

interface ModelContextType {
  selectedModel: ModelInfo | null;
  availableModels: ModelInfo[];
  setSelectedModel: (modelId: string) => void;
  isModelAccessible: (modelId: string) => boolean;
  getFilteredModels: (type?: string, onlyAccessible?: boolean) => ModelInfo[];
  estimateTokenUsage: (text: string) => number;
  estimateCost: (promptTokens: number, completionTokens: number) => number | null;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences } = useUserPreferences();
  const [selectedModelId, setSelectedModelId] = useState<string>('gpt-4');
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModelState] = useState<ModelInfo | null>(null);

  // Initialize models
  useEffect(() => {
    const models = modelService.getAllModels();
    setAvailableModels(models);
    
    // Try to load the saved model from preferences
    const preferredModelId = preferences.defaultModelId || 'gpt-4';
    const model = models.find(m => m.id === preferredModelId) || models[0];
    
    if (model) {
      setSelectedModelId(model.id);
      setSelectedModelState(model);
    }
  }, [preferences.defaultModelId]);

  // Update selected model when ID changes
  useEffect(() => {
    const model = availableModels.find(m => m.id === selectedModelId);
    if (model) {
      setSelectedModelState(model);
    }
  }, [selectedModelId, availableModels]);

  // Check if a model is accessible (has required API keys if premium)
  const isModelAccessible = (modelId: string): boolean => {
    const model = availableModels.find(m => m.id === modelId);
    if (!model) return false;
    
    // If not premium, it's accessible
    if (!model.isPremium) return true;
    
    // Check for required API keys
    if (model.provider === 'OpenAI' && preferences.apiKeys.openai) return true;
    if (model.provider === 'Anthropic' && preferences.apiKeys.anthropic) return true;
    if (model.provider === 'HuggingFace' && preferences.apiKeys.huggingface) return true;
    
    return false;
  };

  // Get filtered models based on criteria
  const getFilteredModels = (type?: string, onlyAccessible = false): ModelInfo[] => {
    return availableModels.filter(model => {
      const typeMatches = type ? model.type === type : true;
      const isAccessible = onlyAccessible ? isModelAccessible(model.id) : true;
      return typeMatches && isAccessible;
    });
  };

  // Estimate token usage for a given text
  const estimateTokenUsage = (text: string): number => {
    // This is a very rough estimate: ~4 chars per token for English
    return Math.ceil(text.length / 4);
  };

  // Estimate cost for a given token usage
  const estimateCost = (promptTokens: number, completionTokens: number): number | null => {
    if (!selectedModel) return null;
    return modelService.calculateCost(selectedModel.id, promptTokens, completionTokens);
  };

  // Function to set the selected model
  const setSelectedModel = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  return (
    <ModelContext.Provider
      value={{
        selectedModel,
        availableModels,
        setSelectedModel,
        isModelAccessible,
        getFilteredModels,
        estimateTokenUsage,
        estimateCost
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = (): ModelContextType => {
  const context = useContext(ModelContext);
  
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  
  return context;
};