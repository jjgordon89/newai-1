import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchDocuments, 
  deleteDocument, 
  setActiveDocument,
  searchDocuments
} from '@/redux/slices/documentSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  File, 
  Trash, 
  Edit, 
  Eye, 
  MoreHorizontal, 
  Search, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { StoredDocument } from '@/lib/documentStorage';

interface DocumentListProps {
  workspaceId: string;
  onViewDocument?: (document: StoredDocument) => void;
  onEditDocument?: (document: StoredDocument) => void;
}

export function DocumentList({ 
  workspaceId, 
  onViewDocument, 
  onEditDocument 
}: DocumentListProps) {
  const dispatch = useAppDispatch();
  const { documents, isLoading, error } = useAppSelector(state => state.documents);
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [documentToDelete, setDocumentToDelete] = useState<StoredDocument | null>(null);
  
  // Fetch documents on mount
  useEffect(() => {
    dispatch(fetchDocuments(workspaceId));
  }, [dispatch, workspaceId]);
  
  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchDocuments({ query: searchQuery, workspaceId }));
    } else {
      dispatch(fetchDocuments(workspaceId));
    }
  };
  
  // Handle search input keypress
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Reset search
  const resetSearch = () => {
    setSearchQuery('');
    dispatch(fetchDocuments(workspaceId));
  };
  
  // Handle view document
  const handleViewDocument = (document: StoredDocument) => {
    dispatch(setActiveDocument(document));
    if (onViewDocument) {
      onViewDocument(document);
    }
  };
  
  // Handle edit document
  const handleEditDocument = (document: StoredDocument) => {
    dispatch(setActiveDocument(document));
    if (onEditDocument) {
      onEditDocument(document);
    }
  };
  
  // Handle delete document
  const handleDeleteDocument = async (document: StoredDocument) => {
    setDocumentToDelete(null);
    
    try {
      await dispatch(deleteDocument({ 
        documentId: document.id, 
        workspaceId 
      })).unwrap();
      
      toast({
        title: 'Document deleted',
        description: `"${document.title}" has been deleted.`,
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: String(error),
        variant: 'destructive',
      });
    }
  };
  
  // Format bytes to human-readable size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Format date to locale string
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };
  
  // Get file type icon based on document type
  const getFileIcon = (type: string) => {
    return <File className="h-4 w-4" />;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Manage your uploaded documents
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8 w-[200px] sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSearch}
              disabled={isLoading}
            >
              Search
            </Button>
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetSearch}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <File className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <h3 className="text-lg font-medium">No documents found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'No documents match your search query' : 'Upload documents to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {getFileIcon(document.metadata?.type || 'unknown')}
                        <span className="ml-2">{document.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{(document.metadata?.type || 'unknown').toUpperCase()}</TableCell>
                    <TableCell>{formatFileSize(document.metadata.fileSize)}</TableCell>
                    <TableCell>{formatDate(String(document.createdAt))}</TableCell>
                    <TableCell>v{document.metadata?.version || '1'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewDocument(document)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditDocument(document)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => setDocumentToDelete(document)}
                          >
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
      </CardContent>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              "{documentToDelete?.title}" from your workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => documentToDelete && handleDeleteDocument(documentToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}