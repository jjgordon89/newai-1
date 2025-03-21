import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database, FileText, BarChart2, Upload, Loader2 } from "lucide-react";
import DocumentUploader from "@/components/knowledge/DocumentUploader";
import DocumentList, { Document } from "@/components/knowledge/DocumentList";
import DocumentViewer from "@/components/knowledge/DocumentViewer";
import DocumentMetadataEditor, {
  DocumentMetadata,
} from "@/components/knowledge/DocumentMetadataEditor";
import KnowledgeAnalytics from "@/components/knowledge/KnowledgeAnalytics";

// Mock data for demonstration
const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Project Requirements.pdf",
    type: "pdf",
    size: 2.5 * 1024 * 1024,
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ["project", "requirements", "specification"],
    status: "processed",
  },
  {
    id: "2",
    name: "API Documentation.md",
    type: "md",
    size: 350 * 1024,
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    tags: ["api", "documentation", "technical"],
    status: "processed",
  },
  {
    id: "3",
    name: "Meeting Notes.txt",
    type: "txt",
    size: 15 * 1024,
    uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tags: ["meeting", "notes"],
    status: "processed",
  },
  {
    id: "4",
    name: "Product Roadmap.docx",
    type: "docx",
    size: 1.2 * 1024 * 1024,
    uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    tags: ["product", "roadmap", "planning"],
    status: "processed",
  },
  {
    id: "5",
    name: "User Research.pdf",
    type: "pdf",
    size: 8.7 * 1024 * 1024,
    uploadDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    tags: ["research", "user", "insights"],
    status: "processed",
  },
  {
    id: "6",
    name: "Financial Report Q2.pdf",
    type: "pdf",
    size: 4.3 * 1024 * 1024,
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    tags: ["financial", "report", "quarterly"],
    status: "processing",
  },
];

// Mock query data
const mockQueryData = {
  queries: [
    {
      query: "project requirements",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      documentIds: ["1"],
    },
    {
      query: "api endpoints",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      documentIds: ["2"],
    },
    {
      query: "meeting action items",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      documentIds: ["3"],
    },
    {
      query: "product roadmap timeline",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      documentIds: ["4"],
    },
    {
      query: "user research findings",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      documentIds: ["5"],
    },
    {
      query: "financial results",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      documentIds: ["6"],
    },
    {
      query: "project requirements",
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      documentIds: ["1"],
    },
    {
      query: "api documentation",
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      documentIds: ["2"],
    },
  ],
  topQueries: [
    { query: "project requirements", count: 2 },
    { query: "api documentation", count: 1 },
    { query: "api endpoints", count: 1 },
    { query: "meeting action items", count: 1 },
    { query: "product roadmap timeline", count: 1 },
    { query: "user research findings", count: 1 },
    { query: "financial results", count: 1 },
  ],
};

const KnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [activeTab, setActiveTab] = useState("documents");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isMetadataEditorOpen, setIsMetadataEditorOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Simulate loading document content when a document is selected for viewing
  useEffect(() => {
    if (selectedDocument && isViewerOpen) {
      setDocumentContent(null); // Reset content while loading

      // Simulate API call to fetch document content
      const timer = setTimeout(() => {
        // Mock document content based on type
        let content = "";

        switch (selectedDocument.type.toLowerCase()) {
          case "txt":
            content =
              "This is a sample text file content.\n\nMeeting Notes - Project Kickoff\n\nDate: 2023-06-15\nAttendees: John, Sarah, Mike, Lisa\n\nAgenda:\n1. Project overview\n2. Timeline discussion\n3. Resource allocation\n4. Next steps\n\nAction Items:\n- John: Prepare project charter by 6/20\n- Sarah: Schedule follow-up meetings\n- Mike: Create initial technical design\n- Lisa: Coordinate with stakeholders";
            break;
          case "md":
            content =
              '# API Documentation\n\n## Endpoints\n\n### GET /api/v1/users\n\nReturns a list of all users.\n\n**Parameters:**\n- `limit` (optional): Maximum number of users to return\n- `offset` (optional): Pagination offset\n\n**Response:**\n```json\n{\n  "users": [\n    {\n      "id": 1,\n      "name": "John Doe",\n      "email": "john@example.com"\n    }\n  ],\n  "total": 100\n}\n```\n\n### POST /api/v1/users\n\nCreates a new user.\n\n**Request Body:**\n```json\n{\n  "name": "Jane Doe",\n  "email": "jane@example.com",\n  "password": "securepassword"\n}\n```';
            break;
          default:
            content = `This is a mock content for ${selectedDocument.name}. In a real implementation, we would render the actual document content.`;
        }

        setDocumentContent(content);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [selectedDocument, isViewerOpen]);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);

    try {
      // Simulate API call to upload files
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create new document objects
      const newDocuments: Document[] = files.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        type: file.name.split(".").pop() || "",
        size: file.size,
        uploadDate: new Date(),
        status: "processing",
      }));

      // Add new documents to the list
      setDocuments([...newDocuments, ...documents]);

      // Simulate processing completion after a delay
      setTimeout(() => {
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            newDocuments.some((newDoc) => newDoc.id === doc.id)
              ? { ...doc, status: "processed" }
              : doc,
          ),
        );
      }, 3000);

      return Promise.resolve();
    } catch (error) {
      console.error("Error uploading files:", error);
      return Promise.reject(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(documents.filter((doc) => doc.id !== documentId));

    // Close viewer if the deleted document is currently being viewed
    if (selectedDocument && selectedDocument.id === documentId) {
      setIsViewerOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleDownloadDocument = (documentId: string) => {
    // In a real implementation, this would trigger a download of the actual file
    console.log(`Downloading document with ID: ${documentId}`);

    // For demonstration, show an alert
    alert(
      `Downloading document: ${documents.find((doc) => doc.id === documentId)?.name}`,
    );
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsMetadataEditorOpen(true);
  };

  const handleSaveMetadata = (
    document: Document,
    metadata: DocumentMetadata,
  ) => {
    // Update document with new metadata
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === document.id
          ? {
              ...doc,
              name: metadata.title || doc.name,
              tags: metadata.tags,
              // In a real implementation, we would also save description and custom fields
            }
          : doc,
      ),
    );

    setIsMetadataEditorOpen(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>

        <div className="flex gap-2">
          {isUploading && (
            <Button disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4 pt-4">
          {documents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Database className="h-8 w-8 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No documents yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload documents to start building your knowledge base.
                  </p>
                  <Button
                    className="mt-2"
                    onClick={() => setActiveTab("upload")}
                  >
                    Upload Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {isViewerOpen && selectedDocument ? (
                <DocumentViewer
                  document={selectedDocument}
                  onClose={() => setIsViewerOpen(false)}
                  onDownload={handleDownloadDocument}
                  documentContent={documentContent}
                />
              ) : (
                <DocumentList
                  documents={documents}
                  onViewDocument={handleViewDocument}
                  onDeleteDocument={handleDeleteDocument}
                  onDownloadDocument={handleDownloadDocument}
                  onEditDocument={handleEditDocument}
                />
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="pt-4">
          <DocumentUploader onUpload={handleUpload} />
        </TabsContent>

        <TabsContent value="analytics" className="pt-4">
          <KnowledgeAnalytics documents={documents} queryData={mockQueryData} />
        </TabsContent>
      </Tabs>

      {selectedDocument && (
        <DocumentMetadataEditor
          document={selectedDocument}
          open={isMetadataEditorOpen}
          onClose={() => setIsMetadataEditorOpen(false)}
          onSave={handleSaveMetadata}
        />
      )}
    </div>
  );
};

export default KnowledgeBase;
