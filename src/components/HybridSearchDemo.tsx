import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import VectorSearchPanel from "./VectorSearchPanel";
import SimilarDocumentsPanel from "./SimilarDocumentsPanel";
import { SearchResultItem } from "../lib/vectorSearchService";

export default function HybridSearchDemo() {
  const [selectedWorkspace, setSelectedWorkspace] = useState("default");
  const [selectedDocument, setSelectedDocument] =
    useState<SearchResultItem | null>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);

  // Handle document selection
  const handleDocumentSelect = (document: SearchResultItem) => {
    setSelectedDocument(document);
    setShowDocumentDialog(true);
  };

  return (
    <div className="container mx-auto p-4 h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Vector Search Demo</CardTitle>
          <CardDescription>
            Explore semantic search, hybrid search, and document similarity
          </CardDescription>
        </CardHeader>

        <CardContent className="h-[calc(100%-100px)]">
          <Tabs defaultValue="search" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="similar" disabled={!selectedDocument}>
                Similar Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="h-[calc(100%-40px)]">
              <VectorSearchPanel
                workspaceId={selectedWorkspace}
                onResultSelect={handleDocumentSelect}
              />
            </TabsContent>

            <TabsContent value="similar" className="h-[calc(100%-40px)]">
              {selectedDocument ? (
                <SimilarDocumentsPanel
                  workspaceId={selectedWorkspace}
                  documentId={selectedDocument.id}
                  onDocumentSelect={handleDocumentSelect}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a document first to see similar documents
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedDocument?.documentName || "Document"}
            </DialogTitle>
            <DialogDescription>
              Document ID: {selectedDocument?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 p-4">
                <div className="whitespace-pre-wrap">
                  {selectedDocument?.text}
                </div>

                {selectedDocument?.metadata &&
                  Object.keys(selectedDocument.metadata).length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <h3 className="text-lg font-medium mb-2">Metadata</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedDocument.metadata)
                          .filter(
                            ([key]) =>
                              !["content", "text", "embedding"].includes(key),
                          )
                          .map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium mr-2">{key}:</span>
                              <span className="text-muted-foreground">
                                {typeof value === "string"
                                  ? value
                                  : JSON.stringify(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDocumentDialog(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowDocumentDialog(false);
                // Switch to similar documents tab
                const tabsElement = document.querySelector('[role="tablist"]');
                if (tabsElement) {
                  const similarTabButton =
                    tabsElement.querySelector('[value="similar"]');
                  if (similarTabButton instanceof HTMLElement) {
                    similarTabButton.click();
                  }
                }
              }}
            >
              Find Similar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
