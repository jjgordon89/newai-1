import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowRight, Bot, Github, RotateCw, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EmbeddingModelSelector from './EmbeddingModelSelector';
import { configureRagFromPreferences } from '@/lib/ragIntegration';

interface HuggingFaceRagSettingsProps {
  defaultModelId?: string;
  defaultUseHuggingFace?: boolean;
  onConfigure?: (settings: {
    embeddingModel: string;
    useHuggingFaceEmbeddings: boolean;
  }) => void;
}

export default function HuggingFaceRagSettings({
  defaultModelId = "BAAI/bge-small-en-v1.5",
  defaultUseHuggingFace = true,
  onConfigure
}: HuggingFaceRagSettingsProps) {
  const { toast } = useToast();
  const [selectedModelId, setSelectedModelId] = useState<string>(defaultModelId);
  const [useHuggingFaceEmbeddings, setUseHuggingFaceEmbeddings] = useState<boolean>(defaultUseHuggingFace);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleModelChange = (modelId: string, useHuggingFace: boolean) => {
    setSelectedModelId(modelId);
    setUseHuggingFaceEmbeddings(useHuggingFace);
  };

  const handleConfigure = async () => {
    setIsLoading(true);
    
    try {
      // Initialize RAG system with HuggingFace embeddings
      const settings = {
        embeddingModel: selectedModelId,
        useHuggingFaceEmbeddings: useHuggingFaceEmbeddings,
        // Set some reasonable defaults for other RAG settings
        chunkingStrategy: "hybrid",
        retrieverStrategy: "hybrid",
        chunkSize: 1024,
        chunkOverlap: 200,
        topK: 3,
        similarityThreshold: 70,
        useQueryExpansion: true,
        useReranking: true,
        includeMetadata: true,
        rerankerModel: "reciprocal-rank-fusion",
      };
      
      // Configure the RAG system 
      const ragService = configureRagFromPreferences(settings);
      
      // Call the callback if provided
      if (onConfigure) {
        onConfigure({
          embeddingModel: selectedModelId,
          useHuggingFaceEmbeddings
        });
      }
      
      toast({
        title: "RAG System Configured",
        description: `Now using ${useHuggingFaceEmbeddings ? selectedModelId : 'default'} for embeddings`,
      });
    } catch (error) {
      console.error('Error configuring RAG system:', error);
      toast({
        title: "Configuration Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Hugging Face Embeddings
          </span>
          <a 
            href="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=downloads" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Github className="h-4 w-4" />
            Browse Models
          </a>
        </CardTitle>
        <CardDescription>
          Enhance your RAG system with high-quality embeddings from Hugging Face models
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div>
            <Label htmlFor="use-huggingface-main" className="text-base font-medium">Use Hugging Face Embeddings</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Replace the default embedding system with state-of-the-art models from Hugging Face
            </p>
          </div>
          <Switch
            id="use-huggingface-main"
            checked={useHuggingFaceEmbeddings}
            onCheckedChange={setUseHuggingFaceEmbeddings}
          />
        </div>
        
        <Separator />
        
        <EmbeddingModelSelector
          defaultModelId={selectedModelId}
          defaultUseHuggingFace={useHuggingFaceEmbeddings}
          onChange={handleModelChange}
        />
        
        <div className="bg-muted/40 rounded-lg p-4 border">
          <h3 className="text-sm font-medium mb-2">Why use Hugging Face embeddings?</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>Access to specialized domain models (legal, medical, multilingual)</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>Higher semantic understanding with state-of-the-art models</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>Improved search accuracy and relevance for your specific use case</span>
            </li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedModelId("BAAI/bge-small-en-v1.5");
            setUseHuggingFaceEmbeddings(true);
          }}
          disabled={isLoading}
          className="gap-1.5"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Reset
        </Button>
        
        <Button
          onClick={handleConfigure}
          disabled={isLoading}
          className="gap-1.5"
        >
          <Bot className="h-4 w-4" />
          {isLoading ? "Configuring..." : "Apply Configuration"}
        </Button>
      </CardFooter>
    </Card>
  );
}