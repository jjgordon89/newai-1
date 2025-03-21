import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, AlertCircle, CheckCircle } from "lucide-react";
import {
  searchWeb,
  formatSearchResultsAsContext,
} from "@/lib/webSearchService";

export default function WebSearchTester() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [formattedContext, setFormattedContext] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const results = await searchWeb(query, 5);
      setSearchResults(results);
      const context = formatSearchResultsAsContext(results);
      setFormattedContext(context);
    } catch (err) {
      console.error("Search error:", err);
      setError(
        "Failed to perform web search. Please check your API keys and try again.",
      );
      setSearchResults([]);
      setFormattedContext("");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Web Search Integration</CardTitle>
        <CardDescription>
          Test web search functionality and see how it can be used in your
          application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-query">Search Query</Label>
              <Input
                id="search-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a search query"
                disabled={isSearching}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {searchResults.length > 0 && (
            <Tabs defaultValue="results">
              <TabsList>
                <TabsTrigger value="results">Search Results</TabsTrigger>
                <TabsTrigger value="context">Formatted Context</TabsTrigger>
              </TabsList>
              <TabsContent value="results" className="mt-4">
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <h3 className="font-medium">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {result.title}
                        </a>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {result.url}
                      </p>
                      <p className="mt-2">{result.snippet}</p>
                      {result.publishedDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Published: {result.publishedDate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="context" className="mt-4">
                <div className="border rounded-md p-4 bg-muted/50">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {formattedContext}
                  </pre>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This formatted context can be used as input to an LLM to
                  provide web search results as part of a RAG system.
                </p>
              </TabsContent>
            </Tabs>
          )}

          {!isSearching && searchResults.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mb-4 opacity-20" />
              <p>
                Enter a search query and click Search to test the web search
                integration
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
