import { ChevronDown, ChevronUp, BookOpen, FileType, Globe, ExternalLink, ScanSearch, Lightbulb, ArrowUpRight, Info, Copy, ScrollText, BrainCircuit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Define a proper SourceType for better type safety
type SourceType = {
  id: string;
  text: string;
  type: 'web' | 'document' | 'database' | 'knowledge';
  title?: string;
  url?: string;
  fileType?: string;
  similarity?: number;
  excerpt?: string;
  metadata?: Record<string, any>;
};

interface RagSourcesProps {
  sources: string[] | SourceType[];
}

export function RagSources({ sources }: RagSourcesProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [parsedSources, setParsedSources] = useState<SourceType[]>([]);
  const { toast } = useToast();
  
  // Parse string sources into structured SourceType objects
  useEffect(() => {
    if (!sources || sources.length === 0) return;
    
    // If sources are already SourceType objects
    if (typeof sources[0] !== 'string') {
      setParsedSources(sources as SourceType[]);
      return;
    }
    
    // Parse string sources
    const parsed = (sources as string[]).map((source, index) => {
      const isWeb = source.startsWith('Web:');
      const similarity = extractSimilarity(source);
      const webUrl = extractWebUrl(source);
      
      let fileType = 'txt';
      if (source.toLowerCase().includes('pdf')) fileType = 'pdf';
      else if (source.toLowerCase().includes('csv')) fileType = 'csv';
      else if (source.toLowerCase().includes('xls')) fileType = 'xls';
      else if (source.toLowerCase().includes('md')) fileType = 'md';
      else if (source.toLowerCase().includes('json')) fileType = 'json';
      else if (source.toLowerCase().includes('html')) fileType = 'html';
      
      return {
        id: `source-${index}`,
        text: source,
        type: isWeb ? 'web' : 'document',
        title: isWeb ? source.split('(')[0].trim().replace('Web:', '') : source.split(':')[0],
        url: webUrl,
        fileType: isWeb ? undefined : fileType,
        similarity: similarity,
        excerpt: source.includes('Excerpt:') ? source.split('Excerpt:')[1].trim() : undefined
      } as SourceType;
    });
    
    setParsedSources(parsed);
  }, [sources]);
  
  // No sources to display
  if (!sources || sources.length === 0) {
    return null;
  }
  
  // Extract similarity score if available
  function extractSimilarity(source: string): number | null {
    const match = source.match(/similarity: (\d+\.?\d*)%/);
    return match ? parseFloat(match[1]) : null;
  }

  // Get source URL if it's a web source
  function extractWebUrl(source: string): string | null {
    if (!source.startsWith('Web:')) return null;
    const urlMatch = source.match(/\((https?:\/\/[^)]+)\)/);
    return urlMatch ? urlMatch[1] : null;
  }
  
  // Render the appropriate icon for the source type
  function renderSourceIcon(source: SourceType) {
    if (source.type === 'web') return <Globe className="h-3.5 w-3.5 text-primary" />;
    
    switch(source.fileType?.toLowerCase()) {
      case 'pdf': return <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs flex items-center bg-red-500/10">PDF</Badge>;
      case 'csv': return <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs flex items-center bg-green-500/10">CSV</Badge>;
      case 'xls': return <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs flex items-center bg-green-500/10">XLS</Badge>;
      case 'md': return <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs flex items-center bg-purple-500/10">MD</Badge>;
      case 'json': return <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs flex items-center bg-yellow-500/10">{'{}'}</Badge>;
      case 'html': return <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs flex items-center bg-blue-500/10">HTML</Badge>;
      default: return <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs flex items-center">TXT</Badge>;
    }
  }
  
  // Get color for relevance badge
  function getRelevanceColor(similarity: number) {
    if (similarity >= 90) return "bg-green-500/20 text-green-700 dark:text-green-400";
    if (similarity >= 75) return "bg-primary/20 text-primary";
    if (similarity >= 60) return "bg-amber-500/20 text-amber-700 dark:text-amber-400";
    return "bg-muted text-muted-foreground";
  }
  
  // Sort sources by similarity
  const sortedSources = [...parsedSources].sort((a, b) => {
    return (b.similarity || 0) - (a.similarity || 0);
  });
  
  // Group sources by type
  const webSources = sortedSources.filter(s => s.type === 'web');
  const documentSources = sortedSources.filter(s => s.type === 'document');
  
  // Calculate average relevance
  const averageRelevance = parsedSources.length > 0
    ? parsedSources.reduce((acc, src) => acc + (src.similarity || 0), 0) / parsedSources.length
    : 0;
  
  return (
    <div className="mt-2 text-sm">
      <div className="flex items-center gap-1.5 justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-primary hover:underline"
        >
          <ScanSearch className="h-3.5 w-3.5" />
          <span>
            {sources.length} source{sources.length !== 1 ? 's' : ''}
            {averageRelevance > 0 && (
              <span className="ml-1 text-xs opacity-80">
                (avg. {Math.round(averageRelevance)}% relevant)
              </span>
            )}
          </span>
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
        
        {expanded && (
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      const sourceText = sortedSources.map(s => s.text).join('\n\n');
                      navigator.clipboard.writeText(sourceText);
                      toast({
                        title: "Copied",
                        description: "Source details copied to clipboard"
                      });
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy all sources</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setActiveTab(activeTab === 'list' ? 'grid' : 'list')}
                  >
                    {activeTab === 'list' ?
                      <ScrollText className="h-3 w-3" /> :
                      <BookOpen className="h-3 w-3" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change view</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      {expanded && (
        <div className="mt-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-7 w-full mb-2">
              <TabsTrigger value="list" className="text-xs h-6">List View</TabsTrigger>
              <TabsTrigger value="grid" className="text-xs h-6">Grid View</TabsTrigger>
              <TabsTrigger value="stats" className="text-xs h-6">Insights</TabsTrigger>
              <TabsTrigger value="model" className="text-xs h-6 flex items-center gap-1">
                <BrainCircuit className="h-3 w-3" />
                Model
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-0">
              <div className="space-y-1.5 pl-0.5">
                {sortedSources.map((source, i) => (
                  <div key={i} className="flex items-center gap-1.5 group">
                    <div className="flex items-center">
                      {source.type === 'web' ? (
                        <Globe className="h-3.5 w-3.5 text-sky-500" />
                      ) : (
                        renderSourceIcon(source)
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground flex-1 min-w-0">
                      <span className="truncate">
                        {source.title || source.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {source.similarity !== null && source.similarity !== undefined && (
                        <Badge variant="outline"
                          className={`ml-1 h-5 text-xs ${getRelevanceColor(source.similarity)}`}>
                          {Math.round(source.similarity)}%
                        </Badge>
                      )}
                      
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 opacity-80 hover:opacity-100"
                        >
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover:opacity-80"
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 text-xs p-3">
                          <div className="space-y-2">
                            <h4 className="font-medium">Source Details</h4>
                            <div className="space-y-1">
                              <div><span className="text-muted-foreground">Type:</span> {source.type}</div>
                              {source.fileType && <div><span className="text-muted-foreground">Format:</span> {source.fileType.toUpperCase()}</div>}
                              {source.similarity && <div><span className="text-muted-foreground">Relevance:</span> {source.similarity.toFixed(1)}%</div>}
                              {source.excerpt && (
                                <div className="mt-2">
                                  <div className="text-muted-foreground mb-1">Excerpt:</div>
                                  <div className="text-xs bg-muted/30 p-2 rounded border">
                                    {source.excerpt}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-2 gap-2">
                {sortedSources.map((source, i) => (
                  <div
                    key={i}
                    className="border rounded-md p-2 text-xs hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {source.type === 'web' ? (
                          <Globe className="h-3.5 w-3.5 text-sky-500" />
                        ) : (
                          renderSourceIcon(source)
                        )}
                        <span className="font-medium truncate max-w-[120px]">
                          {source.title || "Document"}
                        </span>
                      </div>
                      
                      {source.similarity !== null && source.similarity !== undefined && (
                        <Badge variant="outline"
                          className={`h-4 text-[10px] px-1 ${getRelevanceColor(source.similarity)}`}>
                          {Math.round(source.similarity)}%
                        </Badge>
                      )}
                    </div>
                    
                    {source.excerpt && (
                      <div className="text-[10px] opacity-80 line-clamp-2 mt-1">
                        {source.excerpt}
                      </div>
                    )}
                    
                    {source.url && (
                      <div className="mt-1.5 flex justify-end">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 text-[10px] flex items-center gap-0.5"
                        >
                          View source <ArrowUpRight className="h-2 w-2" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Average relevance</span>
                    <span className="text-xs font-medium">{Math.round(averageRelevance)}%</span>
                  </div>
                  <Progress value={averageRelevance} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-medium flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Web Sources
                    </h4>
                    <div className="text-2xl font-semibold">{webSources.length}</div>
                    {webSources.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Avg. relevance: {Math.round(webSources.reduce((acc, s) => acc + (s.similarity || 0), 0) / webSources.length)}%
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-medium flex items-center gap-1.5">
                      <FileType className="h-3.5 w-3.5" /> Document Sources
                    </h4>
                    <div className="text-2xl font-semibold">{documentSources.length}</div>
                    {documentSources.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Avg. relevance: {Math.round(documentSources.reduce((acc, s) => acc + (s.similarity || 0), 0) / documentSources.length)}%
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 text-xs flex items-center gap-1.5 text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Higher relevance indicates more confidence in the retrieved context.</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="model" className="mt-0">
              <div className="p-1 border rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <BrainCircuit className="h-4 w-4 text-primary" />
                    <span className="font-medium text-xs">Embedding Model</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    Hugging Face
                  </Badge>
                </div>
                
                <div className="text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium">BGE Small</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="font-medium">384</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Similarity Method</span>
                    <span className="font-medium">Cosine</span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm" className="w-full text-xs h-7 flex items-center justify-center gap-1.5">
                      <BrainCircuit className="h-3.5 w-3.5" />
                      Configure Embedding Model
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
