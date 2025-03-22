import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  performWebSearch,
  clearSearchResults,
  changePreferredEngine,
  checkSearchConfiguration
} from '@/redux/slices/webSearchSlice';
import { SearchEngine } from '@/lib/webSearchService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  AlertCircle, 
  Loader2, 
  RefreshCcw, 
  Globe, 
  Library,
  Clock, 
  Settings,
  Trash 
} from 'lucide-react';

export function WebSearch() {
  const dispatch = useAppDispatch();
  const { 
    results, 
    recentQueries, 
    formattedContext, 
    preferredEngine, 
    isConfigured, 
    isSearching, 
    error, 
    searchHistory 
  } = useAppSelector(state => state.webSearch);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'simple' | 'advanced'>('simple');
  const [maxResults, setMaxResults] = useState(5);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'results' | 'history' | 'settings'>('results');
  
  // Check if search is configured
  useEffect(() => {
    dispatch(checkSearchConfiguration());
  }, [dispatch]);
  
  // Handle search
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await dispatch(performWebSearch({
        query: searchQuery,
        maxResults,
        timeRange
      }));
    }
  };
  
  // Handle key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Handle changing search engine
  const handleEngineChange = (engine: string) => {
    dispatch(changePreferredEngine(engine as SearchEngine));
  };
  
  // Handle using a recent query
  const handleUseRecentQuery = (query: string) => {
    setSearchQuery(query);
    dispatch(performWebSearch({
      query,
      maxResults,
      timeRange
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Web Search
        </CardTitle>
        <CardDescription>
          Search the web and incorporate results into your application
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="results" onValueChange={(value) => setActiveTab(value as any)}>
        <div className="px-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="results">Search Results</TabsTrigger>
            <TabsTrigger value="history">Search History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="results" className="p-0">
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {!isConfigured && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Web search functionality requires API keys. Please configure them in the Settings tab.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Search input */}
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search the web..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !searchQuery.trim() || !isConfigured}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  disabled={results.length === 0}
                  onClick={() => dispatch(clearSearchResults())}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              {searchMode === 'advanced' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Max Results
                    </label>
                    <Select 
                      value={maxResults.toString()} 
                      onValueChange={(value) => setMaxResults(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Number of results" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 results</SelectItem>
                        <SelectItem value="5">5 results</SelectItem>
                        <SelectItem value="10">10 results</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Time Range
                    </label>
                    <Select 
                      value={timeRange} 
                      onValueChange={(value) => setTimeRange(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Past day</SelectItem>
                        <SelectItem value="week">Past week</SelectItem>
                        <SelectItem value="month">Past month</SelectItem>
                        <SelectItem value="year">Past year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-2">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-xs p-0 h-auto" 
                  onClick={() => setSearchMode(mode => mode === 'simple' ? 'advanced' : 'simple')}
                >
                  {searchMode === 'simple' ? 'Advanced Search' : 'Simple Search'}
                </Button>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Using</span>
                  <Badge variant="secondary" className="text-xs">
                    {preferredEngine === 'google' ? 'Google' :
                     preferredEngine === 'brave' ? 'Brave' :
                     preferredEngine === 'duckduckgo' ? 'DuckDuckGo' :
                     preferredEngine === 'serpapi' ? 'SERP API' : 
                     'Custom Search'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Recent queries */}
            {recentQueries.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {recentQueries.map((query, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUseRecentQuery(query)}
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search results */}
            {results.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">Search Results</h3>
                  <Badge variant="outline">{results.length} results</Badge>
                </div>
                
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <h4 className="font-medium text-primary">
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline"
                        >
                          {result.title}
                        </a>
                      </h4>
                      <p className="text-xs text-muted-foreground mb-1">
                        {result.url.length > 60 
                          ? `${result.url.substring(0, 60)}...` 
                          : result.url}
                      </p>
                      <p className="text-sm">{result.snippet}</p>
                      {result.publishedDate && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {result.publishedDate}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              !isSearching && (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <Search className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Enter a search query to find information on the web
                  </p>
                </div>
              )
            )}
            
            {/* Context for LLM */}
            {formattedContext && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Formatted Context for LLM</h3>
                <div className="p-3 border rounded-md bg-muted/20 whitespace-pre-wrap font-mono text-xs overflow-auto max-h-40">
                  {formattedContext}
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="history" className="p-0">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-3">Search History</h3>
            
            {searchHistory.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-md">
                <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No search history yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchHistory.map((item, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-md flex justify-between items-center cursor-pointer hover:bg-muted/30"
                    onClick={() => handleUseRecentQuery(item.query)}
                  >
                    <div>
                      <div className="font-medium">{item.query}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()} • {item.resultCount} results
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="settings" className="p-0">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-3">Search Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Preferred Search Engine
                </label>
                <Select 
                  value={preferredEngine} 
                  onValueChange={handleEngineChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select search engine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="brave">Brave</SelectItem>
                    <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                    <SelectItem value="serpapi">SERP API</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select your preferred search engine for web searches
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  API Key Configuration
                </label>
                <p className="text-sm mb-2">
                  {isConfigured ? (
                    <span className="text-green-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Search API key is configured
                    </span>
                  ) : (
                    <span className="text-amber-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      No search API key configured
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Configure your search API keys in the API Key Manager
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Default Search Options
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Max Results
                    </label>
                    <Select 
                      value={maxResults.toString()} 
                      onValueChange={(value) => setMaxResults(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Number of results" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 results</SelectItem>
                        <SelectItem value="5">5 results</SelectItem>
                        <SelectItem value="10">10 results</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Time Range
                    </label>
                    <Select 
                      value={timeRange} 
                      onValueChange={(value) => setTimeRange(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Past day</SelectItem>
                        <SelectItem value="week">Past week</SelectItem>
                        <SelectItem value="month">Past month</SelectItem>
                        <SelectItem value="year">Past year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between px-6 py-4 border-t">
        <p className="text-xs text-muted-foreground">
          Web search functionality requires API keys for the selected provider
        </p>
        <div>
          <Badge variant="outline" className="text-xs">
            {isConfigured ? 'Configured' : 'Not Configured'}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}