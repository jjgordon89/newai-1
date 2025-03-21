import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { InfoIcon, Brain, Zap } from 'lucide-react';

// Define and export the list of models for reuse
export const EMBEDDING_MODELS = [
  {
    id: "BAAI/bge-small-en-v1.5",
    name: "BGE Small",
    dimensions: 384,
    language: "English",
    description: "Fast and efficient embedding model, good balance of speed and quality",
    category: "general"
  },
  {
    id: "BAAI/bge-base-en-v1.5",
    name: "BGE Base",
    dimensions: 768,
    language: "English",
    description: "Standard embedding model with good performance across various tasks",
    category: "general"
  },
  {
    id: "BAAI/bge-large-en-v1.5",
    name: "BGE Large",
    dimensions: 1024,
    language: "English",
    description: "High-quality embedding model for maximum accuracy, larger context window",
    category: "general"
  },
  {
    id: "sentence-transformers/all-MiniLM-L6-v2",
    name: "MiniLM",
    dimensions: 384,
    language: "English",
    description: "Very efficient model, good for resource-constrained environments",
    category: "general"
  },
  {
    id: "sentence-transformers/all-mpnet-base-v2",
    name: "MPNet",
    dimensions: 768,
    language: "English",
    description: "Strong general purpose embeddings with good semantic understanding",
    category: "general"
  },
  {
    id: "thenlper/gte-large",
    name: "GTE Large",
    dimensions: 1024,
    language: "Multilingual",
    description: "General Text Embeddings model with strong performance across languages",
    category: "multilingual"
  },
  {
    id: "intfloat/e5-large-v2",
    name: "E5 Large",
    dimensions: 1024,
    language: "English",
    description: "Optimized for retrieval tasks with excellent performance",
    category: "specialized"
  },
  {
    id: "jinaai/jina-embeddings-v2-base-en",
    name: "Jina Base",
    dimensions: 768,
    language: "English",
    description: "Efficient embeddings with strong performance on retrieval tasks",
    category: "specialized"
  }
];

interface EmbeddingModelSelectorProps {
  defaultModelId?: string;
  defaultUseHuggingFace?: boolean;
  onChange?: (modelId: string, useHuggingFace: boolean) => void;
}

export default function EmbeddingModelSelector({ 
  defaultModelId = "BAAI/bge-small-en-v1.5",
  defaultUseHuggingFace = true,
  onChange
}: EmbeddingModelSelectorProps) {
  const [selectedModelId, setSelectedModelId] = useState<string>(defaultModelId);
  const [useHuggingFace, setUseHuggingFace] = useState<boolean>(defaultUseHuggingFace);
  
  // Find the selected model object
  const selectedModel = EMBEDDING_MODELS.find(model => model.id === selectedModelId) || EMBEDDING_MODELS[0];
  
  // Call the onChange callback whenever relevant state changes
  useEffect(() => {
    if (onChange) {
      onChange(selectedModelId, useHuggingFace);
    }
  }, [selectedModelId, useHuggingFace, onChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Embedding Source</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p className="text-xs">
                  Choose between the default embedding system or Hugging Face's state-of-the-art models
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <RadioGroup 
          defaultValue={useHuggingFace ? "huggingface" : "default"}
          onValueChange={(value) => setUseHuggingFace(value === "huggingface")}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="huggingface" id="huggingface" />
            <Label htmlFor="huggingface" className="flex items-center cursor-pointer">
              <Zap className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Hugging Face Models
              <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 text-[10px]">
                Recommended
              </Badge>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default" id="default" />
            <Label htmlFor="default" className="flex items-center cursor-pointer">
              <Brain className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              Default Embeddings
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {useHuggingFace && (
        <div className="space-y-2">
          <Label>Hugging Face Model</Label>
          <Select 
            value={selectedModelId}
            onValueChange={setSelectedModelId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an embedding model" />
            </SelectTrigger>
            <SelectContent>
              <div className="mb-1 px-2">
                <Badge variant="outline" className="text-xs font-normal">
                  General Purpose
                </Badge>
              </div>
              {EMBEDDING_MODELS.filter(m => m.category === "general").map(model => (
                <SelectItem key={model.id} value={model.id} className="flex items-center justify-between">
                  <div>
                    {model.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({model.dimensions}d)
                    </span>
                  </div>
                </SelectItem>
              ))}
              
              <div className="my-1 px-2">
                <Badge variant="outline" className="text-xs font-normal">
                  Multilingual
                </Badge>
              </div>
              {EMBEDDING_MODELS.filter(m => m.category === "multilingual").map(model => (
                <SelectItem key={model.id} value={model.id} className="flex items-center justify-between">
                  <div>
                    {model.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({model.dimensions}d)
                    </span>
                  </div>
                </SelectItem>
              ))}
              
              <div className="my-1 px-2">
                <Badge variant="outline" className="text-xs font-normal">
                  Specialized
                </Badge>
              </div>
              {EMBEDDING_MODELS.filter(m => m.category === "specialized").map(model => (
                <SelectItem key={model.id} value={model.id} className="flex items-center justify-between">
                  <div>
                    {model.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({model.dimensions}d)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Show selected model details */}
          {selectedModel && (
            <div className="text-xs text-muted-foreground mt-1.5 flex gap-2 items-center">
              <Badge 
                variant="outline" 
                className="bg-primary/5 text-[10px]"
              >
                {selectedModel.dimensions}d
              </Badge>
              <span>{selectedModel.description}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}