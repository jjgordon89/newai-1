import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDocuments, createDocument, deleteDocument, setActiveDocument } from '@/redux/slices/apiDocumentsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, Edit, Eye, RefreshCw } from 'lucide-react';

export default function DocumentListAPI() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  // Get documents from Redux store
  const { documents, isLoading, error } = useAppSelector((state) => state.apiDocuments);
  
  // Local state for new document form
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [newDocumentContent, setNewDocumentContent] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  
  // Fetch documents when component mounts
  useEffect(() => {
    dispatch(fetchDocuments())
      .unwrap()
      .catch((error) => {
        toast({
          title: 'Error',
          description: `Failed to fetch documents: ${error}`,
          variant: 'destructive',
        });
      });
  }, [dispatch, toast]);
  
  // Handle new document creation
  const handleCreateDocument = async () => {
    if (!newDocumentTitle.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Document title is required',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await dispatch(createDocument({ 
        title: newDocumentTitle, 
        content: newDocumentContent 
      })).unwrap();
      
      // Reset form and close dialog
      setNewDocumentTitle('');
      setNewDocumentContent('');
      setIsCreateDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Document created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to create document: ${error}`,
        variant: 'destructive',
      });
    }
  };
  
  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    try {
      await dispatch(deleteDocument(documentId)).unwrap();
      
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete document: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setDocumentToDelete(null);
    }
  };
  
  // Handle viewing a document
  const handleViewDocument = (document: any) => {
    dispatch(setActiveDocument(document));
    navigate(`/document-details/${document.id}`);
  };
  
  // Handle refreshing the document list
  const handleRefresh = () => {
    dispatch(fetchDocuments())
      .unwrap()
      .then(() => {
        toast({
          title: 'Success',
          description: 'Documents refreshed',
        });
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: `Failed to refresh documents: ${error}`,
          variant: 'destructive',
        });
      });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Manage your documents</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                  <DialogDescription>
                    Enter the details for your new document
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Document Title"
                      value={newDocumentTitle}
                      onChange={(e) => setNewDocumentTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Document content..."
                      rows={5}
                      value={newDocumentContent}
                      onChange={(e) => setNewDocumentContent(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateDocument} disabled={isLoading}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
            Error: {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No documents found. Create your first document!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">{document.title}</TableCell>
                  <TableCell>{new Date(document.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(document.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDocument(document)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          dispatch(setActiveDocument(document));
                          navigate(`/document-edit/${document.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog open={documentToDelete === document.id} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDocumentToDelete(document.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the document.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleDeleteDocument(document.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}