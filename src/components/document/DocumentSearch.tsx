import React, { useState, useEffect } from 'react';
import { HuggingFaceEmbeddingGenerator } from '@/lib/huggingFaceEmbeddings';
import { semanticSearch, hybridSearch, SearchResultItem } from '@/lib/vectorSearchService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, FileText, Search, HelpCircle, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface DocumentSearchProps {
  workspaceId: string;
  embeddingModel?: string;
  onDocumentSelect?: (document: SearchResultItem) => void;
}

/**
 * Document Search Component
 * 
 * Provides a UI for searching documents using vector and hybrid search
 */
export default function DocumentSearch({
  workspaceId,
  embeddingModel = 'BAAI/bge-small-en-v1.5',
  onDocumentSelect
}: DocumentSearchProps) {
  // State for search
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'semantic' | 'hybrid'>('hybrid');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for search settings
  const [limit, setLimit] = useState(5);
  const [threshold, setThreshold] = useState(0.65);
  const [keywordWeight, setKeywordWeight] = useState(0.3);
  const [exactMatch, setExactMatch] = useState(false);
  
  const { toast } = useToast();
  
  // Initialize embedding generator
  const embeddingGenerator = React.useMemo(() => 
    new HuggingFaceEmbeddingGenerator(embeddingModel)
  , [embeddingModel]);
  
  // Perform search
  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: 'Empty Query',
        description: 'Please enter a search query',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      let searchResults: SearchResultItem[];
      
      if (searchType === 'semantic') {
        // Perform semantic search
        searchResults = await semanticSearch({
          query,
          workspaceId,
          limit,
          threshold
        });
      } else {
        // Perform hybrid search
        searchResults = await hybridSearch({
          query,
          workspaceId,
          limit,
          threshold,
          keywordWeight,
          exactMatch
        });
      }
      
      setResults(searchResults);
      
      // Show toast with result count
      toast({
        title: 'Search Complete',
        description: `Found ${searchResults.length} result${searchResults.length === 1 ? '' : 's'}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Search Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle document selection
  const handleDocumentClick = (document: SearchResultItem) => {
    onDocumentSelect?.(document);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Document Search</CardTitle>
              <CardDescription>
                Search through your documents using AI-powered semantic search
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Search Settings</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="limit">Results Limit</Label>
                      <span className="text-sm">{limit}</span>
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
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="threshold">Similarity Threshold</Label>
                      <span className="text-sm">{threshold.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="threshold"
                      min={0.1}
                      max={0.99}
                      step={0.01}
                      value={[threshold]}
                      onValueChange={(value) => setThreshold(value[0])}
                    />
                  </div>
                  
                  {searchType === 'hybrid' && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="keywordWeight">Keyword Weight</Label>
                          <span className="text-sm">{keywordWeight.toFixed(2)}</span>
                        </div>
                        <Slider
                          id="keywordWeight"
                          min={0}
                          max={1}
                          step={0.05}
                          value={[keywordWeight]}
                          onValueChange={(value) => setKeywordWeight(value[0])}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="exactMatch"
                          checked={exactMatch}
                          onCheckedChange={setExactMatch}
                        />
                        <Label htmlFor="exactMatch">Require Exact Matches</Label>
                      </div>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isSearching}
                />
              </div>
              <Tabs
                value={searchType}
                onValueChange={(value) => setSearchType(value as 'semantic' | 'hybrid')}
                className="w-32"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="semantic">Semantic</TabsTrigger>
                  <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  'Search'
                )}
              </Button>
            </div>
          </form>
          
          {/* Search explanation */}
          <div className="mt-2 text-xs text-muted-foreground flex items-center">
            <HelpCircle className="h-3 w-3 mr-1" />
            {searchType === 'semantic' 
              ? 'Semantic search finds documents based on meaning, not just keywords.' 
              : 'Hybrid search combines semantic understanding with keyword matching.'}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="link" className="h-4 px-1">Learn more</Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="text-xs">
                    <strong>Semantic Search:</strong> Uses AI embeddings to understand the meaning of your query, not just the exact words.
                    <br /><br />
                    <strong>Hybrid Search:</strong> Combines semantic understanding with traditional keyword matching for better results.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
      
      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Results display */}
      {results.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {results.length} result{results.length === 1 ? '' : 's'} for "{query}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors"
                  onClick={() => handleDocumentClick(result)}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium">{result.documentName || `Document ${index + 1}`}</h3>
                      
                      {/* Similarity score display */}
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1 mb-2">
                        <span>Similarity: {(result.similarity * 100).toFixed(1)}%</span>
                        
                        {result.keywordScore !== undefined && (
                          <span>• Keyword: {(result.keywordScore * 100).toFixed(1)}%</span>
                        )}
                        
                        {result.combinedScore !== undefined && (
                          <span>• Combined: {(result.combinedScore * 100).toFixed(1)}%</span>
                        )}
                      </div>
                      
                      {/* Content preview */}
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {result.text}
                      </p>
                      
                      {/* Highlights if available */}
                      {result.highlights && result.highlights.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium">Highlights:</p>
                          {result.highlights.map((highlight, i) => (
                            <p key={i} className="text-xs bg-yellow-50 p-1 rounded">
                              {highlight}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : query && !isSearching && !error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-muted p-3">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No results found</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              No documents matching your query were found. Try adjusting your search terms or settings.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}