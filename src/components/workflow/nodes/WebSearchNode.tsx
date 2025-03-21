import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { Search, Globe, FileText, List, SortAsc } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const WebSearchNode = memo(({ id, data, isConnectable, selected }: NodeProps) => {
  // Format the query for display
  const queryPreview = data.query ? 
    (data.query.length > 60 ? `${data.query.substring(0, 60)}...` : data.query) 
    : 'No query defined';
  
  // Define the search provider
  const getSearchProvider = () => {
    if (data.provider) {
      return data.provider;
    }
    
    // Infer from engine or default to "Web"
    if (data.engine === 'duckduckgo') return 'DuckDuckGo';
    if (data.engine === 'googlecse') return 'Google CSE';
    if (data.engine === 'serp') return 'SERP API';
    if (data.engine === 'brave') return 'Brave Search';
    
    return 'Web';
  };
  
  // Get provider color
  const getProviderColor = (provider: string) => {
    const lowerProvider = provider.toLowerCase();
    
    if (lowerProvider.includes('google')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (lowerProvider.includes('duck') || lowerProvider.includes('ddg')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (lowerProvider.includes('brave')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (lowerProvider.includes('serp')) return 'bg-green-50 text-green-700 border-green-200';
    
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };
  
  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      selected={selected}
      icon={<Globe className="h-4 w-4 text-blue-500" />}
      color="bg-blue-50"
    >
      <div className="space-y-3">
        {/* Search provider info */}
        <div className="flex items-center justify-between mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`${getProviderColor(getSearchProvider())} px-1.5 py-0 text-xs font-normal`}
                >
                  {getSearchProvider()}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search Provider: {getSearchProvider()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <List className="h-3.5 w-3.5 mr-1" />
                    <span>{data.resultCount || 5} results</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Returns {data.resultCount || 5} search results</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Search query preview */}
        <div className="flex items-start gap-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium mb-1">Search Query</p>
            <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
              {queryPreview}
            </p>
          </div>
        </div>
        
        {/* Additional settings if available */}
        {(data.filters || data.sort) && (
          <div className="mt-2 border-t pt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <SortAsc className="h-3.5 w-3.5" />
              <span>
                {data.filters && data.sort 
                  ? 'Custom filters and sorting' 
                  : data.filters 
                    ? 'Custom filters applied' 
                    : 'Custom sorting applied'}
              </span>
            </div>
          </div>
        )}
        
        {/* Results preview (if execution completed and has output) */}
        {data.isCompleted && data.output && data.output.results && (
          <div className="mt-2 border-t pt-2">
            <p className="text-xs font-medium mb-1 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Search Results
            </p>
            <div className="text-xs text-muted-foreground">
              {Array.isArray(data.output.results) && (
                <span>{data.output.results.length} results found</span>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});

WebSearchNode.displayName = 'WebSearchNode';