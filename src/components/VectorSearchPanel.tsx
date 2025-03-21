import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, Filter, Search, Sliders } from "lucide-react";
import {
  semanticSearch,
  hybridSearch,
  SearchResultItem,
  VectorSearchParams,
  HybridSearchParams,
} from "../lib/vectorSearchService";

interface VectorSearchPanelProps {
  workspaceId: string;
  onResultSelect?: (result: SearchResultItem) => void;
}

export default function VectorSearchPanel({
  workspaceId,
  onResultSelect,
}: VectorSearchPanelProps) {
  // Search state
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"semantic" | "hybrid">(
    "semantic",
  );
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search parameters
  const [limit, setLimit] = useState(5);
  const [threshold, setThreshold] = useState(0.7);
  const [keywordWeight, setKeywordWeight] = useState(0.3);
  const [exactMatch, setExactMatch] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      let searchResults: SearchResultItem[];

      if (searchMode === "semantic") {
        const params: VectorSearchParams = {
          query,
          workspaceId,
          limit,
          threshold,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        };

        searchResults = await semanticSearch(params);
      } else {
        const params: HybridSearchParams = {
          query,
          workspaceId,
          limit,
          threshold,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
          keywordWeight,
          exactMatch,
        };

        searchResults = await hybridSearch(params);
      }

      setResults(searchResults);
    } catch (err) {
      setError(
        `Search failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add a filter
  const addFilter = () => {
    if (!filterField || !filterValue) return;

    setFilters((prev) => ({
      ...prev,
      [filterField]: filterValue,
    }));

    setFilterField("");
    setFilterValue("");
  };

  // Remove a filter
  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle>Vector Search</CardTitle>
          <CardDescription>
            Search documents using semantic similarity and filters
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            value={searchMode}
            onValueChange={(v) => setSearchMode(v as "semantic" | "hybrid")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="semantic">Semantic Search</TabsTrigger>
              <TabsTrigger value="hybrid">Hybrid Search</TabsTrigger>
            </TabsList>

            <TabsContent value="semantic" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="threshold">
                  Similarity Threshold: {threshold.toFixed(2)}
                </Label>
                <Slider
                  id="threshold"
                  min={0.5}
                  max={0.95}
                  step={0.05}
                  value={[threshold]}
                  onValueChange={(values) => setThreshold(values[0])}
                />
              </div>
            </TabsContent>

            <TabsContent value="hybrid" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywordWeight">
                  Keyword Weight: {keywordWeight.toFixed(2)}
                </Label>
                <Slider
                  id="keywordWeight"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[keywordWeight]}
                  onValueChange={(values) => setKeywordWeight(values[0])}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="exactMatch"
                  checked={exactMatch}
                  onCheckedChange={setExactMatch}
                />
                <Label htmlFor="exactMatch">Exact Match</Label>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "Searching..." : <Search className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="limit">Results:</Label>
                <Input
                  id="limit"
                  type="number"
                  className="w-16"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters{" "}
                {Object.keys(filters).length > 0 &&
                  `(${Object.keys(filters).length})`}
              </Button>
            </div>

            {showFilters && (
              <div className="p-4 border rounded-md space-y-4 bg-muted/20">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="filterField" className="mb-2 block">
                      Field
                    </Label>
                    <Input
                      id="filterField"
                      placeholder="Field name"
                      value={filterField}
                      onChange={(e) => setFilterField(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="filterValue" className="mb-2 block">
                      Value
                    </Label>
                    <Input
                      id="filterValue"
                      placeholder="Value"
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={addFilter}
                    disabled={!filterField || !filterValue}
                  >
                    Add
                  </Button>
                </div>

                {Object.keys(filters).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => (
                      <Badge
                        key={key}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {key}: {value.toString()}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeFilter(key)}
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 my-2 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden mt-4">
        <ScrollArea className="h-full">
          {results.length > 0 ? (
            <div className="space-y-4 p-1">
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onResultSelect && onResultSelect(result)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        {result.documentName}
                      </CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {searchMode === "hybrid" &&
                        result.combinedScore !== undefined
                          ? `Score: ${(result.combinedScore * 100).toFixed(1)}%`
                          : `Similarity: ${(result.similarity * 100).toFixed(1)}%`}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.text.substring(0, 150)}...
                    </p>

                    {result.highlights && result.highlights.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {result.highlights.map((highlight, i) => (
                          <p
                            key={i}
                            className="text-xs bg-primary/10 p-1 rounded"
                          >
                            {highlight}
                          </p>
                        ))}
                      </div>
                    )}

                    {result.metadata &&
                      Object.keys(result.metadata).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(result.metadata)
                            .filter(
                              ([key]) =>
                                !["content", "text", "embedding"].includes(key),
                            )
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <Badge
                                key={key}
                                variant="outline"
                                className="text-xs"
                              >
                                {key}:{" "}
                                {typeof value === "string"
                                  ? value.substring(0, 20)
                                  : String(value)}
                              </Badge>
                            ))}

                          {Object.keys(result.metadata).length > 3 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 rounded-full px-2 text-xs"
                                >
                                  +{Object.keys(result.metadata).length - 3}{" "}
                                  more
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="space-y-1">
                                  {Object.entries(result.metadata)
                                    .filter(
                                      ([key]) =>
                                        ![
                                          "content",
                                          "text",
                                          "embedding",
                                        ].includes(key),
                                    )
                                    .slice(3)
                                    .map(([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex justify-between"
                                      >
                                        <span className="font-medium">
                                          {key}:
                                        </span>
                                        <span className="text-muted-foreground">
                                          {typeof value === "string"
                                            ? value.substring(0, 30)
                                            : String(value)}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {isSearching
                ? "Searching..."
                : query
                  ? "No results found"
                  : "Enter a search query to find documents"}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
