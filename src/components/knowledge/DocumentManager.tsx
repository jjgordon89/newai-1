import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { DocumentAPI } from "@/lib/api";
import { StoredDocument } from "@/lib/documentStorage";
import EnhancedDocumentUploader from "./EnhancedDocumentUploader";
import EnhancedDocumentList from "./EnhancedDocumentList";
import DocumentMetadataEditor from "./DocumentMetadataEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FileText,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";

interface DocumentManagerProps {
  workspaceId: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ workspaceId }) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] =
    useState<StoredDocument | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [metadataFilter, setMetadataFilter] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState("all");

  // Load documents
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await DocumentAPI.listDocuments(workspaceId);
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDocuments();
  }, [workspaceId]);

  // Handle document upload completion
  const handleUploadComplete = (documentIds: string[]) => {
    loadDocuments();
  };

  // Handle document selection
  const handleSelectDocument = (document: StoredDocument) => {
    setSelectedDocument(document);
    setIsEditing(false);
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    try {
      await DocumentAPI.deleteDocument(workspaceId, documentId);
      setDocuments((docs) => docs.filter((doc) => doc.id !== documentId));
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
      toast({
        title: "Document Deleted",
        description: "The document has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  // Handle document update
  const handleUpdateDocument = async (updates: Partial<StoredDocument>) => {
    if (!selectedDocument) return;

    try {
      const updatedDoc = await DocumentAPI.updateDocument(
        workspaceId,
        selectedDocument.id,
        updates,
      );
      setDocuments((docs) =>
        docs.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc)),
      );
      setSelectedDocument(updatedDoc);
      setIsEditing(false);
      toast({
        title: "Document Updated",
        description: "The document has been successfully updated",
      });
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDocuments();
      return;
    }

    setLoading(true);
    try {
      const results = await DocumentAPI.searchDocuments(
        workspaceId,
        searchQuery,
      );
      setDocuments(results);
    } catch (error) {
      console.error("Error searching documents:", error);
      toast({
        title: "Search Error",
        description: "Failed to search documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle metadata filter
  const handleMetadataFilter = async () => {
    if (Object.keys(metadataFilter).length === 0) {
      loadDocuments();
      return;
    }

    setLoading(true);
    try {
      const results = await DocumentAPI.searchByMetadata(
        workspaceId,
        metadataFilter,
      );
      setDocuments(results);
    } catch (error) {
      console.error("Error filtering documents:", error);
      toast({
        title: "Filter Error",
        description: "Failed to filter documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add metadata filter
  const addMetadataFilter = (key: string, value: any) => {
    setMetadataFilter((prev) => ({ ...prev, [key]: value }));
  };

  // Remove metadata filter
  const removeMetadataFilter = (key: string) => {
    const newFilter = { ...metadataFilter };
    delete newFilter[key];
    setMetadataFilter(newFilter);
  };

  // Filter documents by type
  const filterByType = (type: string) => {
    if (type === "all") {
      loadDocuments();
    } else {
      addMetadataFilter("fileType", type);
      handleMetadataFilter();
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Document Manager
        </h1>
        <p className="text-muted-foreground">
          Upload, manage, and search your documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Document uploader and filters */}
        <div className="space-y-6">
          <EnhancedDocumentUploader
            workspaceId={workspaceId}
            onUploadComplete={handleUploadComplete}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Text search */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Metadata filters */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Filter by Metadata</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(metadataFilter).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center bg-muted px-2 py-1 rounded-md text-xs"
                    >
                      <span>
                        {key}: {value.toString()}
                      </span>
                      <button
                        onClick={() => removeMetadataFilter(key)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMetadataFilter}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMetadataFilter({});
                      loadDocuments();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle column: Document list */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
              <CardDescription>
                {documents.length} document{documents.length !== 1 && "s"} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  setActiveTab(value);
                  filterByType(value);
                }}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pdf">PDF</TabsTrigger>
                  <TabsTrigger value="txt">Text</TabsTrigger>
                  <TabsTrigger value="docx">Word</TabsTrigger>
                  <TabsTrigger value="md">Markdown</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-4">
                <EnhancedDocumentList
                  documents={documents}
                  loading={loading}
                  onSelectDocument={handleSelectDocument}
                  onDeleteDocument={handleDeleteDocument}
                  selectedDocumentId={selectedDocument?.id}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDocuments}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right column: Document details */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Edit className="h-5 w-5" />
                    Edit Document
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    Document Details
                  </>
                )}
              </CardTitle>
              {selectedDocument && (
                <CardDescription>{selectedDocument.title}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {selectedDocument ? (
                <div className="space-y-4">
                  {isEditing ? (
                    <DocumentMetadataEditor
                      document={selectedDocument}
                      onSave={handleUpdateDocument}
                      onCancel={() => setIsEditing(false)}
                    />
                  ) : (
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
                              {selectedDocument.title}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Type
                            </span>
                            <span className="text-sm font-medium">
                              {selectedDocument.type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Created
                            </span>
                            <span className="text-sm font-medium">
                              {new Date(
                                selectedDocument.createdAt,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Updated
                            </span>
                            <span className="text-sm font-medium">
                              {new Date(
                                selectedDocument.updatedAt,
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Metadata</h3>
                        <div className="border rounded-md p-3 bg-muted/30 max-h-[300px] overflow-auto">
                          <pre className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(selectedDocument.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          Content Preview
                        </h3>
                        <div className="border rounded-md p-3 bg-muted/30 max-h-[200px] overflow-auto">
                          <p className="text-xs">
                            {selectedDocument.content.substring(0, 500)}
                            {selectedDocument.content.length > 500 && "..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <FileText className="h-16 w-16 mb-4 opacity-20" />
                  <p>Select a document to view details</p>
                </div>
              )}
            </CardContent>
            {selectedDocument && !isEditing && (
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteDocument(selectedDocument.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
