import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  InfoIcon,
  Zap,
  Brain,
  Database,
  RefreshCw,
  Trash2,
} from "lucide-react";
import EmbeddingModelSelector from "@/components/EmbeddingModelSelector";
import { EmbeddingService } from "@/lib/embeddingService";
import { EmbeddingPipeline } from "@/lib/embeddingPipeline";

export default function EmbeddingPipelineDemo() {
  const [text, setText] = useState<string>(
    "Embedding models convert text into numerical vectors that capture semantic meaning. These vectors can be used for search, clustering, and other NLP tasks. The quality of embeddings depends on the model used to generate them.",
  );
  const [modelId, setModelId] = useState<string>("BAAI/bge-small-en-v1.5");
  const [useHuggingFace, setUseHuggingFace] = useState<boolean>(true);
  const [useCache, setUseCache] = useState<boolean>(true);
  const [chunkSize, setChunkSize] = useState<number>(200);
  const [chunkOverlap, setChunkOverlap] = useState<number>(50);
  const [batchSize, setBatchSize] = useState<number>(5);

  const [pipeline, setPipeline] = useState<EmbeddingPipeline | null>(null);
  const [chunks, setChunks] = useState<{ text: string; index: number }[]>([]);
  const [embeddings, setEmbeddings] = useState<any[]>([]);
  const [selectedChunk, setSelectedChunk] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [cacheStats, setCacheStats] = useState<{
    size: number;
    modelCount: number;
  }>({ size: 0, modelCount: 0 });
  const [timeTaken, setTimeTaken] = useState<number | null>(null);

  // Initialize pipeline when settings change
  useEffect(() => {
    const newPipeline = EmbeddingService.createPipeline(modelId, {
      chunkSize,
      chunkOverlap,
      batchSize,
      useCache,
    });
    setPipeline(newPipeline);

    // Update cache stats
    if (useCache) {
      setCacheStats(newPipeline.getCacheStats());
    }
  }, [modelId, chunkSize, chunkOverlap, batchSize, useCache]);

  // Handle model change from selector
  const handleModelChange = (
    newModelId: string,
    newUseHuggingFace: boolean,
  ) => {
    setModelId(newModelId);
    setUseHuggingFace(newUseHuggingFace);
  };

  // Process text into chunks
  const handleChunkText = () => {
    if (!pipeline || !text) return;

    const processedChunks = pipeline.chunkText(text);
    setChunks(processedChunks.map((chunk, index) => ({ text: chunk, index })));
    setEmbeddings([]);
    setSelectedChunk(0);
  };

  // Generate embeddings for chunks
  const handleGenerateEmbeddings = async () => {
    if (!pipeline || chunks.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setTimeTaken(null);

    const startTime = performance.now();

    try {
      // Create document chunks from text chunks
      const documentChunks = chunks.map((chunk) => ({
        text: chunk.text,
        metadata: { index: chunk.index },
      }));

      // Process in batches to update progress
      const result = [];
      const batchCount = Math.ceil(documentChunks.length / batchSize);

      for (let i = 0; i < documentChunks.length; i += batchSize) {
        const batch = documentChunks.slice(i, i + batchSize);
        const batchResults = await pipeline.embedChunks(batch);
        result.push(...batchResults);

        // Update progress
        const currentBatch = Math.floor(i / batchSize) + 1;
        setProgress((currentBatch / batchCount) * 100);
      }

      setEmbeddings(result);
      setTimeTaken(performance.now() - startTime);

      // Update cache stats
      if (useCache) {
        setCacheStats(pipeline.getCacheStats());
      }
    } catch (error) {
      console.error("Error generating embeddings:", error);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  // Clear cache
  const handleClearCache = () => {
    if (!pipeline) return;

    pipeline.clearCache();
    setCacheStats({ size: 0, modelCount: 0 });
  };

  // Format vector for display
  const formatVector = (vector: number[] | undefined) => {
    if (!vector) return "No embedding available";

    // Show first few values with ellipsis
    return `[${vector
      .slice(0, 5)
      .map((v) => v.toFixed(4))
      .join(", ")}, ... (${vector.length} dimensions)]`;
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Embedding Pipeline Demo
        </CardTitle>
        <CardDescription>
          Process text into chunks and generate embeddings using Hugging Face
          models
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="input">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input">Input & Settings</TabsTrigger>
            <TabsTrigger value="chunks">Text Chunks</TabsTrigger>
            <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="text-input">Input Text</Label>
                <Textarea
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to process..."
                  className="min-h-[150px]"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Embedding Model</h3>
                <EmbeddingModelSelector
                  defaultModelId={modelId}
                  defaultUseHuggingFace={useHuggingFace}
                  onChange={handleModelChange}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pipeline Settings</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="chunk-size">Chunk Size</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Maximum number of characters in each chunk
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-sm font-medium">{chunkSize}</span>
                  </div>
                  <Slider
                    id="chunk-size"
                    min={50}
                    max={1000}
                    step={50}
                    value={[chunkSize]}
                    onValueChange={(value) => setChunkSize(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="chunk-overlap">Chunk Overlap</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Number of characters that overlap between chunks
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-sm font-medium">{chunkOverlap}</span>
                  </div>
                  <Slider
                    id="chunk-overlap"
                    min={0}
                    max={200}
                    step={10}
                    value={[chunkOverlap]}
                    onValueChange={(value) => setChunkOverlap(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="batch-size">Batch Size</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Number of chunks to process in each batch
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-sm font-medium">{batchSize}</span>
                  </div>
                  <Slider
                    id="batch-size"
                    min={1}
                    max={20}
                    step={1}
                    value={[batchSize]}
                    onValueChange={(value) => setBatchSize(value[0])}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-cache"
                    checked={useCache}
                    onCheckedChange={setUseCache}
                  />
                  <Label
                    htmlFor="use-cache"
                    className="flex items-center gap-2"
                  >
                    <Database className="h-3.5 w-3.5" />
                    Enable Embedding Cache
                  </Label>
                </div>

                {useCache && cacheStats.size > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Cache contains {cacheStats.size} entries (
                      {cacheStats.modelCount} for current model)
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleClearCache}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Clear Cache
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chunks" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Text Chunks</h3>
              <Button onClick={handleChunkText}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Process Text
              </Button>
            </div>

            {chunks.length > 0 ? (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 border rounded-md">
                  <ScrollArea className="h-[400px] p-2">
                    <div className="space-y-2 p-2">
                      {chunks.map((chunk, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-md cursor-pointer ${selectedChunk === index ? "bg-primary/10 border border-primary/30" : "bg-muted/40 hover:bg-muted"}`}
                          onClick={() => setSelectedChunk(index)}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <Badge variant="outline">Chunk {index + 1}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {chunk.text.length} chars
                            </span>
                          </div>
                          <p className="text-xs line-clamp-2">{chunk.text}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="col-span-8 border rounded-md p-4">
                  {chunks[selectedChunk] && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">
                          Chunk {selectedChunk + 1} of {chunks.length}
                        </h4>
                        <Badge variant="outline">
                          {chunks[selectedChunk].text.length} characters
                        </Badge>
                      </div>
                      <ScrollArea className="h-[350px] border rounded-md p-3 bg-muted/20">
                        <p className="whitespace-pre-wrap">
                          {chunks[selectedChunk].text}
                        </p>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] border rounded-md bg-muted/10">
                <p className="text-muted-foreground">No chunks generated yet</p>
                <Button onClick={handleChunkText} className="mt-4">
                  Process Text
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="embeddings" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Embeddings</h3>
              <div className="flex gap-2">
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="w-[100px]" />
                    <span className="text-sm">{Math.round(progress)}%</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleGenerateEmbeddings}
                    disabled={chunks.length === 0}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Embeddings
                  </Button>
                )}
              </div>
            </div>

            {embeddings.length > 0 ? (
              <div className="space-y-4">
                {timeTaken !== null && (
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-primary/5">
                      Generated {embeddings.length} embeddings in{" "}
                      {(timeTaken / 1000).toFixed(2)}s
                    </Badge>
                    <Badge variant="outline">
                      Model: {modelId.split("/").pop()}
                    </Badge>
                  </div>
                )}

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 border rounded-md">
                    <ScrollArea className="h-[400px] p-2">
                      <div className="space-y-2 p-2">
                        {embeddings.map((embedding, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-md cursor-pointer ${selectedChunk === index ? "bg-primary/10 border border-primary/30" : "bg-muted/40 hover:bg-muted"}`}
                            onClick={() => setSelectedChunk(index)}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <Badge variant="outline">
                                Embedding {index + 1}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {embedding.embedding.dimensions}d
                              </span>
                            </div>
                            <p className="text-xs line-clamp-2">
                              {embedding.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="col-span-8 border rounded-md p-4">
                    {embeddings[selectedChunk] && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">
                            Embedding {selectedChunk + 1} of {embeddings.length}
                          </h4>
                          <Badge variant="outline">
                            {embeddings[selectedChunk].embedding.dimensions}{" "}
                            dimensions
                          </Badge>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-sm font-medium mb-1">Text</h5>
                            <div className="border rounded-md p-3 bg-muted/20">
                              <p className="text-sm">
                                {embeddings[selectedChunk].text}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-1">Vector</h5>
                            <ScrollArea className="h-[250px] border rounded-md p-3 bg-muted/20">
                              <pre className="text-xs font-mono whitespace-pre-wrap">
                                {JSON.stringify(
                                  embeddings[selectedChunk].embedding.values,
                                  null,
                                  2,
                                )}
                              </pre>
                            </ScrollArea>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] border rounded-md bg-muted/10">
                <p className="text-muted-foreground">
                  {chunks.length > 0
                    ? "No embeddings generated yet"
                    : "Process text into chunks first"}
                </p>
                <Button
                  onClick={
                    chunks.length > 0
                      ? handleGenerateEmbeddings
                      : handleChunkText
                  }
                  className="mt-4"
                  disabled={chunks.length === 0 && text.length === 0}
                >
                  {chunks.length > 0 ? "Generate Embeddings" : "Process Text"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-xs text-muted-foreground">
          Using {useHuggingFace ? "Hugging Face" : "Default"} embedding model
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleChunkText}>
            Process Text
          </Button>
          <Button
            onClick={handleGenerateEmbeddings}
            disabled={chunks.length === 0 || isProcessing}
          >
            Generate Embeddings
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
