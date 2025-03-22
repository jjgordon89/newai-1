import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDocument, updateDocument } from '@/redux/slices/apiDocumentsSlice';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft, Edit, Clock } from 'lucide-react';

export default function DocumentDetailsPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const { activeDocument, isLoading, error } = useAppSelector((state) => state.apiDocuments);
  
  // Fetch document details when component mounts
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
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/documents')} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </Button>
      </div>
      
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
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
      ) : activeDocument ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl">{activeDocument.title}</CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <Clock className="h-4 w-4 mr-1" />
                  Created: {formatDate(activeDocument.createdAt)} | 
                  Updated: {formatDate(activeDocument.updatedAt)}
                </CardDescription>
              </div>
              <Button onClick={() => navigate(`/document-edit/${documentId}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="prose max-w-none">
                {activeDocument.content.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Document metadata card */}
          <Card>
            <CardHeader>
              <CardTitle>Document Metadata</CardTitle>
              <CardDescription>
                Additional information about this document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Document ID</h3>
                  <p className="mt-1">{activeDocument.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Owner ID</h3>
                  <p className="mt-1">{activeDocument.ownerId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="mt-1">{formatDate(activeDocument.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p className="mt-1">{formatDate(activeDocument.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/documents')}>
                Back to Documents
              </Button>
              <Button onClick={() => navigate(`/document-edit/${documentId}`)}>
                Edit Document
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Document Not Found</CardTitle>
            <CardDescription>
              The requested document could not be found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The document you are looking for may have been moved or deleted.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/documents')}>
              Return to Documents
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}