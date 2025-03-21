import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { BrainCircuit, Sparkles, Settings, MessageSquare, Thermometer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ModelBadge = ({ model }: { model: string }) => {
  // Return color based on model family
  const getModelColor = (model: string) => {
    if (model.toLowerCase().includes('gpt-4')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (model.toLowerCase().includes('gpt-3.5')) return 'bg-green-50 text-green-700 border-green-200';
    if (model.toLowerCase().includes('claude')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (model.toLowerCase().includes('gemini')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (model.toLowerCase().includes('llama')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (model.toLowerCase().includes('mistral')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${getModelColor(model)} px-1.5 py-0 text-xs font-normal`}
          >
            {model}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>LLM Model: {model}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const LLMNode = memo(({ id, data, isConnectable, selected }: NodeProps) => {
  // Format the prompt for display
  const promptPreview = data.prompt ? 
    (data.prompt.length > 50 ? `${data.prompt.substring(0, 50)}...` : data.prompt) 
    : 'No prompt defined';
  
  // Show truncated prompt input
  const renderPromptPreview = () => {
    return (
      <div className="flex items-start gap-2 group">
        <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs font-medium mb-1">Prompt</p>
          <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
            {promptPreview}
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      selected={selected}
      icon={<Sparkles className="h-4 w-4 text-indigo-500" />}
      color="bg-indigo-50"
    >
      <div className="space-y-3">
        {/* Model info */}
        <div className="flex items-center justify-between mb-2">
          <ModelBadge model={data.model || 'gpt-4'} />
          
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Thermometer className="h-3.5 w-3.5 mr-1" />
                    <span>{data.temperature || '0.7'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Temperature: {data.temperature || '0.7'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Prompt Preview */}
        {renderPromptPreview()}
        
        {/* Additional Parameters Preview (optional) */}
        {(data.maxTokens || data.topP || data.frequencyPenalty || data.presencePenalty) && (
          <div className="mt-2 border-t pt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Settings className="h-3.5 w-3.5" />
              <span>Additional parameters configured</span>
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});

LLMNode.displayName = 'LLMNode';