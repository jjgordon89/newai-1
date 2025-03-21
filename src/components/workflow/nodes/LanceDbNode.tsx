import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Database, Bot, BarChart3, Search } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { Badge } from "@/components/ui/badge";

export const LanceDbNode = memo(({ id, data, isConnectable, selected }: NodeProps) => {
  const retrievalMethod = data.retrievalMethod || 'hybrid';
  const topK = data.topK || 3;
  const threshold = data.similarityThreshold || 70;
  
  // Get document count
  const documentCount = data.documents?.length || 0;
  
  // Get feature labels
  const getFeatureLabel = (enabled: boolean | undefined, label: string) => {
    if (enabled === false) return null;
    return <Badge variant="outline" className="bg-primary/10 text-primary text-xs ml-1">{label}</Badge>;
  };
  
  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      selected={selected}
      icon={<Database className="h-4 w-4" />}
      color="bg-blue-50"
    >
      <div className="text-xs flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Search className="h-3 w-3 mr-1 text-blue-600" />
            <span className="font-medium">Search:</span>
          </div>
          <div className="flex items-center">
            {retrievalMethod === 'semantic' ? 'Semantic' : 
             retrievalMethod === 'keyword' ? 'Keyword' : 'Hybrid'}
            {retrievalMethod === 'hybrid' && 
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 text-xs ml-1">Enhanced</Badge>
            }
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-3 w-3 mr-1 text-amber-600" />
            <span className="font-medium">Results:</span>
          </div>
          <div className="flex items-center">
            Top {topK} • {threshold}% min
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-3 w-3 mr-1 text-purple-600" />
            <span className="font-medium">Features:</span>
          </div>
          <div className="flex items-center flex-wrap justify-end">
            {getFeatureLabel(data.enhancedContext, "Context")}
            {getFeatureLabel(data.useQueryExpansion, "Expansion")}
            {getFeatureLabel(data.generateCitations, "Citations")}
          </div>
        </div>
        
        <div className="mt-1 bg-muted/50 rounded px-2 py-1.5 text-center">
          {documentCount > 0
            ? `${documentCount} document${documentCount !== 1 ? 's' : ''} selected`
            : "No documents selected"}
        </div>
      </div>
    </BaseNode>
  );
});

LanceDbNode.displayName = 'LanceDbNode';