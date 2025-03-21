import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Folder,
  Grid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Share,
  Star,
  Tag,
  Trash,
  Upload,
  Users,
  X,
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  type: string;
  size: number;
  created: string;
  modified: string;
  author: string;
  tags: string[];
  folder: string;
  starred: boolean;
  shared: boolean;
  thumbnail?: string;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

// Mock data
const mockDocuments: Document[] = [
  {
    id: "doc-1",
    title: "Product Requirements Document",
    type: "pdf",
    size: 2500000,
    created: "2023-10-15T10:30:00Z",
    modified: "2023-10-20T14:45:00Z",
    author: "Jane Smith",
    tags: ["product", "requirements"],
    folder: "folder-1",
    starred: true,
    shared: true,
    thumbnail:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&q=80",
  },
  {
    id: "doc-2",
    title: "Technical Specification",
    type: "docx",
    size: 1800000,
    created: "2023-10-10T09:15:00Z",
    modified: "2023-10-18T11:20:00Z",
    author: "John Doe",
    tags: ["technical", "specification"],
    folder: "folder-1",
    starred: false,
    shared: true,
  },
  {
    id: "doc-3",
    title: "Market Research Report",
    type: "pdf",
    size: 3200000,
    created: "2023-09-28T13:45:00Z",
    modified: "2023-10-05T16:30:00Z",
    author: "Emily Johnson",
    tags: ["research", "market"],
    folder: "folder-2",
    starred: true,
    shared: false,
  },
  {
    id: "doc-4",
    title: "User Interview Transcripts",
    type: "txt",
    size: 950000,
    created: "2023-10-02T11:00:00Z",
    modified: "2023-10-02T11:00:00Z",
    author: "Michael Brown",
    tags: ["user", "research", "interview"],
    folder: "folder-2",
    starred: false,
    shared: false,
  },
  {
    id: "doc-5",
    title: "Competitive Analysis",
    type: "xlsx",
    size: 1500000,
    created: "2023-09-20T10:15:00Z",
    modified: "2023-10-12T09:30:00Z",
    author: "Sarah Wilson",
    tags: ["competitive", "analysis", "market"],
    folder: "folder-3",
    starred: false,
    shared: true,
  },
  {
    id: "doc-6",
    title: "Design System Guidelines",
    type: "pdf",
    size: 4100000,
    created: "2023-08-15T14:20:00Z",
    modified: "2023-10-01T13:45:00Z",
    author: "Alex Chen",
    tags: ["design", "guidelines"],
    folder: "folder-3",
    starred: true,
    shared: true,
    thumbnail:
      "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=300&q=80",
  },
  {
    id: "doc-7",
    title: "Project Timeline",
    type: "xlsx",
    size: 980000,
    created: "2023-10-05T09:00:00Z",
    modified: "2023-10-19T15:30:00Z",
    author: "Jane Smith",
    tags: ["project", "timeline"],
    folder: "folder-1",
    starred: false,
    shared: true,
  },
  {
    id: "doc-8",
    title: "API Documentation",
    type: "md",
    size: 750000,
    created: "2023-09-10T11:45:00Z",
    modified: "2023-10-15T10:20:00Z",
    author: "John Doe",
    tags: ["api", "documentation", "technical"],
    folder: "folder-4",
    starred: true,
    shared: false,
  },
];

const mockFolders: Folder[] = [
  {
    id: "folder-1",
    name: "Project Documents",
    parentId: null,
    color: "#4f46e5",
  },
  { id: "folder-2", name: "Research", parentId: null, color: "#0ea5e9" },
  { id: "folder-3", name: "Marketing", parentId: null, color: "#10b981" },
  { id: "folder-4", name: "Technical Docs", parentId: null, color: "#f59e0b" },
  { id: "folder-5", name: "Archived", parentId: null, color: "#6b7280" },
];

const mockTags: Tag[] = [
  { id: "tag-1", name: "product", color: "#4f46e5" },
  { id: "tag-2", name: "technical", color: "#0ea5e9" },
  { id: "tag-3", name: "research", color: "#10b981" },
  { id: "tag-4", name: "market", color: "#f59e0b" },
  { id: "tag-5", name: "design", color: "#ec4899" },
  { id: "tag-6", name: "user", color: "#8b5cf6" },
  { id: "tag-7", name: "interview", color: "#6366f1" },
  { id: "tag-8", name: "requirements", color: "#0d9488" },
  { id: "tag-9", name: "specification", color: "#0369a1" },
  { id: "tag-10", name: "analysis", color: "#ca8a04" },
  { id: "tag-11", name: "competitive", color: "#be123c" },
  { id: "tag-12", name: "guidelines", color: "#7c3aed" },
  { id: "tag-13", name: "project", color: "#2563eb" },
  { id: "tag-14", name: "timeline", color: "#059669" },
  { id: "tag-15", name: "api", color: "#dc2626" },
  { id: "tag-16", name: "documentation", color: "#9333ea" },
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return <FileText className="h-6 w-6 text-red-500" />;
    case "docx":
      return <FileText className="h-6 w-6 text-blue-500" />;
    case "xlsx":
      return <FileText className="h-6 w-6 text-green-500" />;
    case "txt":
      return <FileText className="h-6 w-6 text-gray-500" />;
    case "md":
      return <FileText className="h-6 w-6 text-purple-500" />;
    default:
      return <FileText className="h-6 w-6 text-gray-500" />;
  }
};

