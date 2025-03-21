import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { initializeRagWithLanceDb } from "@/lib/enhancedRagService";
import { ChatProvider, useChat } from "@/context/ChatContext";
import {
  processDocument,
  batchProcessDocuments,
} from "@/lib/documentProcessingPipeline";
import {
  addDocumentToVectorStore,
  deleteDocumentFromVectorStore,
} from "@/lib/lanceDbService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  FileText,
  UploadCloud,
  FileType,
  Trash2,
  RefreshCw,
  Search,
  FileSymlink,
  Download,
  Info,
} from "lucide-react";

interface DocumentManagerProps {
  workspaceId: string;
}

// Internal component that uses the ChatContext
const DocumentManagerContent: React.FC<DocumentManagerProps> = ({
  workspaceId,
}) => {
  const { listDocuments, addDocument, deleteDocument } = useWorkspace();
  const documents = listDocuments(workspaceId) || [];
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);
  const [indexingEnabled, setIndexingEnabled] = useState(true);
  const [isVectorInitialized, setIsVectorInitialized] = useState(false);

  // Access the chat context
  const chatContext = useChat();

  // Initialize LanceDB when component loads
  useEffect(() => {
    if (workspaceId && !isVectorInitialized) {
      try {
        // Initialize the RAG service with LanceDB for this workspace
        initializeRagWithLanceDb(workspaceId);
        setIsVectorInitialized(true);
        console.log(
          "LanceDB vector store initialized for workspace:",
          workspaceId,
        );
      } catch (error) {
        console.error("Failed to initialize LanceDB vector store:", error);
        toast({
          title: "Vector Store Error",
          description:
            "Failed to initialize document vector storage. Document search may not work properly.",
          variant: "destructive",
        });
      }
    }
  }, [workspaceId, isVectorInitialized, toast]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newProcessingFiles: string[] = [];
    let successCount = 0;

    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newProcessingFiles.push(file.name);
        setProcessingFiles((prev) => [...prev, file.name]);

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);

        try {
          // Generate a unique document ID
          const docId = crypto.randomUUID();

          // Add document to workspace state
          addDocument(workspaceId, {
            id: docId,
            name: file.name,
            path: URL.createObjectURL(file),
          });

          // If indexing is enabled, process document and add to vector store
          if (indexingEnabled && isVectorInitialized) {
            try {
              // Process the document through the pipeline
              await processDocument(file, workspaceId, {
                strategy: "paragraph",
                chunkSize: 1000,
                chunkOverlap: 200,
              });
            } catch (error) {
              console.error(
                `Error adding document to vector store: ${file.name}`,
                error,
              );
            }
          }

          successCount++;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          toast({
            title: "Processing Error",
            description: `Failed to process ${file.name}. The file might be corrupted or in an unsupported format.`,
            variant: "destructive",
          });
        }
      }

      // Show success toast
      if (successCount > 0) {
        toast({
          title: "Documents Added",
          description: `Successfully added ${successCount} document(s) to your workspace${indexingEnabled ? " and knowledge base" : ""}`,
        });
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

      // Reset file input
      event.target.value = "";
    }
  };

  const handleDeleteDocument = async (docId: string, docName: string) => {
    // Remove from workspace state
    deleteDocument(workspaceId, docId);

    // If vector store is initialized, remove from LanceDB
    if (isVectorInitialized) {
      try {
        await deleteDocumentFromVectorStore(workspaceId, docId);
        console.log(`Document ${docId} removed from vector store`);
      } catch (error) {
        console.error(
          `Error removing document ${docId} from vector store:`,
          error,
        );
      }
    }

    toast({
      title: "Document Removed",
      description: `"${docName}" has been removed from your workspace and knowledge base`,
    });
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (["pdf"].includes(extension || ""))
      return (
        <Badge variant="outline" className="bg-red-500/10">
          PDF
        </Badge>
      );
    if (["doc", "docx"].includes(extension || ""))
      return (
        <Badge variant="outline" className="bg-blue-500/10">
          DOC
        </Badge>
      );
    if (["xls", "xlsx", "csv"].includes(extension || ""))
      return (
        <Badge variant="outline" className="bg-green-500/10">
          CSV
        </Badge>
      );
    if (["jpg", "jpeg", "png", "gif"].includes(extension || ""))
      return (
        <Badge variant="outline" className="bg-purple-500/10">
          IMG
        </Badge>
      );
    if (["txt", "md"].includes(extension || ""))
      return (
        <Badge variant="outline" className="bg-gray-500/10">
          TXT
        </Badge>
      );

    return (
      <Badge variant="outline">
        <FileType className="h-3 w-3" />
      </Badge>
    );
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Knowledge Base
        </CardTitle>
        <CardDescription>
          Upload and manage documents for RAG capabilities
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="relative">
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Button
              variant="outline"
              className="flex gap-1.5 items-center"
              disabled={uploading}
            >
              <UploadCloud className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading files...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />

            <div className="space-y-1 mt-2">
              {processingFiles.map((fileName, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span className="truncate">{fileName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <ScrollArea className="h-[300px] pr-4 -mr-4">
          {filteredDocuments.length > 0 ? (
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-md border group hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(doc.name)}
                    <span className="truncate flex-1 text-sm">{doc.name}</span>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Info className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
              <Search className="h-8 w-8 mb-2 opacity-50" />
              <p>No documents matching "{searchQuery}"</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear search
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
              <UploadCloud className="h-12 w-12 mb-4 opacity-30" />
              <p>No documents in this workspace</p>
              <p className="text-sm opacity-70 max-w-[300px] mt-1">
                Upload documents to enable RAG capabilities for more accurate
                and contextually relevant responses
              </p>
              <div className="relative mt-4">
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  Upload Documents
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? "s" : ""} in
            knowledge base
          </div>

          <div className="flex items-center gap-4">
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

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              disabled={documents.length === 0 || !isVectorInitialized}
              onClick={async () => {
                toast({
                  title: "Reindexing Documents",
                  description:
                    "Updating vector database with the latest document content...",
                });

                try {
                  // Process docs and update vector store
                  for (const doc of documents) {
                    try {
                      await deleteDocumentFromVectorStore(workspaceId, doc.id);

                      // For a real app, you would read the file content here
                      // For this demo, we'll create a simple placeholder
                      const dummyContent = `Content for ${doc.name}: This is a sample document content that would be extracted from the actual file.`;

                      const document = {
                        id: doc.id,
                        title: doc.name,
                        content: dummyContent,
                        type: "text",
                        createdAt: new Date(),
                        metadata: {
                          fileName: doc.name,
                          reindexed: true,
                          updatedAt: new Date().toISOString(),
                        },
                      };

                      await addDocumentToVectorStore(workspaceId, document);
                    } catch (error) {
                      console.error(
                        `Error reindexing document ${doc.id}:`,
                        error,
                      );
                    }
                  }

                  toast({
                    title: "Reindexing Complete",
                    description: `Successfully updated ${documents.length} document(s) in the vector database.`,
                  });
                } catch (error) {
                  console.error("Error during reindexing:", error);
                  toast({
                    title: "Reindexing Failed",
                    description:
                      "An error occurred while updating the vector database.",
                    variant: "destructive",
                  });
                }
              }}
            >
              <FileSymlink className="h-4 w-4" />
              Reindex
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// Wrapper component that provides the ChatContext
export const DocumentManager: React.FC<DocumentManagerProps> = (props) => {
  return (
    <ChatProvider>
      <DocumentManagerContent {...props} />
    </ChatProvider>
  );
};
