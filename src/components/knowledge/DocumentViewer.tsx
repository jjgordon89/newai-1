import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Document as DocumentType } from "./DocumentList";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentViewerProps {
  document: DocumentType;
  onClose: () => void;
  onDownload: (documentId: string) => void;
  documentContent?: string | null;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onClose,
  onDownload,
  documentContent,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // For PDF documents, we would initialize the PDF.js library here
    // and get the total page count
    // This is a simplified mock implementation
    if (document.type.toLowerCase() === "pdf") {
      setTotalPages(5); // Mock 5 pages for PDFs
    } else {
      setTotalPages(1); // Single page for other document types
    }

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [document]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 50));
  };

  const toggleFullscreen = () => {
    const viewerElement = document.getElementById("document-viewer");
    if (!viewerElement) return;

    if (!isFullscreen) {
      if (viewerElement.requestFullscreen) {
        viewerElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const renderDocumentContent = () => {
    if (!documentContent) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading document content...</p>
        </div>
      );
    }

    switch (document.type.toLowerCase()) {
      case "pdf":
        // In a real implementation, we would render the PDF using PDF.js
        return (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div
              className="bg-white shadow-lg p-8 mx-auto"
              style={{
                width: `${(8.5 * zoom) / 100}in`,
                height: `${(11 * zoom) / 100}in`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center top",
              }}
            >
              <h2 className="text-xl font-bold mb-4">
                PDF Preview - Page {currentPage}
              </h2>
              <p className="text-muted-foreground mb-4">
                This is a mock PDF viewer. In a real implementation, we would
                render the PDF using PDF.js.
              </p>
              <div className="border p-4 rounded">
                <p>Document: {document.name}</p>
                <p>
                  Page: {currentPage} of {totalPages}
                </p>
                <p>Size: {(document.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          </div>
        );
      case "txt":
        return (
          <ScrollArea className="h-full">
            <div className="p-6 bg-white">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {documentContent}
              </pre>
            </div>
          </ScrollArea>
        );
      case "md":
        return (
          <ScrollArea className="h-full">
            <div className="p-6 bg-white prose max-w-none">
              {/* In a real implementation, we would render markdown using a library */}
              <pre className="whitespace-pre-wrap">{documentContent}</pre>
            </div>
          </ScrollArea>
        );
      case "docx":
      case "doc":
        // In a real implementation, we would render DOCX using a library like mammoth.js
        return (
          <ScrollArea className="h-full">
            <div className="p-6 bg-white">
              <h2 className="text-xl font-bold mb-4">DOCX Preview</h2>
              <p className="text-muted-foreground mb-4">
                This is a mock DOCX viewer. In a real implementation, we would
                render the DOCX using a library like mammoth.js.
              </p>
              <div className="border p-4 rounded">
                <p>Document: {document.name}</p>
                <p>Size: {(document.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          </ScrollArea>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Preview not available for this file type.
            </p>
          </div>
        );
    }
  };

  return (
    <div
      id="document-viewer"
      className="flex flex-col h-full bg-gray-50 border rounded-md overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-white">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium">{document.name}</h3>
        </div>

        <div className="flex items-center space-x-1">
          {document.type.toLowerCase() === "pdf" && (
            <div className="flex items-center mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm mx-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2 w-32">
              <Slider
                value={[zoom]}
                min={50}
                max={300}
                step={25}
                onValueChange={(value) => setZoom(value[0])}
              />
              <span className="text-xs w-10">{zoom}%</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 300}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDownload(document.id)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document content */}
      <div className="flex-1 overflow-auto">{renderDocumentContent()}</div>
    </div>
  );
};

export default DocumentViewer;
