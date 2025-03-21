import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, FileText, Bot, ExternalLink } from 'lucide-react';
import { vectorSearch } from '@/lib/lanceDbService';
import { enhancedRagService } from '@/lib/enhancedRagService';

interface LanceDbSearchPanelProps {
  workspaceId: string;
}

export const LanceDbSearchPanel: React.FC<LanceDbSearchPanelProps> = ({ workspaceId }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [aiContext, setAiContext] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Handle search with LanceDB
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    setAiContext('');
    
    try {
      // Perform vector search using LanceDB
      const results = await vectorSearch(
        workspaceId,
        searchQuery,
        5,  // Top 5 results
        0.7  // Similarity threshold
      );
      
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your search query or add more documents to your knowledge base.",
        });
      }
    } catch (error) {
      console.error("Error searching vector database:", error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching the vector database.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Generate AI context
  const generateAiContext = async () => {
    if (searchResults.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      // Convert search results to RAG documents format
      const ragDocs = searchResults.map(result => ({
        id: result.id,
        content: result.text,
        metadata: {
          ...result.metadata,
          title: result.documentName,
          similarity: result.similarity * 100 // Convert to percentage
        }
      }));
      
      // Generate enhanced context
      const retrievalResult = {
        results: ragDocs,
        executionTime: 0
      };
      
      const context = await enhancedRagService.getEnhancedContext(retrievalResult);
      setAiContext(context);
      
    } catch (error) {
      console.error("Error generating AI context:", error);
      toast({
        title: "Generation Error",
        description: "An error occurred while generating the AI context.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5" />
          Vector Search
        </CardTitle>
        <CardDescription>
          Search your document knowledge base using AI-powered semantic search
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
        
        {searchResults.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Search Results</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateAiContext}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <Bot className="h-3.5 w-3.5 mr-2" />
                    Generate AI Context
                  </>
                )}
              </Button>
            </div>
            
            <ScrollArea className="h-[200px] border rounded-md p-4">
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{result.documentName}</span>
                      </div>
                      <Badge variant="outline">
                        {Math.round(result.similarity * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.text}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
        
        {aiContext && (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">AI Context</h3>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                Send to Chat
              </Button>
            </div>
            
            <div className="border rounded-md p-4 bg-muted/50">
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Generated Context</span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{aiContext}</p>
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Powered by LanceDB vector database
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};