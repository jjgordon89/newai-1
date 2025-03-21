import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Highlighter,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Share,
  Trash,
  X,
} from "lucide-react";

interface Annotation {
  id: string;
  text: string;
  comment: string;
  color: string;
  page: number;
  position: { x: number; y: number; width: number; height: number };
  author: string;
  timestamp: string;
  resolved: boolean;
}

interface DocumentViewerProps {
  documentId: string;
  onBack?: () => void;
}

const mockDocument = {
  id: "doc-1",
  title: "Product Requirements Document",
  type: "pdf",
  content:
    "# Product Requirements Document\n\n## Overview\nThis document outlines the requirements for our new product. It includes functional specifications, user stories, and technical requirements.\n\n## User Stories\n1. As a user, I want to be able to search for documents by title, content, or tags.\n2. As a user, I want to be able to organize my documents into folders.\n3. As a user, I want to be able to share documents with others.\n4. As a user, I want to be able to annotate documents and collaborate with others.\n\n## Functional Requirements\n- Document search functionality\n- Document organization (folders, tags)\n- Document sharing and permissions\n- Document annotation and collaboration\n- Version history\n\n## Technical Requirements\n- Frontend: React, TypeScript, Tailwind CSS\n- Backend: Node.js, Express, MongoDB\n- Authentication: JWT, OAuth\n- Storage: AWS S3\n- Search: Elasticsearch\n\n## Timeline\n- Phase 1: Document management (Week 1-4)\n- Phase 2: Search functionality (Week 5-6)\n- Phase 3: Knowledge Base API (Week 5-6)\n- Phase 4: Workflow Integration (Week 7-8)\n- Phase 5: UI/UX Enhancements (Week 9-10)\n\n## Success Metrics\n- User engagement: >80% of users use the system weekly\n- Search accuracy: >90% of searches return relevant results\n- Document organization: >70% of documents are properly tagged and organized\n- Collaboration: >50% of documents have at least one annotation or comment",
  author: "Jane Smith",
  created: "2023-10-15T10:30:00Z",
  modified: "2023-10-20T14:45:00Z",
  version: 3,
  pages: 1,
};

const mockAnnotations: Annotation[] = [
  {
    id: "anno-1",
    text: "Document search functionality",
    comment: "We should prioritize this feature for the first release.",
    color: "#FFEB3B",
    page: 1,
    position: { x: 50, y: 200, width: 300, height: 20 },
    author: "John Doe",
    timestamp: "2023-10-18T09:30:00Z",
    resolved: false,
  },
  {
    id: "anno-2",
    text: "Phase 3: Knowledge Base API",
    comment: "Let's discuss the specific endpoints we need for this phase.",
    color: "#4CAF50",
    page: 1,
    position: { x: 50, y: 350, width: 250, height: 20 },
    author: "Emily Johnson",
    timestamp: "2023-10-19T14:15:00Z",
    resolved: true,
  },
  {
    id: "anno-3",
    text: "Search accuracy: >90% of searches return relevant results",
    comment: "This seems ambitious. Should we start with a lower target?",
    color: "#FF9800",
    page: 1,
    position: { x: 50, y: 450, width: 400, height: 20 },
    author: "Jane Smith",
    timestamp: "2023-10-20T11:45:00Z",
    resolved: false,
  },
];

