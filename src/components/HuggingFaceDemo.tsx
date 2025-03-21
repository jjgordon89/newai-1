import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Bot, BrainCircuit, Github, RotateCw, Sparkles, Zap } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

import { configureRagFromPreferences } from '@/lib/ragIntegration';
import { EMBEDDING_MODELS } from '@/lib/api';
import HuggingFaceRagSettings from './HuggingFaceRagSettings';
import EmbeddingModelSelector from './EmbeddingModelSelector';

export default function HuggingFaceDemo() {
  const [activeTab, setActiveTab] = useState<string>("embeddings");
  const [embeddingModel, setEmbeddingModel] = useState(EMBEDDING_MODELS[0].id);
  const [useHuggingFace, setUseHuggingFace] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleModelChange = (modelId: string, useHuggingFaceEmb: boolean) => {
    setEmbeddingModel(modelId);
    setUseHuggingFace(useHuggingFaceEmb);
  };

  const handleConfigure = () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => {
        const newProgress = p + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 300);
    
    // Configure the RAG system with Hugging Face embeddings
    setTimeout(() => {
      try {
        // Initialize with the selected settings
        configureRagFromPreferences({
          embeddingModel,
          useHuggingFaceEmbeddings: useHuggingFace,
          // Default settings for other options
          chunkingStrategy: "hybrid",
          retrieverStrategy: "hybrid",
          topK: 3,
          similarityThreshold: 70,
          reranker: "reciprocal-rank-fusion"
        });
        
        toast({
          title: "RAG System Configured",
          description: `Successfully integrated Hugging Face embeddings with model: ${embeddingModel}`,
        });
      } catch (error) {
        toast({
          title: "Configuration Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        clearInterval(interval);
        setProgress(100);
      }
    }, 3000);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            Hugging Face Embeddings Integration
          </h1>
          <p className="text-muted-foreground mt-1">
            Enhance your RAG system with state-of-the-art embedding models from Hugging Face
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            asChild
          >
            <a href="https://huggingface.co/models?pipeline_tag=feature-extraction" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              Browse Models
            </a>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="embeddings" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="embeddings" className="flex items-center gap-1.5">
                <BrainCircuit className="h-4 w-4" />
                Embeddings
              </TabsTrigger>
              <TabsTrigger value="demo" className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Demo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="embeddings" className="space-y-4 py-4">
              <HuggingFaceRagSettings
                defaultModelId={embeddingModel}
                defaultUseHuggingFace={useHuggingFace}
                onConfigure={handleConfigure}
              />
            </TabsContent>
            
            <TabsContent value="demo" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Embedding Demo
                  </CardTitle>
                  <CardDescription>
                    See how different models perform on text similarity and retrieval tasks
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {isProcessing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Processing documents with HF embeddings</span>
                        <span className="text-sm font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Initializing model, generating embeddings, and configuring vector store...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-sm">
                          Current embedding model: <span className="font-medium">{EMBEDDING_MODELS.find(m => m.id === embeddingModel)?.name}</span>
                        </p>
                        <p className="text-sm">
                          Dimensions: <span className="font-medium">{EMBEDDING_MODELS.find(m => m.id === embeddingModel)?.dimensions}</span>
                        </p>
                        <p className="text-sm">
                          Using Hugging Face: <span className="font-medium">{useHuggingFace ? "Yes" : "No"}</span>
                        </p>
                      </div>
                      
                      <div className="border rounded-md p-4 bg-muted/30">
                        <h3 className="text-sm font-medium mb-2">Example Queries</h3>
                        <div className="space-y-1.5">
                          <div className="text-xs flex items-start gap-2">
                            <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary" />
                            <span>"How does vector similarity work in RAG systems?"</span>
                          </div>
                          <div className="text-xs flex items-start gap-2">
                            <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary" />
                            <span>"What are the advantages of using Hugging Face models?"</span>
                          </div>
                          <div className="text-xs flex items-start gap-2">
                            <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary" />
                            <span>"Explain the difference between BGE and MiniLM embedding models"</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={handleConfigure} 
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <Bot className="h-4 w-4" />
                    {isProcessing ? "Processing..." : "Try It Out"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Selection</CardTitle>
              <CardDescription>Choose from popular embedding models</CardDescription>
            </CardHeader>
            <CardContent>
              <EmbeddingModelSelector
                defaultModelId={embeddingModel}
                defaultUseHuggingFace={useHuggingFace}
                onChange={handleModelChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}