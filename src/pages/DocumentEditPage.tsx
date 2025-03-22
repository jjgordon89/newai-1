import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDocument, updateDocument } from '@/redux/slices/apiDocumentsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Clock } from 'lucide-react';

export default function DocumentEditPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  // Get document from Redux store
  const { activeDocument, isLoading, error } = useAppSelector((state) => state.apiDocuments);
  
  // Local state for form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch document when component mounts or documentId changes
  useEffect(() => {
    if (documentId) {
      dispatch(fetchDocument(documentId))
        .unwrap()
        .catch((error) => {
          toast({
            title: 'Error',
            description: `Failed to fetch document: ${error}`,
            variant: 'destructive',
          });
        });
    }
  }, [dispatch, documentId, toast]);
  
  // Update form when document data changes
  useEffect(() => {
    if (activeDocument) {
      setTitle(activeDocument.title);
      setContent(activeDocument.content);
    }
  }, [activeDocument]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentId) return;
    
    // Validate form
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Document title is required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Dispatch update action
      await dispatch(updateDocument({
        documentId,
        updates: { title, content }
      })).unwrap();
      
      toast({
        title: 'Success',
        description: 'Document updated successfully',
      });
      
      // Navigate to document details page
      navigate(`/document-details/${documentId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update document: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/document-details/${documentId}`)} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Document
        </Button>
      </div>
      
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was an error loading the document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 text-red-800 p-3 rounded-md">
              {error}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/documents')}>
              Return to Documents
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Edit Document</CardTitle>
              <CardDescription>
                Make changes to your document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document Title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Document content..."
                  className="min-h-[200px]"
                />
              </div>
              
              {activeDocument && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Last updated: {new Date(activeDocument.updatedAt).toLocaleString()}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/document-details/${documentId}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || isLoading}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}