import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { Database, Archive, FileText, Book, FileSearch, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const RAGNode = memo(({ id, data, isConnectable, selected }: NodeProps) => {
  // Get retrieval method display
  const getRetrievalMethod = () => {
    const method = data.retrievalMethod || 'similarity';
    
    switch (method.toLowerCase()) {
      case 'similarity':
      case 'cosine':
        return 'Similarity Search';
      case 'mmr':
        return 'MMR';
      case 'hybrid':
        return 'Hybrid Search';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };
  
  // Get data source display
  const getDataSource = () => {
    if (data.dataSourceType) return data.dataSourceType;
    if (data.documentStore) return data.documentStore;
    
    return 'Document Store';
  };
  
  // Get data source color
  const getDataSourceColor = (source: string) => {
    const lowerSource = source.toLowerCase();
    
    if (lowerSource.includes('lance')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (lowerSource.includes('chroma')) return 'bg-green-50 text-green-700 border-green-200';
    if (lowerSource.includes('pinecone')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (lowerSource.includes('qdrant')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (lowerSource.includes('weaviate')) return 'bg-blue-50 text-blue-700 border-blue-200';
    
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };
  
  // Show document count
  const documentCount = data.documents?.length || data.documentCount || 0;
  
  // Format document list for display
  const documentListPreview = () => {
    if (!data.documents || data.documents.length === 0) {
      return <span className="italic">No documents specified</span>;
    }
    
    const displayCount = Math.min(data.documents.length, 3);
    const hasMore = data.documents.length > 3;
    
    return (
      <div className="space-y-1">
        {data.documents.slice(0, displayCount).map((doc: any, index: number) => (
          <div key={index} className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{doc.title || doc.name || doc.id || `Document ${index + 1}`}</span>
          </div>
        ))}
        {hasMore && (
          <div className="text-muted-foreground">
            + {data.documents.length - displayCount} more documents
          </div>
        )}
      </div>
    );
  };
  
  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      selected={selected}
      icon={<Database className="h-4 w-4 text-purple-500" />}
      color="bg-purple-50"
    >
      <div className="space-y-3">
        {/* Data source info */}
        <div className="flex items-center justify-between mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`${getDataSourceColor(getDataSource())} px-1.5 py-0 text-xs font-normal`}
                >
                  {getDataSource()}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Data Source: {getDataSource()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <FileSearch className="h-3.5 w-3.5 mr-1" />
                    <span>{getRetrievalMethod()}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Retrieval Method: {getRetrievalMethod()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Document count/list */}
        <div className="flex items-start gap-2">
          <Archive className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center">
              <p className="text-xs font-medium mb-1">Documents</p>
              {documentCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 text-xs">
                  {documentCount}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {documentListPreview()}
            </div>
          </div>
        </div>
        
        {/* Retrieval parameters */}
        <div className="flex items-start gap-2">
          <Settings className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium mb-1">Retrieval Parameters</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              <div>Top K: {data.topK || 3}</div>
              {data.similarityThreshold && (
                <div>Threshold: {data.similarityThreshold}%</div>
              )}
              {data.chunkSize && (
                <div>Chunk size: {data.chunkSize}</div>
              )}
              {data.chunkOverlap && (
                <div>Chunk overlap: {data.chunkOverlap}</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Results preview (if execution completed and has output) */}
        {data.isCompleted && data.output && data.output.documents && (
          <div className="mt-2 border-t pt-2">
            <p className="text-xs font-medium mb-1 flex items-center">
              <Book className="h-3.5 w-3.5 mr-1" />
              Retrieved Documents
            </p>
            <div className="text-xs text-muted-foreground">
              {Array.isArray(data.output.documents) && (
                <span>{data.output.documents.length} documents retrieved</span>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});

RAGNode.displayName = 'RAGNode';