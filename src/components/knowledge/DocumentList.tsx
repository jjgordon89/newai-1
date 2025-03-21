import React, { useState } from "react";
import {
  FileText,
  Trash2,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  tags?: string[];
  status: "processed" | "processing" | "error";
  errorMessage?: string;
}

interface DocumentListProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
  onDeleteDocument: (documentId: string) => void;
  onDownloadDocument: (documentId: string) => void;
  onEditDocument: (document: Document) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onViewDocument,
  onDeleteDocument,
  onDownloadDocument,
  onEditDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const toggleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map((doc) => doc.id));
    }
  };

  const toggleSelectDocument = (documentId: string) => {
    if (selectedDocuments.includes(documentId)) {
      setSelectedDocuments(selectedDocuments.filter((id) => id !== documentId));
    } else {
      setSelectedDocuments([...selectedDocuments, documentId]);
    }
  };

  const handleSort = (column: "name" | "date" | "size") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "docx":
      case "doc":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "txt":
        return <FileText className="h-5 w-5 text-gray-500" />;
      case "md":
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "processed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Processed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Processing
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  // Filter documents based on search query
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.tags &&
        doc.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )),
  );

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === "date") {
      return sortDirection === "asc"
        ? a.uploadDate.getTime() - b.uploadDate.getTime()
        : b.uploadDate.getTime() - a.uploadDate.getTime();
    } else {
      // size
      return sortDirection === "asc" ? a.size - b.size : b.size - a.size;
    }
  });

  const handleDeleteSelected = () => {
    selectedDocuments.forEach((id) => onDeleteDocument(id));
    setSelectedDocuments([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex gap-1">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                <span className={sortBy === "name" ? "font-medium" : ""}>
                  Sort by Name
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("date")}>
                <span className={sortBy === "date" ? "font-medium" : ""}>
                  Sort by Date
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("size")}>
                <span className={sortBy === "size" ? "font-medium" : ""}>
                  Sort by Size
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortDirection("asc")}>
                <span className={sortDirection === "asc" ? "font-medium" : ""}>
                  Ascending
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortDirection("desc")}>
                <span className={sortDirection === "desc" ? "font-medium" : ""}>
                  Descending
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedDocuments.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selectedDocuments.length})
            </Button>
          )}
        </div>
      </div>

      {sortedDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Upload documents to get started"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      selectedDocuments.length === filteredDocuments.length &&
                      filteredDocuments.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all documents"
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Document
                    {sortBy === "name" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("size")}
                >
                  <div className="flex items-center">
                    Size
                    {sortBy === "size" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center">
                    Uploaded
                    {sortBy === "date" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedDocuments.includes(document.id)}
                      onCheckedChange={() => toggleSelectDocument(document.id)}
                      aria-label={`Select ${document.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getDocumentIcon(document.type)}
                      <div className="space-y-1">
                        <div className="font-medium">{document.name}</div>
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {document.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(document.size)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{formatDate(document.uploadDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(document.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewDocument(document)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDownloadDocument(document.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEditDocument(document)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteDocument(document.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
};

export default DocumentList;