export default function DocumentManagementUI() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [folders, setFolders] = useState<Folder[]>(mockFolders);
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("modified");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewTagDialog, setShowNewTagDialog] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#4f46e5");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );

  // Filter documents based on selected criteria
  const filteredDocuments = documents.filter((doc) => {
    // Filter by folder
    if (selectedFolder && doc.folder !== selectedFolder) return false;

    // Filter by tags
    if (
      selectedTags.length > 0 &&
      !selectedTags.some((tag) => doc.tags.includes(tag))
    )
      return false;

    // Filter by search query
    if (
      searchQuery &&
      !doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    // Filter by date range
    if (dateRange.from && new Date(doc.modified) < dateRange.from) return false;
    if (dateRange.to && new Date(doc.modified) > dateRange.to) return false;

    // Filter by file type
    if (fileTypes.length > 0 && !fileTypes.includes(doc.type)) return false;

    return true;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      case "size":
        comparison = a.size - b.size;
        break;
      case "created":
        comparison =
          new Date(a.created).getTime() - new Date(b.created).getTime();
        break;
      case "modified":
        comparison =
          new Date(a.modified).getTime() - new Date(b.modified).getTime();
        break;
      case "author":
        comparison = a.author.localeCompare(b.author);
        break;
      default:
        comparison =
          new Date(a.modified).getTime() - new Date(b.modified).getTime();
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Get unique file types
  const uniqueFileTypes = Array.from(new Set(documents.map((doc) => doc.type)));

  // Handle folder selection
  const handleFolderSelect = (folderId: string) => {
    setSelectedFolder(selectedFolder === folderId ? null : folderId);
  };

  // Handle tag selection
  const handleTagSelect = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName],
    );
  };

  // Handle document selection
  const handleDocumentSelect = (docId: string, event?: React.MouseEvent) => {
    if (event?.ctrlKey || event?.metaKey) {
      // Multi-select with Ctrl/Cmd key
      setSelectedDocuments((prev) =>
        prev.includes(docId)
          ? prev.filter((id) => id !== docId)
          : [...prev, docId],
      );
    } else {
      // Single select
      setSelectedDocuments([docId]);
    }
  };

  // Handle document star toggle
  const handleStarDocument = (docId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, starred: !doc.starred } : doc,
      ),
    );
  };

  // Handle file type filter
  const handleFileTypeToggle = (type: string) => {
    setFileTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  // Create new folder
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: `folder-${folders.length + 1}`,
        name: newFolderName.trim(),
        parentId: null,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      };
      setFolders([...folders, newFolder]);
      setNewFolderName("");
      setShowNewFolderDialog(false);
    }
  };

  // Create new tag
  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: `tag-${tags.length + 1}`,
        name: newTagName.trim().toLowerCase(),
        color: newTagColor,
      };
      setTags([...tags, newTag]);
      setNewTagName("");
      setShowNewTagDialog(false);
    }
  };

  // Handle document share
  const handleShareDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowShareDialog(true);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedFolder(null);
    setSelectedTags([]);
    setSearchQuery("");
    setDateRange({ from: undefined, to: undefined });
    setFileTypes([]);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 flex flex-col h-full bg-background">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Documents</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Folders */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Folders</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNewFolderDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
                  selectedFolder === folder.id
                    ? "bg-accent"
                    : "hover:bg-accent/50",
                )}
                onClick={() => handleFolderSelect(folder.id)}
              >
                <div className="flex-shrink-0">
                  <Folder className="h-4 w-4" style={{ color: folder.color }} />
                </div>
                <span className="text-sm truncate">{folder.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Tags</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNewTagDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={
                  selectedTags.includes(tag.name) ? "default" : "outline"
                }
                className="cursor-pointer"
                style={{
                  backgroundColor: selectedTags.includes(tag.name)
                    ? tag.color
                    : "transparent",
                  borderColor: tag.color,
                  color: selectedTags.includes(tag.name) ? "white" : tag.color,
                }}
                onClick={() => handleTagSelect(tag.name)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {showFilterPanel && (
          <div className="border rounded-md p-3 mb-4 bg-background">
            <h3 className="text-sm font-medium mb-2">Filters</h3>

            {/* Date range */}
            <div className="mb-3">
              <Label className="text-xs mb-1 block">Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        format(dateRange.from, "PPP")
                      ) : (
                        <span>From date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) =>
                        setDateRange((prev) => ({ ...prev, from: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? (
                        format(dateRange.to, "PPP")
                      ) : (
                        <span>To date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) =>
                        setDateRange((prev) => ({ ...prev, to: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* File types */}
            <div className="mb-3">
              <Label className="text-xs mb-1 block">File Types</Label>
              <div className="space-y-2">
                {uniqueFileTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={fileTypes.includes(type)}
                      onCheckedChange={() => handleFileTypeToggle(type)}
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type.toUpperCase()}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        )}

        <div className="mt-auto pt-4 border-t">
          <Button variant="outline" className="w-full" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2 w-full max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="modified">Modified Date</SelectItem>
                <SelectItem value="author">Author</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4 rotate-90" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Document list */}
        <div className="flex-1 p-4 overflow-auto">
          {sortedDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Try adjusting your filters or upload a new document
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedDocuments.includes(doc.id)
                      ? "ring-2 ring-primary"
                      : "",
                  )}
                  onClick={(e) => handleDocumentSelect(doc.id, e)}
                >
                  <div className="relative h-32 bg-muted rounded-t-lg overflow-hidden">
                    {doc.thumbnail ? (
                      <img
                        src={doc.thumbnail}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {getFileIcon(doc.type)}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-8 w-8 bg-background/80 hover:bg-background"
                      onClick={(e) => handleStarDocument(doc.id, e)}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          doc.starred
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground",
                        )}
                      />
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium truncate" title={doc.title}>
                          {doc.title}
                        </h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <span className="uppercase">{doc.type}</span>
                          <span className="mx-1">•</span>
                          <span>{formatFileSize(doc.size)}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShareDocument(doc)}
                          >
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.map((tagName) => {
                        const tagObj = tags.find((t) => t.name === tagName);
                        return (
                          <Badge
                            key={tagName}
                            variant="outline"
                            className="text-xs px-1 py-0"
                            style={{
                              borderColor: tagObj?.color || "#888",
                              color: tagObj?.color || "#888",
                            }}
                          >
                            {tagName}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 pt-0 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(doc.modified).toLocaleDateString()}
                      </div>
                      {doc.shared && (
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Shared
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDocuments.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className={cn(
                        "cursor-pointer",
                        selectedDocuments.includes(doc.id) ? "bg-accent" : "",
                      )}
                      onClick={(e) => handleDocumentSelect(doc.id, e)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleStarDocument(doc.id, e)}
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              doc.starred
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground",
                            )}
                          />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.type)}
                          <span className="font-medium">{doc.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="uppercase">{doc.type}</TableCell>
                      <TableCell>{formatFileSize(doc.size)}</TableCell>
                      <TableCell>
                        {new Date(doc.modified).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{doc.author}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map((tagName) => {
                            const tagObj = tags.find((t) => t.name === tagName);
                            return (
                              <Badge
                                key={tagName}
                                variant="outline"
                                className="text-xs px-1 py-0"
                                style={{
                                  borderColor: tagObj?.color || "#888",
                                  color: tagObj?.color || "#888",
                                }}
                              >
                                {tagName}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShareDocument(doc)}
                            >
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="My New Folder"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFolderDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Tag Dialog */}
      <Dialog open={showNewTagDialog} onOpenChange={setShowNewTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Enter a name and choose a color for your new tag.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="new-tag"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tagColor">Tag Color</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: newTagColor }}
                />
                <Input
                  id="tagColor"
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewTagDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTag}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              {selectedDocument &&
                `Share "${selectedDocument.title}" with others.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="shareEmail">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="shareEmail"
                  type="email"
                  placeholder="colleague@example.com"
                  className="flex-1"
                />
                <Select defaultValue="view">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Permissions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">Can view</SelectItem>
                    <SelectItem value="comment">Can comment</SelectItem>
                    <SelectItem value="edit">Can edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value="https://example.com/share/doc-123456"
                  className="flex-1"
                />
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Select defaultValue="restricted">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Link permissions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restricted">Restricted</SelectItem>
                    <SelectItem value="anyone">Anyone with the link</SelectItem>
                    <SelectItem value="organization">
                      Anyone in the organization
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
