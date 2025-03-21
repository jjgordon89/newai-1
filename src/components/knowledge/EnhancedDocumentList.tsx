import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { StoredDocument } from "@/lib/documentStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Search,
  Download,
  Info,
  Trash2,
  MoreVertical,
  Edit,
  Eye,
  FileSymlink,
  RefreshCw,
  FileType,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
} from "lucide-react";

interface EnhancedDocumentListProps {
  documents: StoredDocument[];
  loading: boolean;
  onSelectDocument: (document: StoredDocument) => void;
  onDeleteDocument: (documentId: string) => void;
  selectedDocumentId?: string;
}

type SortField = "title" | "createdAt" | "updatedAt" | "type" | "size";
type SortDirection = "asc" | "desc";

const EnhancedDocumentList: React.FC<EnhancedDocumentListProps> = ({
  documents,
  loading,
  onSelectDocument,
  onDeleteDocument,
  selectedDocumentId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<StoredDocument[]>(
    [],
  );

  // Extract available document types
  useEffect(() => {
    const types = Array.from(new Set(documents.map((doc) => doc.type)));
    setAvailableTypes(types);
  }, [documents]);

  // Filter and sort documents
  useEffect(() => {
    let filtered = [...documents];

    // Apply text search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(lowerQuery) ||
          (doc.content && doc.content.toLowerCase().includes(lowerQuery)),
      );
    }

    // Apply type filter
    if (filterType) {
      filtered = filtered.filter((doc) => doc.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "size":
          comparison =
            (a.metadata?.fileSize || 0) - (b.metadata?.fileSize || 0);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, filterType, sortField, sortDirection]);

  // Get file icon based on document type
  const getFileIcon = (docType: string) => {
    switch (docType.toLowerCase()) {
      case "pdf":
        return (
          <Badge variant="outline" className="bg-red-500/10">
            PDF
          </Badge>
        );
      case "docx":
      case "doc":
        return (
          <Badge variant="outline" className="bg-blue-500/10">
            DOC
          </Badge>
        );
      case "csv":
      case "xls":
      case "xlsx":
        return (
          <Badge variant="outline" className="bg-green-500/10">
            CSV
          </Badge>
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return (
          <Badge variant="outline" className="bg-purple-500/10">
            IMG
          </Badge>
        );
      case "txt":
      case "md":
        return (
          <Badge variant="outline" className="bg-gray-500/10">
            TXT
          </Badge>
        );
      case "json":
        return (
          <Badge variant="outline" className="bg-yellow-500/10">
            JSON
          </Badge>
        );
      case "html":
        return (
          <Badge variant="outline" className="bg-orange-500/10">
            HTML
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <FileType className="h-3 w-3" />
          </Badge>
        );
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format file size for display
  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return "Unknown";

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Toggle sort direction or change sort field
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
        <RefreshCw className="h-8 w-8 mb-2 animate-spin" />
        <p>Loading documents...</p>
      </div>
    );
  }

  if (filteredDocuments.length === 0) {
    return searchQuery || filterType ? (
      <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
        <Search className="h-8 w-8 mb-2 opacity-50" />
        <p>No documents found matching your criteria</p>
        <Button
          variant="link"
          size="sm"
          onClick={() => {
            setSearchQuery("");
            setFilterType(null);
          }}
          className="mt-2"
        >
          Clear filters
        </Button>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
        <FileText className="h-12 w-12 mb-4 opacity-30" />
        <p>No documents in this workspace</p>
        <p className="text-sm opacity-70 max-w-[300px] mt-1">
          Upload documents to build your knowledge base
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filter bar */}
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

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterType(null)}>
              All Types
            </DropdownMenuItem>
            {availableTypes.map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => setFilterType(type)}
                className="flex items-center gap-2"
              >
                {getFileIcon(type)}
                <span className="capitalize">{type}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              {sortDirection === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSort("title")}>
              Name{" "}
              {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("type")}>
              Type{" "}
              {sortField === "type" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("updatedAt")}>
              Last Modified{" "}
              {sortField === "updatedAt" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("createdAt")}>
              Date Added{" "}
              {sortField === "createdAt" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("size")}>
              Size{" "}
              {sortField === "size" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter indicator */}
      {filterType && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Type: {filterType.toUpperCase()}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 p-0 text-xs text-muted-foreground"
            onClick={() => setFilterType(null)}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Document list */}
      <ScrollArea className="h-[400px] pr-4 -mr-4">
        <div className="space-y-2">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer ${selectedDocumentId === doc.id ? "bg-accent" : ""}`}
              onClick={() => onSelectDocument(doc)}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                {getFileIcon(doc.type)}
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(doc.metadata?.fileSize)} •{" "}
                    {formatDate(doc.updatedAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 hover:opacity-100 focus:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDocument(doc.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedDocumentList;
