import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import {
  findSimilarDocuments,
  SearchResultItem,
} from "../lib/vectorSearchService";

interface SimilarDocumentsPanelProps {
  workspaceId: string;
  documentId: string;
  onDocumentSelect?: (document: SearchResultItem) => void;
}

export default function SimilarDocumentsPanel({
  workspaceId,
  documentId,
  onDocumentSelect,
}: SimilarDocumentsPanelProps) {
  const [similarDocuments, setSimilarDocuments] = useState<SearchResultItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    if (documentId) {
      loadSimilarDocuments();
    }
  }, [documentId, limit]);

  const loadSimilarDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await findSimilarDocuments(
        workspaceId,
        documentId,
        limit,
      );
      setSimilarDocuments(results);
    } catch (err) {
      setError(
        `Failed to load similar documents: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setSimilarDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setLimit((prev) => prev + 5);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Similar Documents</CardTitle>
        <CardDescription>
          Documents semantically similar to the current document
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="p-4 mb-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-220px)]">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
            </div>
          ) : similarDocuments.length > 0 ? (
            <div className="space-y-4">
              {similarDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onDocumentSelect && onDocumentSelect(doc)}
                >
                  <CardHeader className="p-3 pb-1">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm">
                        {doc.documentName}
                      </CardTitle>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {(doc.similarity * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3 pt-1">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {doc.text.substring(0, 120)}...
                    </p>

                    {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(doc.metadata)
                          .filter(
                            ([key]) =>
                              !["content", "text", "embedding"].includes(key),
                          )
                          .slice(0, 2)
                          .map(([key, value]) => (
                            <Badge
                              key={key}
                              variant="secondary"
                              className="text-xs"
                            >
                              {key}:{" "}
                              {typeof value === "string"
                                ? value.substring(0, 15)
                                : String(value)}
                            </Badge>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={loadMore}
              >
                Load More
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              No similar documents found
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
