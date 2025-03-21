import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { webSearchIntegration } from "@/lib/integrations";
import { WebSearchResult } from "@/lib/integrations/webSearchIntegration";
import {
  Globe,
  Search,
  Shield,
  Settings,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WebSearchIntegrationPanel() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchProvider, setSearchProvider] = useState("brave");
  const [safeSearch, setSafeSearch] = useState(true);
  const [searchLimit, setSearchLimit] = useState(5);
  const [searchResults, setSearchResults] = useState<WebSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [formattedContext, setFormattedContext] = useState("");

  // API key states
  const [braveApiKey, setBraveApiKey] = useState("");
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [serpApiKey, setSerpApiKey] = useState("");
  const [duckDuckGoApiKey, setDuckDuckGoApiKey] = useState("");

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      // Set API key for the selected provider if provided
      if (searchProvider === "brave" && braveApiKey) {
        webSearchIntegration.setApiKey("brave", braveApiKey);
      } else if (searchProvider === "google" && googleApiKey) {
        webSearchIntegration.setApiKey("google", googleApiKey);
      } else if (searchProvider === "serp" && serpApiKey) {
        webSearchIntegration.setApiKey("serp", serpApiKey);
      } else if (searchProvider === "duckduckgo" && duckDuckGoApiKey) {
        webSearchIntegration.setApiKey("duckduckgo", duckDuckGoApiKey);
      }

      // Set default provider
      webSearchIntegration.setDefaultProvider(searchProvider as any);

      // Execute search
      const results = await webSearchIntegration.search({
        query: searchQuery,
        provider: searchProvider as any,
        safeSearch,
        resultCount: searchLimit,
      });

      setSearchResults(results);

      // Format results as context
      const context = webSearchIntegration.formatResultsAsContext(results);
      setFormattedContext(context);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(error.message || "Failed to perform search");
    } finally {
      setIsSearching(false);
    }
  };

  // Save API keys
  const saveApiKeys = () => {
    try {
      if (braveApiKey) webSearchIntegration.setApiKey("brave", braveApiKey);
      if (googleApiKey) webSearchIntegration.setApiKey("google", googleApiKey);
      if (serpApiKey) webSearchIntegration.setApiKey("serp", serpApiKey);
      if (duckDuckGoApiKey)
        webSearchIntegration.setApiKey("duckduckgo", duckDuckGoApiKey);

      // Clear form
      setBraveApiKey("");
      setGoogleApiKey("");
      setSerpApiKey("");
      setDuckDuckGoApiKey("");

      alert("API keys saved successfully!");
    } catch (error) {
      console.error("Error saving API keys:", error);
      alert("Failed to save API keys");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">
            <Search className="mr-2 h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Web Search</CardTitle>
              <CardDescription>
                Search the web using various providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="search-provider">Search Provider</Label>
                <Select
                  value={searchProvider}
                  onValueChange={setSearchProvider}
                >
                  <SelectTrigger id="search-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brave">Brave Search</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                    <SelectItem value="serp">SerpAPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <div className="flex space-x-2">
                  <Input
                    id="search-query"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter your search query"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
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

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="safe-search"
                    checked={safeSearch}
                    onCheckedChange={setSafeSearch}
                  />
                  <Label htmlFor="safe-search" className="cursor-pointer">
                    <div className="flex items-center">
                      <Shield className="mr-1 h-4 w-4 text-muted-foreground" />
                      Safe Search
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="search-limit">Results:</Label>
                  <Select
                    value={searchLimit.toString()}
                    onValueChange={(value) => setSearchLimit(parseInt(value))}
                  >
                    <SelectTrigger id="search-limit" className="w-20">
                      <SelectValue placeholder="5" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {searchError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {searchResults.length} results for "{searchQuery}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="results">
                  <TabsList>
                    <TabsTrigger value="results">Results</TabsTrigger>
                    <TabsTrigger value="context">LLM Context</TabsTrigger>
                  </TabsList>

                  <TabsContent value="results" className="mt-4">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {searchResults.map((result, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <div className="flex justify-between items-start">
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
                              <Badge variant="outline">{result.source}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {result.url}
                            </p>
                            <p className="mt-2">{result.snippet}</p>
                            {result.publishedDate && (
                              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                {result.publishedDate}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
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
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Configure API keys for different search providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brave-api-key">Brave Search API Key</Label>
                <Input
                  id="brave-api-key"
                  value={braveApiKey}
                  onChange={(e) => setBraveApiKey(e.target.value)}
                  placeholder="Enter Brave Search API key"
                  type="password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google-api-key">Google Search API Key</Label>
                <Input
                  id="google-api-key"
                  value={googleApiKey}
                  onChange={(e) => setGoogleApiKey(e.target.value)}
                  placeholder="Enter Google Search API key"
                  type="password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duckduckgo-api-key">DuckDuckGo API Key</Label>
                <Input
                  id="duckduckgo-api-key"
                  value={duckDuckGoApiKey}
                  onChange={(e) => setDuckDuckGoApiKey(e.target.value)}
                  placeholder="Enter DuckDuckGo API key"
                  type="password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serp-api-key">SerpAPI Key</Label>
                <Input
                  id="serp-api-key"
                  value={serpApiKey}
                  onChange={(e) => setSerpApiKey(e.target.value)}
                  placeholder="Enter SerpAPI key"
                  type="password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveApiKeys}>Save API Keys</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
              <CardDescription>
                Configure default search settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-provider">
                  Default Search Provider
                </Label>
                <Select
                  value={searchProvider}
                  onValueChange={setSearchProvider}
                >
                  <SelectTrigger id="default-provider">
                    <SelectValue placeholder="Select default provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brave">Brave Search</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                    <SelectItem value="serp">SerpAPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="default-safe-search"
                  checked={safeSearch}
                  onCheckedChange={setSafeSearch}
                />
                <Label htmlFor="default-safe-search" className="cursor-pointer">
                  Enable Safe Search by default
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-limit">Default Result Limit</Label>
                <Select
                  value={searchLimit.toString()}
                  onValueChange={(value) => setSearchLimit(parseInt(value))}
                >
                  <SelectTrigger id="default-limit">
                    <SelectValue placeholder="Select default limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 results</SelectItem>
                    <SelectItem value="5">5 results</SelectItem>
                    <SelectItem value="10">10 results</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  webSearchIntegration.setDefaultProvider(
                    searchProvider as any,
                  );
                  alert("Default settings saved!");
                }}
              >
                Save Default Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
