import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import EmbeddingModelSelector from "./EmbeddingModelSelector";
import { 
  BookOpen, 
  FileSearch, 
  Sliders, 
  Globe, 
  Bot, 
  Info, 
  Settings2,
  ChevronDown
} from "lucide-react";

// AdvancedRagSettings interface that defines the expected props
interface AdvancedRagSettingsProps {
  settings?: {
    chunkSize?: number;
    chunkOverlap?: number;
    topK?: number;
    similarityThreshold?: number;
    chunkingStrategy?: string;
    retrievalK?: number;
    enhancedContext?: boolean;
    retrieverStrategy?: string;
    embeddingModel?: string;
    useHuggingFaceEmbeddings?: boolean;
    [key: string]: any;
  };
  onSettingsChange?: (settings: any) => void;
}

// Default settings
const DEFAULT_SETTINGS = {
  chunkSize: 1024,
  chunkOverlap: 200,
  topK: 3,
  similarityThreshold: 70,
  chunkingStrategy: "hybrid",
  retrievalK: 3,
  enhancedContext: true,
  retrieverStrategy: "hybrid",
  embeddingModel: "BAAI/bge-small-en-v1.5",
  useHuggingFaceEmbeddings: true
};

export function AdvancedRagSettings({ 
  settings = {}, 
  onSettingsChange 
}: AdvancedRagSettingsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chunking");
  const [localSettings, setLocalSettings] = useState({
    ...DEFAULT_SETTINGS,
    ...settings
  });
  
  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(prev => ({
      ...prev,
      ...settings
    }));
  }, [settings]);
  
  // Update settings
  const updateSettings = (settingsUpdate: Partial<typeof localSettings>) => {
    const updated = { ...localSettings, ...settingsUpdate };
    setLocalSettings(updated);
    
    if (onSettingsChange) {
      onSettingsChange(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          RAG Configuration
        </h3>
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          Advanced
        </Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="chunking">Document Chunking</TabsTrigger>
          <TabsTrigger value="retrieval">Retrieval</TabsTrigger>
          <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chunking" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chunk Size</Label>
                <span className="text-sm font-medium">{localSettings.chunkSize}</span>
              </div>
              <Slider 
                value={[localSettings.chunkSize]} 
                min={128} 
                max={2048} 
                step={128}
                onValueChange={([value]) => updateSettings({ chunkSize: value })}
              />
              <p className="text-xs text-muted-foreground">
                Size of text chunks for embedding and retrieval (in tokens)
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chunk Overlap</Label>
                <span className="text-sm font-medium">{localSettings.chunkOverlap}</span>
              </div>
              <Slider 
                value={[localSettings.chunkOverlap]} 
                min={0} 
                max={512} 
                step={32}
                onValueChange={([value]) => updateSettings({ chunkOverlap: value })}
              />
              <p className="text-xs text-muted-foreground">
                Overlap between consecutive chunks to maintain context
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Chunking Strategy</Label>
              <Select 
                value={localSettings.chunkingStrategy} 
                onValueChange={(value) => updateSettings({ chunkingStrategy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chunking strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixedSize">Fixed Size</SelectItem>
                  <SelectItem value="semantic">Semantic</SelectItem>
                  <SelectItem value="recursive">Recursive</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Method used to split documents into chunks
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="retrieval" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Documents to retrieve (K)</Label>
                <span className="text-sm font-medium">{localSettings.topK}</span>
              </div>
              <Slider 
                value={[localSettings.topK]} 
                min={1} 
                max={10} 
                step={1}
                onValueChange={([value]) => updateSettings({ topK: value })}
              />
              <p className="text-xs text-muted-foreground">
                Number of document chunks to retrieve for each query
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Similarity Threshold (%)</Label>
                <span className="text-sm font-medium">{localSettings.similarityThreshold}%</span>
              </div>
              <Slider 
                value={[localSettings.similarityThreshold]} 
                min={50} 
                max={95} 
                step={5}
                onValueChange={([value]) => updateSettings({ similarityThreshold: value })}
              />
              <p className="text-xs text-muted-foreground">
                Minimum similarity score for retrieved documents
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Retriever Strategy</Label>
              <Select 
                value={localSettings.retrieverStrategy} 
                onValueChange={(value) => updateSettings({ retrieverStrategy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select retriever strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semantic">Semantic Search</SelectItem>
                  <SelectItem value="mmr">Maximum Marginal Relevance</SelectItem>
                  <SelectItem value="hybrid">Hybrid Search</SelectItem>
                  <SelectItem value="reranking">Reranking</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Strategy used to retrieve and rank relevant documents
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                id="enhanced-context" 
                checked={localSettings.enhancedContext} 
                onCheckedChange={(checked) => updateSettings({ enhancedContext: checked })}
              />
              <div className="grid gap-1.5">
                <Label htmlFor="enhanced-context">Enhanced Context</Label>
                <p className="text-xs text-muted-foreground">
                  Extract and structure document information for better understanding
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="embeddings" className="space-y-4 pt-4">
          <div className="space-y-4">
            <EmbeddingModelSelector
              defaultModelId={localSettings.embeddingModel}
              defaultUseHuggingFace={localSettings.useHuggingFaceEmbeddings}
              onChange={(modelId, useHuggingFace) => {
                updateSettings({
                  embeddingModel: modelId,
                  useHuggingFaceEmbeddings: useHuggingFace
                });
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="mr-2"
          onClick={() => {
            // Reset to defaults
            const resetSettings = { ...DEFAULT_SETTINGS };
            setLocalSettings(resetSettings);
            if (onSettingsChange) {
              onSettingsChange(resetSettings);
            }
            toast({
              title: "Settings Reset",
              description: "RAG settings have been reset to defaults"
            });
          }}
        >
          Reset to Defaults
        </Button>
        
        <Button
          onClick={() => {
            if (onSettingsChange) {
              onSettingsChange(localSettings);
            }
            toast({
              title: "Settings Saved",
              description: "Your RAG configuration has been updated"
            });
          }}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
