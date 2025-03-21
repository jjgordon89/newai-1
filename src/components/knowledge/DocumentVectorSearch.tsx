import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Sliders, Database } from "lucide-react";
import { HuggingFaceEmbeddingGenerator } from "@/lib/huggingFaceEmbeddings";
import { vectorSearch } from "@/lib/lanceDbService";

interface SearchResult {
  id: string;
  text: string;
  documentName: string;
  similarity: number;
  metadata?: Record<string, any>;
}

const DocumentVectorSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(5);
  const [threshold, setThreshold] = useState(70);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      // Perform vector search
      const searchResults = await vectorSearch(
        "default", // Use default workspace
        query,
        limit,
        threshold / 100, // Convert from percentage to 0-1 scale
      );

      setResults(searchResults);
    } catch (err) {
      console.error("Error searching documents:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during search",
      );

      // Generate mock results for demo purposes
      const mockResults: SearchResult[] = [
        {
          id: "doc_1",
          text: "Hugging Face provides state-of-the-art NLP models and tools for developers.",
          documentName: "Hugging Face Documentation",
          similarity: 0.92,
          metadata: { source: "documentation", type: "text" },
        },
        {
          id: "doc_2",
          text: "Embedding models convert text into numerical vectors that capture semantic meaning.",
          documentName: "Vector Embeddings Guide",
          similarity: 0.87,
          metadata: { source: "documentation", type: "text" },
        },
        {
          id: "doc_3",
          text: "BGE (BAAI General Embeddings) is a family of embedding models that excel at retrieval tasks.",
          documentName: "BGE Model Documentation",
          similarity: 0.81,
          metadata: { source: "documentation", type: "text" },
        },
      ];

      setResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Vector Search
          </CardTitle>
          <CardDescription>
            Search for documents using semantic similarity with LanceDB
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter your search query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </span>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="limit">Results Limit: {limit}</Label>
                </div>
                <Slider
                  id="limit"
                  min={1}
                  max={20}
                  step={1}
                  value={[limit]}
                  onValueChange={(value) => setLimit(value[0])}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="threshold">
                    Similarity Threshold: {threshold}%
                  </Label>
                </div>
                <Slider
                  id="threshold"
                  min={0}
                  max={100}
                  step={5}
                  value={[threshold]}
                  onValueChange={(value) => setThreshold(value[0])}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Search Results</h3>

              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  {isSearching ? (
                    <span className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <FileText className="h-12 w-12 mb-2 opacity-20" />
                      <p>
                        No results found. Try a different query or adjust the
                        similarity threshold.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {results.map((result) => (
                      <div key={result.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm">
                            {result.documentName}
                          </h4>
                          <Badge variant="outline">
                            {(result.similarity * 100).toFixed(1)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.text.length > 200
                            ? `${result.text.substring(0, 200)}...`
                            : result.text}
                        </p>
                        {result.metadata && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(result.metadata)
                              .filter(([key]) => key !== "title")
                              .slice(0, 3)
                              .map(([key, value]) => (
                                <Badge
                                  key={key}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {key}: {String(value).substring(0, 20)}
                                </Badge>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            {results.length > 0 && `Found ${results.length} results`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResults([])}
            disabled={results.length === 0}
          >
            Clear Results
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentVectorSearch;
