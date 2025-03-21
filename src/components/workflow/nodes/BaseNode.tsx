import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, CheckCircle, AlertCircle, Loader2, Clock, TerminalSquare, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BaseNodeProps {
  id: string;
  data: any;
  isConnectable?: boolean;
  selected?: boolean;
  icon?: React.ReactNode;
  color?: string;
  handles?: {
    inputs?: boolean;
    outputs?: boolean;
    inputPositions?: Position[];
    outputPositions?: Position[];
  };
  children?: React.ReactNode;
}

export const BaseNode = memo(({ 
  id, 
  data, 
  isConnectable, 
  selected,
  icon,
  color = 'bg-gray-100',
  handles = { inputs: true, outputs: true },
  children 
}: BaseNodeProps) => {
  const [showOutput, setShowOutput] = useState(false);
  
  // Determine the execution state badge color and content
  const getExecutionBadge = () => {
    if (data.isRunning) {
      return {
        content: 'Running',
        variant: 'default',
        icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      };
    }
    if (data.isCompleted) {
      return {
        content: 'Completed',
        variant: 'success',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      };
    }
    if (data.isError) {
      return {
        content: 'Error',
        variant: 'destructive',
        icon: <AlertCircle className="h-3 w-3 mr-1" />
      };
    }
    return {
      content: 'Ready',
      variant: 'outline',
      icon: <Clock className="h-3 w-3 mr-1" />
    };
  };
  
  const executionBadge = getExecutionBadge();
  const hasOutput = data.output && Object.keys(data.output).length > 0;
  
  // Render a preview of the node output (if available)
  const renderOutputPreview = () => {
    if (!hasOutput) return null;
    
    let outputContent;
    
    try {
      if (typeof data.output === 'string') {
        outputContent = data.output.length > 100 
          ? `${data.output.substring(0, 100)}...` 
          : data.output;
      } else {
        outputContent = JSON.stringify(data.output, null, 2);
        if (outputContent.length > 100) {
          outputContent = `${outputContent.substring(0, 100)}...`;
        }
      }
    } catch (e) {
      outputContent = "Error displaying output";
    }
    
    return (
      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono overflow-x-auto max-h-[100px]">
        {outputContent}
      </div>
    );
  };
  
  return (
    <div
      className={cn(
        'rounded-lg border shadow-sm min-w-[200px] max-w-[300px] transition-all duration-200',
        selected ? 'ring-2 ring-primary shadow-md' : 'hover:ring-1 hover:ring-primary/50',
        'bg-background',
        data.isRunning && 'border-blue-400 shadow-blue-100',
        data.isCompleted && 'border-green-400 shadow-green-100',
        data.isError && 'border-red-400 shadow-red-100',
      )}
    >
      {/* Node header */}
      <div 
        className={cn(
          'flex items-center gap-2 p-3 rounded-t-lg border-b',
          color,
          data.isRunning && 'bg-blue-50/50',
          data.isCompleted && 'bg-green-50/50',
          data.isError && 'bg-red-50/50',
        )}
      >
        {icon && (
          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/50 border shadow-sm">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium truncate">{data.label || 'Node'}</p>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant={executionBadge.variant as any} 
                    className={cn(
                      "ml-1 text-xs font-normal flex items-center", 
                      executionBadge.variant === 'outline' && 'opacity-60'
                    )}
                  >
                    {executionBadge.icon}
                    {executionBadge.content}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {data.isRunning && "Node is currently executing"}
                  {data.isCompleted && "Execution completed successfully"}
                  {data.isError && "Execution failed with an error"}
                  {!data.isRunning && !data.isCompleted && !data.isError && "Node is ready for execution"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {data.description && (
            <p className="text-xs text-muted-foreground truncate">{data.description}</p>
          )}
        </div>
      </div>
      
      {/* Node content */}
      {children && (
        <div className="p-3 text-sm">
          {children}
        </div>
      )}
      
      {/* Error message */}
      {data.errorMessage && data.isError && (
        <div className="px-3 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-600 break-words">{data.errorMessage}</p>
          </div>
        </div>
      )}
      
      {/* Execution output */}
      {hasOutput && (
        <div className="border-t">
          <button
            onClick={() => setShowOutput(!showOutput)}
            className={cn(
              "w-full px-3 py-1.5 flex items-center text-xs text-muted-foreground hover:bg-gray-50",
              showOutput && "bg-gray-50"
            )}
          >
            {showOutput ? (
              <ChevronDown className="h-3.5 w-3.5 mr-1" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 mr-1" />
            )}
            <TerminalSquare className="h-3.5 w-3.5 mr-1" />
            Output
          </button>
          
          {showOutput && (
            <div className="px-3 py-2 max-h-[150px] overflow-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                {typeof data.output === 'string' 
                  ? data.output 
                  : JSON.stringify(data.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      {/* Node actions */}
      {data.allowManualExecution && !data.isRunning && (
        <div className="border-t p-2 flex justify-end">
          <button
            className="px-2 py-1 text-xs rounded border bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (data.onExecute) data.onExecute();
            }}
          >
            <Play className="h-3 w-3" />
            Execute
          </button>
        </div>
      )}
      
      {/* Connection handles */}
      {handles.inputs && (
        <Handle
          type="target"
          position={Position.Left}
          id="in"
          isConnectable={isConnectable}
          className="w-3 h-3 border-2 !bg-background"
        />
      )}
      
      {/* Additional input handles if specified */}
      {handles.inputPositions?.map((position, index) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={position}
          id={`in-${index}`}
          isConnectable={isConnectable}
          className="w-3 h-3 border-2 !bg-background"
        />
      ))}
      
      {handles.outputs && (
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          isConnectable={isConnectable}
          className="w-3 h-3 border-2 !bg-background"
        />
      )}
      
      {/* Additional output handles if specified */}
      {handles.outputPositions?.map((position, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={position}
          id={`out-${index}`}
          isConnectable={isConnectable}
          className="w-3 h-3 border-2 !bg-background"
        />
      ))}
    </div>
  );
});

BaseNode.displayName = 'BaseNode';