export default function DocumentViewer({
  documentId,
  onBack,
}: DocumentViewerProps) {
  const [document, setDocument] = useState(mockDocument);
  const [annotations, setAnnotations] = useState<Annotation[]>(mockAnnotations);
  const [activeTab, setActiveTab] = useState("view");
  const [zoom, setZoom] = useState(100);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<Annotation | null>(null);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [newAnnotation, setNewAnnotation] =
    useState<Partial<Annotation> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false);
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Handle document selection for annotation
  const handleDocumentSelection = () => {
    if (!isAddingAnnotation) return;

    const selection = window.getSelection();
    if (
      !selection ||
      selection.rangeCount === 0 ||
      selection.toString().trim() === ""
    )
      return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = contentRef.current?.getBoundingClientRect();

    if (!containerRect) return;

    // Calculate position relative to the container
    const position = {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height,
    };

    setNewAnnotation({
      text: selection.toString(),
      page: currentPage,
      position,
      color: "#FFEB3B", // Default color
    });

    setShowAnnotationDialog(true);
    selection.removeAllRanges();
  };

  // Create a new annotation
  const handleCreateAnnotation = (comment: string, color: string) => {
    if (!newAnnotation || !newAnnotation.text) return;

    const annotation: Annotation = {
      id: `anno-${Date.now()}`,
      text: newAnnotation.text,
      comment,
      color,
      page: newAnnotation.page || currentPage,
      position: newAnnotation.position || { x: 0, y: 0, width: 0, height: 0 },
      author: "Current User", // In a real app, this would be the current user
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    setAnnotations([...annotations, annotation]);
    setNewAnnotation(null);
    setIsAddingAnnotation(false);
    setShowAnnotationDialog(false);
  };

  // Update an existing annotation
  const handleUpdateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setAnnotations(
      annotations.map((anno) =>
        anno.id === id ? { ...anno, ...updates } : anno,
      ),
    );
    setSelectedAnnotation(null);
    setIsEditingAnnotation(false);
  };

  // Delete an annotation
  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter((anno) => anno.id !== id));
    setSelectedAnnotation(null);
  };

  // Toggle annotation resolved status
  const handleToggleResolved = (id: string) => {
    setAnnotations(
      annotations.map((anno) =>
        anno.id === id ? { ...anno, resolved: !anno.resolved } : anno,
      ),
    );
  };

  // Render annotations as highlights on the document
  const renderAnnotationHighlights = () => {
    if (!showAnnotations) return null;

    return annotations
      .filter((anno) => anno.page === currentPage)
      .map((anno) => (
        <div
          key={anno.id}
          className={cn(
            "absolute cursor-pointer transition-opacity",
            anno.resolved ? "opacity-30" : "opacity-70",
            selectedAnnotation?.id === anno.id ? "ring-2 ring-primary" : "",
          )}
          style={{
            left: `${anno.position.x}px`,
            top: `${anno.position.y}px`,
            width: `${anno.position.width}px`,
            height: `${anno.position.height}px`,
            backgroundColor: anno.color,
            zIndex: 10,
          }}
          onClick={() => setSelectedAnnotation(anno)}
        />
      ));
  };

  // Format the document content for display
  const formatDocumentContent = () => {
    if (document.type === "pdf") {
      // In a real app, this would render a PDF viewer
      // For this example, we'll just render the markdown content
      return document.content.split("\n").map((line, index) => {
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="text-2xl font-bold mt-6 mb-4">
              {line.substring(2)}
            </h1>
          );
        } else if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="text-xl font-bold mt-5 mb-3">
              {line.substring(3)}
            </h2>
          );
        } else if (line.startsWith("- ")) {
          return (
            <li key={index} className="ml-6 mb-1">
              {line.substring(2)}
            </li>
          );
        } else if (line.match(/^\d+\. /)) {
          const textContent = line.replace(/^\d+\. /, "");
          return (
            <li key={index} className="ml-6 mb-1">
              {textContent}
            </li>
          );
        } else if (line === "") {
          return <div key={index} className="h-4"></div>;
        } else {
          return (
            <p key={index} className="mb-2">
              {line}
            </p>
          );
        }
      });
    } else {
      return <pre className="whitespace-pre-wrap">{document.content}</pre>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold">{document.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="h-4 w-4 mr-1" />
              <span className="uppercase mr-2">{document.type}</span>
              <span className="mr-2">•</span>
              <span>Version {document.version}</span>
              <span className="mx-2">•</span>
              <span>
                Last modified {new Date(document.modified).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document view */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b p-2 flex items-center justify-between bg-background">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex items-center justify-between w-full">
                <TabsList>
                  <TabsTrigger value="view">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </TabsTrigger>
                  <TabsTrigger value="annotate">
                    <Highlighter className="h-4 w-4 mr-2" />
                    Annotate
                  </TabsTrigger>
                  <TabsTrigger value="comments">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comments
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-4">
                  {/* Page navigation */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {document.pages}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentPage >= document.pages}
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(document.pages, prev + 1),
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Zoom controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setZoom((prev) => Math.max(50, prev - 10))}
                      disabled={zoom <= 50}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm w-16 text-center">{zoom}%</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setZoom((prev) => Math.min(200, prev + 10))
                      }
                      disabled={zoom >= 200}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Annotation visibility toggle */}
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="show-annotations"
                      className="text-sm cursor-pointer"
                    >
                      Show Annotations
                    </Label>
                    <Switch
                      id="show-annotations"
                      checked={showAnnotations}
                      onCheckedChange={setShowAnnotations}
                    />
                  </div>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Document content */}
          <div className="flex-1 overflow-auto p-8 bg-muted/30">
            <div
              className="mx-auto bg-white shadow-md p-8 relative"
              style={{
                width: `${(8.5 * zoom) / 100}in`,
                minHeight: `${(11 * zoom) / 100}in`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              {/* Annotation highlights */}
              {renderAnnotationHighlights()}

              {/* Document content */}
              <div
                ref={contentRef}
                className="relative"
                onClick={
                  activeTab === "annotate" ? handleDocumentSelection : undefined
                }
              >
                {formatDocumentContent()}
              </div>
            </div>
          </div>

          {/* Annotation toolbar (only visible in annotate mode) */}
          {activeTab === "annotate" && (
            <div className="border-t p-2 bg-background">
              <div className="flex items-center gap-4">
                <Button
                  variant={isAddingAnnotation ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
                >
                  <Highlighter className="h-4 w-4 mr-2" />
                  {isAddingAnnotation ? "Cancel" : "Add Annotation"}
                </Button>

                {isAddingAnnotation && (
                  <div className="text-sm text-muted-foreground">
                    Select text in the document to annotate
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar for comments/annotations */}
        {(activeTab === "comments" ||
          (activeTab === "annotate" && selectedAnnotation)) && (
          <div className="w-80 border-l bg-background overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-medium">
                {activeTab === "comments" ? "Comments" : "Annotation"}
              </h3>
            </div>

            <ScrollArea className="flex-1">
              {activeTab === "comments" ? (
                <div className="p-4 space-y-4">
                  {annotations.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No comments yet</p>
                    </div>
                  ) : (
                    annotations.map((anno) => (
                      <Card
                        key={anno.id}
                        className={cn(
                          "overflow-hidden transition-colors",
                          anno.resolved ? "bg-muted/50" : "",
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: anno.color }}
                              />
                              <span className="font-medium">{anno.author}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(anno.timestamp).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="mb-2 text-sm bg-muted/50 p-2 rounded-md">
                            "{anno.text}"
                          </div>

                          <p className="text-sm">{anno.comment}</p>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleResolved(anno.id)}
                            >
                              {anno.resolved ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Resolved
                                </>
                              ) : (
                                "Mark as resolved"
                              )}
                            </Button>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setSelectedAnnotation(anno);
                                  setIsEditingAnnotation(true);
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleDeleteAnnotation(anno.id)}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ) : selectedAnnotation ? (
                <div className="p-4">
                  {isEditingAnnotation ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs mb-1 block">
                          Highlighted Text
                        </Label>
                        <div className="text-sm bg-muted/50 p-2 rounded-md">
                          "{selectedAnnotation.text}"
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="edit-comment"
                          className="text-xs mb-1 block"
                        >
                          Comment
                        </Label>
                        <Textarea
                          id="edit-comment"
                          defaultValue={selectedAnnotation.comment}
                          className="resize-none"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label className="text-xs mb-1 block">
                          Highlight Color
                        </Label>
                        <div className="flex gap-2">
                          {[
                            "#FFEB3B",
                            "#4CAF50",
                            "#FF9800",
                            "#2196F3",
                            "#E91E63",
                          ].map((color) => (
                            <div
                              key={color}
                              className={cn(
                                "w-6 h-6 rounded-full cursor-pointer transition-all",
                                selectedAnnotation.color === color
                                  ? "ring-2 ring-primary ring-offset-2"
                                  : "",
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() =>
                                setSelectedAnnotation({
                                  ...selectedAnnotation,
                                  color,
                                })
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsEditingAnnotation(false);
                            setSelectedAnnotation(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const commentEl = document.getElementById(
                              "edit-comment",
                            ) as HTMLTextAreaElement;
                            handleUpdateAnnotation(selectedAnnotation.id, {
                              comment: commentEl.value,
                              color: selectedAnnotation.color,
                            });
                          }}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: selectedAnnotation.color,
                            }}
                          />
                          <span className="font-medium">
                            {selectedAnnotation.author}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            selectedAnnotation.timestamp,
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <Label className="text-xs mb-1 block">
                          Highlighted Text
                        </Label>
                        <div className="text-sm bg-muted/50 p-2 rounded-md">
                          "{selectedAnnotation.text}"
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs mb-1 block">Comment</Label>
                        <p className="text-sm">{selectedAnnotation.comment}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleResolved(selectedAnnotation.id)
                          }
                        >
                          {selectedAnnotation.resolved ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Resolved
                            </>
                          ) : (
                            "Mark as resolved"
                          )}
                        </Button>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setIsEditingAnnotation(true)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() =>
                              handleDeleteAnnotation(selectedAnnotation.id)
                            }
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedAnnotation(null)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Close
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}
            </ScrollArea>

            {activeTab === "comments" && (
              <div className="p-4 border-t">
                <Textarea
                  placeholder="Add a comment..."
                  className="resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Annotation Dialog */}
      <Dialog
        open={showAnnotationDialog}
        onOpenChange={setShowAnnotationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Annotation</DialogTitle>
            <DialogDescription>
              Add a comment to the selected text.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label className="text-xs mb-1 block">Selected Text</Label>
              <div className="text-sm bg-muted/50 p-2 rounded-md">
                "{newAnnotation?.text}"
              </div>
            </div>

            <div>
              <Label
                htmlFor="annotation-comment"
                className="text-xs mb-1 block"
              >
                Comment
              </Label>
              <Textarea
                id="annotation-comment"
                placeholder="Add your comment here..."
                className="resize-none"
                rows={4}
              />
            </div>

            <div>
              <Label className="text-xs mb-1 block">Highlight Color</Label>
              <div className="flex gap-2">
                {["#FFEB3B", "#4CAF50", "#FF9800", "#2196F3", "#E91E63"].map(
                  (color) => (
                    <div
                      key={color}
                      className={cn(
                        "w-6 h-6 rounded-full cursor-pointer transition-all",
                        (newAnnotation?.color || "#FFEB3B") === color
                          ? "ring-2 ring-primary ring-offset-2"
                          : "",
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setNewAnnotation({ ...newAnnotation, color })
                      }
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAnnotationDialog(false);
                setNewAnnotation(null);
                setIsAddingAnnotation(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const commentEl = document.getElementById(
                  "annotation-comment",
                ) as HTMLTextAreaElement;
                handleCreateAnnotation(
                  commentEl.value,
                  newAnnotation?.color || "#FFEB3B",
                );
              }}
            >
              Add Annotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Minus = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
  </svg>
);
