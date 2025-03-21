import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { BotIcon, BrainIcon, MemoryStickIcon, DatabaseIcon } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { Badge } from '@/components/ui/badge';

export const AgentNode = memo(({ id, data, isConnectable, selected }: NodeProps) => {
  const agentName = data.name || 'AI Agent';
  const model = data.model || 'gpt-4';
  const skills = data.skills || [];
  
  // Determine if this is an OpenRouter model
  const isOpenRouterModel = model.startsWith('openrouter/');
  const modelDisplayName = isOpenRouterModel 
    ? model.replace('openrouter/', '') 
    : model;
  
  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      selected={selected}
      icon={<BotIcon className="h-4 w-4" />}
      color="bg-cyan-50"
    >
      <div className="text-xs flex flex-col gap-1">
        <div className="flex items-center">
          <span className="font-medium">Agent:</span>
          <span className="ml-2 truncate max-w-[120px]">{agentName}</span>
        </div>
        
        <div className="flex items-center">
          <span className="font-medium">Model:</span>
          <span className="ml-2 truncate max-w-[120px]">{modelDisplayName}</span>
        </div>
        
        <div className="flex gap-1 mt-0.5 flex-wrap">
          {isOpenRouterModel && (
            <Badge variant="outline" className="px-1 py-0 text-[8px] bg-blue-50 text-blue-700 border-blue-200">
              OpenRouter
            </Badge>
          )}
          
          {skills.map((skill: string, index: number) => (
            <Badge key={index} variant="outline" className="px-1 py-0 text-[8px]">
              {skill}
            </Badge>
          ))}
        </div>
        
        {data.description && (
          <div className="mt-1">
            <span className="font-medium block mb-1">Description:</span>
            <div className="bg-muted rounded p-1.5 text-[10px] max-h-20 overflow-y-auto">
              {data.description.length > 100
                ? `${data.description.substring(0, 100)}...`
                : data.description}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});

AgentNode.displayName = 'AgentNode';