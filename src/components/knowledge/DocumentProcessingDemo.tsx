import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Upload,
  FileType,
  ChevronRight,
  Settings,
  Layers,
  Code,
  Database,
} from "lucide-react";
import { processDocument, ProcessedDocument } from "@/lib/documentProcessor";
import { ChunkingStrategy } from "@/lib/documentChunking";

const DocumentProcessingDemo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedDocument, setProcessedDocument] =
    useState<ProcessedDocument | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedChunkIndex, setSelectedChunkIndex] = useState<number | null>(
    null,
  );

  // Processing options
  const [chunkingStrategy, setChunkingStrategy] =
    useState<ChunkingStrategy>("paragraph");
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [removeHtml, setRemoveHtml] = useState(true);
  const [expandContractions, setExpandContractions] = useState(false);
  const [removeBoilerplate, setRemoveBoilerplate] = useState(true);
  const [normalizeWhitespace, setNormalizeWhitespace] = useState(true);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleProcessDocument = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const document = await processDocument(file, {
        chunking: {
          strategy: chunkingStrategy,
          chunkSize,
          chunkOverlap,
        },
        preprocessing: {
          removeHtml,
          expandContractions,
          removeBoilerplate,
          normalizeWhitespace,
        },
      });

      setProcessedDocument(document);
      setActiveTab("results");
    } catch (error) {
      console.error("Error processing document:", error);
      alert(
        `Error processing document: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Database className="h-8 w-8" />
          Document Processing Pipeline
        </h1>
        <p className="text-muted-foreground">
          Test the document processing pipeline with different options
        </p>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upload" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            Upload Document
          </TabsTrigger>
          <TabsTrigger value="options" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Processing Options
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="flex items-center gap-1"
            disabled={!processedDocument}
          >
            <FileText className="h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload a document to process through the pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary cursor-pointer"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".txt,.pdf,.docx,.md,.csv,.json,.html"
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Drag and drop a file here
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  or click to browse
                </p>
                <Button variant="outline" size="sm" className="mx-auto">
                  Select File
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Supported formats: PDF, TXT, DOCX, MD, CSV, JSON, HTML
                </p>
              </div>

              {file && (
                <div className="flex items-center justify-between p-4 border rounded-md bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileType className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} •{" "}
                        {file.type || "Unknown type"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setActiveTab("options")}
                  >
                    Continue
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Processing Options</CardTitle>
              <CardDescription>
                Configure how the document will be processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chunking options */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  Document Chunking Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chunking-strategy">Chunking Strategy</Label>
                    <Select
                      value={chunkingStrategy}
                      onValueChange={(value) =>
                        setChunkingStrategy(value as ChunkingStrategy)
                      }
                    >
                      <SelectTrigger id="chunking-strategy">
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Size</SelectItem>
                        <SelectItem value="paragraph">Paragraph</SelectItem>
                        <SelectItem value="sentence">Sentence</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chunk-size">Chunk Size (characters)</Label>
                    <Input
                      id="chunk-size"
                      type="number"
                      value={chunkSize}
                      onChange={(e) =>
                        setChunkSize(parseInt(e.target.value) || 1000)
                      }
                      min={100}
                      max={10000}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chunk-overlap">
                      Chunk Overlap (characters)
                    </Label>
                    <Input
                      id="chunk-overlap"
                      type="number"
                      value={chunkOverlap}
                      onChange={(e) =>
                        setChunkOverlap(parseInt(e.target.value) || 200)
                      }
                      min={0}
                      max={chunkSize / 2}
                    />
                  </div>
                </div>
              </div>

              {/* Preprocessing options */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <Code className="h-4 w-4" />
                  Text Preprocessing Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="remove-html">Remove HTML Tags</Label>
                      <p className="text-xs text-muted-foreground">
                        Strip HTML tags from the document
                      </p>
                    </div>
                    <Switch
                      id="remove-html"
                      checked={removeHtml}
                      onCheckedChange={setRemoveHtml}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="expand-contractions">
                        Expand Contractions
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Convert "don't" to "do not", etc.
                      </p>
                    </div>
                    <Switch
                      id="expand-contractions"
                      checked={expandContractions}
                      onCheckedChange={setExpandContractions}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="remove-boilerplate">
                        Remove Boilerplate
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Remove signatures, disclaimers, etc.
                      </p>
                    </div>
                    <Switch
                      id="remove-boilerplate"
                      checked={removeBoilerplate}
                      onCheckedChange={setRemoveBoilerplate}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="normalize-whitespace">
                        Normalize Whitespace
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Standardize spaces, tabs, and line breaks
                      </p>
                    </div>
                    <Switch
                      id="normalize-whitespace"
                      checked={normalizeWhitespace}
                      onCheckedChange={setNormalizeWhitespace}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setActiveTab("upload")}>
                Back
              </Button>
              <Button
                onClick={handleProcessDocument}
                disabled={!file || isProcessing}
              >
                {isProcessing ? "Processing..." : "Process Document"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-0">
          {processedDocument && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Chunks</CardTitle>
                    <CardDescription>
                      The document was split into{" "}
                      {processedDocument.chunks.length} chunks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {processedDocument.chunks.map((chunk, index) => (
                        <Card
                          key={chunk.id}
                          className={`cursor-pointer hover:border-primary transition-colors ${selectedChunkIndex === index ? "border-primary" : ""}`}
                          onClick={() => setSelectedChunkIndex(index)}
                        >
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <span>Chunk {index + 1}</span>
                              <Badge variant="outline">
                                {chunk.metadata.strategy}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-xs text-muted-foreground mb-2">
                              {chunk.content.length} characters
                            </p>
                            <div className="text-xs border rounded-md p-2 bg-muted/50 h-20 overflow-hidden relative">
                              {chunk.content.substring(0, 150)}...
                              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedChunkIndex !== null && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Chunk {selectedChunkIndex + 1} Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Content</h3>
                          <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                            <pre className="text-sm whitespace-pre-wrap">
                              {
                                processedDocument.chunks[selectedChunkIndex]
                                  .content
                              }
                            </pre>
                          </ScrollArea>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium mb-2">Metadata</h3>
                          <div className="text-sm border rounded-md p-4 bg-muted/50">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(
                                processedDocument.chunks[selectedChunkIndex]
                                  .metadata,
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] w-full">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            Basic Information
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Title
                              </span>
                              <span className="text-sm font-medium">
                                {processedDocument.title}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Type
                              </span>
                              <span className="text-sm font-medium">
                                {processedDocument.type}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Size
                              </span>
                              <span className="text-sm font-medium">
                                {formatFileSize(
                                  processedDocument.metadata.fileSize,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Created
                              </span>
                              <span className="text-sm font-medium">
                                {processedDocument.createdAt.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            Content Statistics
                          </h3>
                          <div className="space-y-2">
                            {processedDocument.metadata.charCount && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Characters
                                </span>
                                <span className="text-sm font-medium">
                                  {processedDocument.metadata.charCount}
                                </span>
                              </div>
                            )}
                            {processedDocument.metadata.wordCount && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Words
                                </span>
                                <span className="text-sm font-medium">
                                  {processedDocument.metadata.wordCount}
                                </span>
                              </div>
                            )}
                            {processedDocument.metadata.lineCount && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Lines
                                </span>
                                <span className="text-sm font-medium">
                                  {processedDocument.metadata.lineCount}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Chunks
                              </span>
                              <span className="text-sm font-medium">
                                {processedDocument.chunks.length}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            Full Metadata
                          </h3>
                          <div className="text-xs border rounded-md p-4 bg-muted/50">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(
                                processedDocument.metadata,
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Processing Options Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Chunking</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Strategy
                            </span>
                            <Badge>{chunkingStrategy}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Chunk Size
                            </span>
                            <span className="text-sm font-medium">
                              {chunkSize} chars
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Chunk Overlap
                            </span>
                            <span className="text-sm font-medium">
                              {chunkOverlap} chars
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          Preprocessing
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Remove HTML
                            </span>
                            <Badge variant={removeHtml ? "default" : "outline"}>
                              {removeHtml ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Expand Contractions
                            </span>
                            <Badge
                              variant={
                                expandContractions ? "default" : "outline"
                              }
                            >
                              {expandContractions ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Remove Boilerplate
                            </span>
                            <Badge
                              variant={
                                removeBoilerplate ? "default" : "outline"
                              }
                            >
                              {removeBoilerplate ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Normalize Whitespace
                            </span>
                            <Badge
                              variant={
                                normalizeWhitespace ? "default" : "outline"
                              }
                            >
                              {normalizeWhitespace ? "Yes" : "No"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentProcessingDemo;
