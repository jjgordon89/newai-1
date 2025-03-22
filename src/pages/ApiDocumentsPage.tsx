import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import DocumentListAPI from '@/components/document/DocumentListAPI';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ApiDocumentsPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Documents Management</CardTitle>
            <CardDescription>
              These documents are stored in the backend database using our API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This page demonstrates API integration with the backend server.
              You can create, view, edit, and delete documents with proper authentication.
            </p>
          </CardContent>
        </Card>
        
        <DocumentListAPI />
      </div>
    </div>
  );
}