import React, { useState, useRef } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import {
  processDocument,
  batchProcessDocuments,
} from "@/lib/documentProcessingService";
import { documentUploadService, UploadProgress } from "@/lib/documentStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  UploadCloud,
  FileType,
  Trash2,
  RefreshCw,
  Search,
  FileSymlink,
  Download,
  Info,
  Settings,
  Layers,
} from "lucide-react";
import { ChunkingStrategy } from "@/lib/documentChunker";

interface DocumentUploaderProps {
  workspaceId: string;
  onUploadComplete?: (documentIds: string[]) => void;
}

const EnhancedDocumentUploader: React.FC<DocumentUploaderProps> = ({
  workspaceId,
  onUploadComplete,
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);
  const [fileProgressMap, setFileProgressMap] = useState<
    Record<string, UploadProgress>
  >({});
  const [indexingEnabled, setIndexingEnabled] = useState(true);
  const [chunkingStrategy, setChunkingStrategy] =
    useState<ChunkingStrategy>("paragraph");
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newProcessingFiles: string[] = [];
    const uploadedDocumentIds: string[] = [];
    let successCount = 0;

    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = crypto.randomUUID();
        newProcessingFiles.push(file.name);
        setProcessingFiles((prev) => [...prev, file.name]);

        // Register progress callback
        documentUploadService.registerProgressCallback(fileId, (progress) => {
          setFileProgressMap((prev) => ({
            ...prev,
            [file.name]: progress,
          }));
        });

        // Update overall progress
        setUploadProgress(((i + 1) / files.length) * 100);

        try {
          // Process the document through the pipeline
          const document = await processDocument(file, workspaceId, {
            strategy: chunkingStrategy,
            chunkSize,
            chunkOverlap,
          });

          uploadedDocumentIds.push(document.id);
          successCount++;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          toast({
            title: "Processing Error",
            description: `Failed to process ${file.name}. The file might be corrupted or in an unsupported format.`,
            variant: "destructive",
          });
        } finally {
          // Unregister progress callback
          documentUploadService.unregisterProgressCallback(fileId);
        }
      }

      // Show success toast
      if (successCount > 0) {
        toast({
          title: "Documents Added",
          description: `Successfully added ${successCount} document(s) to your workspace${indexingEnabled ? " and knowledge base" : ""}`,
        });

        // Call the onUploadComplete callback if provided
        if (onUploadComplete) {
          onUploadComplete(uploadedDocumentIds);
        }
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading documents.",
        variant: "destructive",
      });
    } finally {
      // Complete upload process
      setUploading(false);
      setUploadProgress(0);
      setProcessingFiles([]);
      setFileProgressMap({});

      // Reset file input
      event.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a new FileList-like object
      const dataTransfer = new DataTransfer();
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        dataTransfer.items.add(e.dataTransfer.files[i]);
      }

      // Set the files to the input and trigger change
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        const event = new Event("change", { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <UploadCloud className="h-5 w-5" />
          Document Uploader
        </CardTitle>
        <CardDescription>
          Upload documents to your knowledge base
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Drag and drop area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary cursor-pointer"}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <UploadCloud className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Drag and drop files here</p>
          <p className="text-xs text-muted-foreground mb-3">
            or click to browse
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            className="mx-auto"
          >
            Select Files
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Supported formats: PDF, TXT, DOCX, CSV, MD, JSON, HTML
          </p>
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading files...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />

            <div className="space-y-1 mt-2">
              {Object.entries(fileProgressMap).map(([fileName, progress]) => (
                <div key={fileName} className="flex items-center gap-2 text-xs">
                  {progress.status === "processing" && (
                    <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                  )}
                  {progress.status === "complete" && (
                    <FileText className="h-3 w-3 text-green-500" />
                  )}
                  {progress.status === "error" && (
                    <Trash2 className="h-3 w-3 text-red-500" />
                  )}
                  <span className="truncate flex-1">{fileName}</span>
                  <span className="text-muted-foreground">
                    {progress.status === "processing" &&
                      `${progress.progress}%`}
                    {progress.status === "complete" && "Complete"}
                    {progress.status === "error" && "Failed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced settings toggle */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-xs"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <Settings className="h-3.5 w-3.5" />
            {showAdvancedSettings ? "Hide" : "Show"} Advanced Settings
          </Button>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="indexing-toggle"
                      checked={indexingEnabled}
                      onCheckedChange={setIndexingEnabled}
                    />
                    <Label
                      htmlFor="indexing-toggle"
                      className="text-xs cursor-pointer"
                    >
                      Vector Indexing
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs max-w-[200px]">
                    When enabled, documents will be processed and indexed in the
                    vector database for AI retrieval
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Advanced settings panel */}
        {showAdvancedSettings && (
          <div className="border rounded-md p-3 space-y-3 bg-muted/30">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              Document Chunking Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="chunking-strategy" className="text-xs">
                  Chunking Strategy
                </Label>
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
                    <SelectItem value="semantic">Semantic</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="chunk-size" className="text-xs">
                  Chunk Size (characters)
                </Label>
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

              <div className="space-y-1">
                <Label htmlFor="chunk-overlap" className="text-xs">
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

            <div className="text-xs text-muted-foreground pt-1">
              <p>
                <strong>Fixed Size:</strong> Splits text into chunks of exact
                character length
              </p>
              <p>
                <strong>Paragraph:</strong> Splits by paragraphs while
                respecting size limits
              </p>
              <p>
                <strong>Semantic:</strong> Attempts to split at semantic
                boundaries
              </p>
              <p>
                <strong>Hybrid:</strong> Combines paragraph and semantic
                approaches
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedDocumentUploader;
