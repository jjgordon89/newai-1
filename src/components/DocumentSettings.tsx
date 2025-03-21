import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Database,
  Settings,
  RefreshCw,
  Info,
  Gauge,
  HardDrive,
  FileSymlink,
  Layers,
  Scissors,
  ArrowRight
} from 'lucide-react';
import EmbeddingModelSelector from './EmbeddingModelSelector';

interface DocumentSettingsProps {
  workspaceId: string;
}

export const DocumentSettings: React.FC<DocumentSettingsProps> = ({ workspaceId }) => {
  const { workspaces, updateWorkspace } = useWorkspace();
  const workspace = workspaces.find(w => w.id === workspaceId);
  const { toast } = useToast();
  
  // Default settings
  const defaultSettings = {
    storage: {
      location: 'local',
      path: './documents',
      maxSizePerFile: 10,
      allowedTypes: ['pdf', 'docx', 'txt', 'md', 'csv']
    },
    processing: {
      chunkSize: 1000,
      chunkOverlap: 200,
      maxTokensPerChunk: 500,
      includeMetadata: true,
      extractImages: false,
      languageDetection: true
    },
    vectorization: {
      vectorStore: 'lancedb',
      embeddingModel: 'default',
      autoIndex: true,
      similarityThreshold: 0.7,
      dimensions: 384,
      customPromptTemplate: ''
    },
    retrieval: {
      maxResults: 5,
      recentDocumentBoost: 0.1,
      hybridSearch: false,
      metadataFiltering: true
    }
  };

  // Initialize state from workspace settings or defaults
  const [settings, setSettings] = useState(() => {
    if (workspace?.settings?.documentSettings) {
      return {
        ...defaultSettings,
        ...workspace.settings.documentSettings
      };
    }
    return defaultSettings;
  });
  
  const [activeTab, setActiveTab] = useState('storage');
  const [isSaving, setIsSaving] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  
  // Update settings if workspace changes
  useEffect(() => {
    if (workspace?.settings?.documentSettings) {
      setSettings(prev => ({
        ...prev,
        ...workspace.settings.documentSettings
      }));
    }
  }, [workspace]);

  // Handle saving settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Update workspace settings
      const success = updateWorkspace(workspaceId, {
        settings: {
          ...workspace?.settings,
          documentSettings: settings
        }
      });
      
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Document management settings have been updated",
        });
      } else {
        throw new Error("Failed to update workspace settings");
      }
    } catch (error) {
      console.error("Error saving document settings:", error);
      toast({
        title: "Save Error",
        description: "Failed to save document settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reindexing all documents with new settings
  const handleReindexDocuments = async () => {
    setIsReindexing(true);
    
    try {
      toast({
        title: "Reindexing Started",
        description: "Rebuilding vector index with new settings...",
      });
      
      // Simulate reindexing process (would connect to actual reindexing service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Reindexing Complete",
        description: "All documents have been reindexed with the new settings",
      });
    } catch (error) {
      console.error("Error reindexing documents:", error);
      toast({
        title: "Reindexing Error",
        description: "Failed to reindex documents with new settings",
        variant: "destructive",
      });
    } finally {
      setIsReindexing(false);
    }
  };

  // Update a specific setting
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Management
        </CardTitle>
        <CardDescription>
          Configure document processing and storage settings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="storage" className="flex items-center gap-1.5">
              <HardDrive className="h-4 w-4" />
              <span>Storage</span>
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-1.5">
              <Scissors className="h-4 w-4" />
              <span>Processing</span>
            </TabsTrigger>
            <TabsTrigger value="vectorization" className="flex items-center gap-1.5">
              <Database className="h-4 w-4" />
              <span>Vectorization</span>
            </TabsTrigger>
            <TabsTrigger value="retrieval" className="flex items-center gap-1.5">
              <FileSymlink className="h-4 w-4" />
              <span>Retrieval</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Storage Settings */}
          <TabsContent value="storage" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="storage-location">Storage Location</Label>
                <Select 
                  value={settings.storage.location} 
                  onValueChange={(value) => updateSetting('storage', 'location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select storage location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Storage</SelectItem>
                    <SelectItem value="s3">Amazon S3</SelectItem>
                    <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                    <SelectItem value="azure">Azure Blob Storage</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Where document files will be stored
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="storage-path">Storage Path</Label>
                <Input 
                  id="storage-path"
                  value={settings.storage.path}
                  onChange={(e) => updateSetting('storage', 'path', e.target.value)}
                  placeholder="./documents"
                />
                <p className="text-xs text-muted-foreground">
                  Path where documents will be saved
                </p>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                  <Badge variant="outline">{settings.storage.maxSizePerFile} MB</Badge>
                </div>
                <Slider
                  id="max-file-size"
                  min={1}
                  max={50}
                  step={1}
                  value={[settings.storage.maxSizePerFile]}
                  onValueChange={(value) => updateSetting('storage', 'maxSizePerFile', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum size allowed for document uploads
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label>Allowed File Types</Label>
                <div className="flex flex-wrap gap-2">
                  {['pdf', 'docx', 'doc', 'txt', 'md', 'csv', 'xlsx', 'pptx'].map(type => (
                    <div key={type} className="flex items-center">
                      <Switch
                        id={`filetype-${type}`}
                        checked={settings.storage.allowedTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateSetting('storage', 'allowedTypes', [...settings.storage.allowedTypes, type]);
                          } else {
                            updateSetting(
                              'storage', 
                              'allowedTypes', 
                              settings.storage.allowedTypes.filter(t => t !== type)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`filetype-${type}`} className="ml-2 text-sm">
                        .{type}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  File types that can be uploaded and processed
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Processing Settings */}
          <TabsContent value="processing" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="chunk-size">Chunk Size (characters)</Label>
                  <Badge variant="outline">{settings.processing.chunkSize}</Badge>
                </div>
                <Slider
                  id="chunk-size"
                  min={100}
                  max={2000}
                  step={100}
                  value={[settings.processing.chunkSize]}
                  onValueChange={(value) => updateSetting('processing', 'chunkSize', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Size of text chunks for processing (smaller chunks for more precise retrieval, larger for more context)
                </p>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="chunk-overlap">Chunk Overlap</Label>
                  <Badge variant="outline">{settings.processing.chunkOverlap}</Badge>
                </div>
                <Slider
                  id="chunk-overlap"
                  min={0}
                  max={500}
                  step={10}
                  value={[settings.processing.chunkOverlap]}
                  onValueChange={(value) => updateSetting('processing', 'chunkOverlap', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Number of characters to overlap between chunks
                </p>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-tokens">Max Tokens Per Chunk</Label>
                  <Badge variant="outline">{settings.processing.maxTokensPerChunk}</Badge>
                </div>
                <Slider
                  id="max-tokens"
                  min={100}
                  max={1000}
                  step={10}
                  value={[settings.processing.maxTokensPerChunk]}
                  onValueChange={(value) => updateSetting('processing', 'maxTokensPerChunk', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum tokens per chunk (helps control context size)
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="include-metadata"
                      checked={settings.processing.includeMetadata}
                      onCheckedChange={(checked) => updateSetting('processing', 'includeMetadata', checked)}
                    />
                    <Label htmlFor="include-metadata">Include Metadata</Label>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-[300px] text-xs">
                          Includes document metadata (author, date, etc.) in the vector index
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="extract-images"
                      checked={settings.processing.extractImages}
                      onCheckedChange={(checked) => updateSetting('processing', 'extractImages', checked)}
                    />
                    <Label htmlFor="extract-images">Extract Images</Label>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-[300px] text-xs">
                          Extract and analyze images from documents (requires image processing capabilities)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="language-detection"
                      checked={settings.processing.languageDetection}
                      onCheckedChange={(checked) => updateSetting('processing', 'languageDetection', checked)}
                    />
                    <Label htmlFor="language-detection">Language Detection</Label>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-[300px] text-xs">
                          Automatically detect and store document language for better retrieval
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Vectorization Settings */}
          <TabsContent value="vectorization" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="vector-store">Vector Database</Label>
                <Select 
                  value={settings.vectorization.vectorStore} 
                  onValueChange={(value) => updateSetting('vectorization', 'vectorStore', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vector database" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lancedb">LanceDB</SelectItem>
                    <SelectItem value="chroma">ChromaDB</SelectItem>
                    <SelectItem value="pinecone">Pinecone</SelectItem>
                    <SelectItem value="weaviate">Weaviate</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Database used for vector storage and retrieval
                </p>
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label>Embedding Model</Label>
                <EmbeddingModelSelector
                  selectedModel={settings.vectorization.embeddingModel}
                  onSelectModel={(model) => updateSetting('vectorization', 'embeddingModel', model)}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="dimensions">Vector Dimensions</Label>
                  <Badge variant="outline">{settings.vectorization.dimensions}</Badge>
                </div>
                <Select 
                  value={settings.vectorization.dimensions.toString()} 
                  onValueChange={(value) => updateSetting('vectorization', 'dimensions', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vector dimensions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="384">384 (Small)</SelectItem>
                    <SelectItem value="768">768 (Medium)</SelectItem>
                    <SelectItem value="1024">1024 (Large)</SelectItem>
                    <SelectItem value="1536">1536 (Extra Large)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Dimension size of embedding vectors (higher = more accurate but uses more storage)
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auto-index"
                      checked={settings.vectorization.autoIndex}
                      onCheckedChange={(checked) => updateSetting('vectorization', 'autoIndex', checked)}
                    />
                    <Label htmlFor="auto-index">Auto-Index Documents</Label>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-[300px] text-xs">
                          Automatically index documents when they are uploaded
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="similarity-threshold">Similarity Threshold</Label>
                  <Badge variant="outline">{settings.vectorization.similarityThreshold}</Badge>
                </div>
                <Slider
                  id="similarity-threshold"
                  min={0.1}
                  max={0.99}
                  step={0.01}
                  value={[settings.vectorization.similarityThreshold]}
                  onValueChange={(value) => updateSetting('vectorization', 'similarityThreshold', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum similarity score (0-1) for document retrieval
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Retrieval Settings */}
          <TabsContent value="retrieval" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-results">Maximum Results</Label>
                  <Badge variant="outline">{settings.retrieval.maxResults}</Badge>
                </div>
                <Slider
                  id="max-results"
                  min={1}
                  max={20}
                  step={1}
                  value={[settings.retrieval.maxResults]}
                  onValueChange={(value) => updateSetting('retrieval', 'maxResults', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of document chunks to retrieve during search
                </p>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="recency-boost">Recent Document Boost</Label>
                  <Badge variant="outline">{settings.retrieval.recentDocumentBoost}</Badge>
                </div>
                <Slider
                  id="recency-boost"
                  min={0}
                  max={0.5}
                  step={0.01}
                  value={[settings.retrieval.recentDocumentBoost]}
                  onValueChange={(value) => updateSetting('retrieval', 'recentDocumentBoost', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Boost factor for recently added documents (0 = no boost)
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="hybrid-search"
                      checked={settings.retrieval.hybridSearch}
                      onCheckedChange={(checked) => updateSetting('retrieval', 'hybridSearch', checked)}
                    />
                    <Label htmlFor="hybrid-search">Hybrid Search</Label>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-[300px] text-xs">
                          Combine vector search with keyword search for better results
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="metadata-filtering"
                      checked={settings.retrieval.metadataFiltering}
                      onCheckedChange={(checked) => updateSetting('retrieval', 'metadataFiltering', checked)}
                    />
                    <Label htmlFor="metadata-filtering">Metadata Filtering</Label>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-[300px] text-xs">
                          Allow filtering search results by document metadata
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button
          variant="outline"
          className="flex items-center gap-1.5"
          onClick={handleReindexDocuments}
          disabled={isReindexing || isSaving}
        >
          {isReindexing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          {isReindexing ? "Reindexing..." : "Reindex All Documents"}
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="flex items-center gap-1.5"
            onClick={handleSaveSettings}
            disabled={isSaving || isReindexing}
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};